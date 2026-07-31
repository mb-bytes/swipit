import base64
import email
import logging
from email import policy
from sqlalchemy.ext.asyncio import AsyncSession
from googleapiclient.discovery import build
from app.api.users.google_service import GoogleService

logger = logging.getLogger("ingestion")

def ingestion_failure(message_id: str, sender: str, error: str):
    logger.warning(f"Failed to parse message {message_id} from {sender}: {error}")

class GmailService:
    async def get_gmail_client(self, db: AsyncSession, user_id):
        """
        Builds an authenticated Gmail API client for this user, reusing
        GoogleService's token refresh logic rather than duplicating it.
        """
        google_service = GoogleService()
        creds = await google_service.get_valid_credentials(db, user_id=user_id)
        return build("gmail", "v1", credentials=creds)

    def search_bank_emails(self, gmail_client, sender: str, after_date: str):
        query = f"from:{sender} after:{after_date}"
        results = gmail_client.users().messages().list(
            userId="me", q=query, maxResults=50
        ).execute()
        return results.get("messages", [])

    def fetch_raw_message(self, gmail_client, message_id: str) -> bytes:
        """Fetch a message in raw RFC822 form -- needed for parse_axis/parse_federal,
        which rely on Python's email library to correctly undo quoted-printable
        encoding (something the parts-based extract_body below does NOT do)."""
        full_msg = gmail_client.users().messages().get(
            userId="me", id=message_id, format="raw"
        ).execute()
        return base64.urlsafe_b64decode(full_msg["raw"])

    def extract_body(self, message: dict) -> str:
        """Parts-based extraction from format='full' messages. Only base64-decodes --
        does NOT undo quoted-printable, so prefer fetch_raw_message + extract_best_body
        for any bank whose emails use quoted-printable (Axis, Federal, likely others)."""
        payload = message["payload"]
        parts = payload.get("parts", [payload])
        for part in parts:
            if part["mimeType"] == "text/plain":
                data = part["body"]["data"]
                return base64.urlsafe_b64decode(data).decode("utf-8")
        for part in parts:
            if part["mimeType"] == "text/html":
                data = part["body"]["data"]
                return base64.urlsafe_b64decode(data).decode("utf-8")
        return ""

    def extract_plain_text_body(self, raw_bytes: bytes) -> str | None:
        """Use with fetch_raw_message's output -- properly undoes quoted-printable."""
        msg = email.message_from_bytes(raw_bytes, policy=policy.default)
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                charset = part.get_content_charset() or "utf-8"
                return part.get_payload(decode=True).decode(charset, errors="replace")
        return None

    def extract_html_body(self, raw_bytes: bytes) -> str | None:
        """Use with fetch_raw_message's output -- properly undoes quoted-printable."""
        msg = email.message_from_bytes(raw_bytes, policy=policy.default)
        for part in msg.walk():
            if part.get_content_type() == "text/html":
                charset = part.get_content_charset() or "utf-8"
                return part.get_payload(decode=True).decode(charset, errors="replace")
        return None

    def extract_best_body(self, raw_bytes: bytes) -> tuple[str, str]:
        """
        Returns (body_text, body_type) where body_type is "plain" or "html".
        Falls back to HTML if the plain-text part looks like a placeholder
        (too short to contain real transaction details, or explicitly says
        to view in HTML -- as Federal Bank's alerts do).
        """
        plain = self.extract_plain_text_body(raw_bytes)
        if plain and len(plain) > 100 and "html format" not in plain.lower():
            return plain, "plain"
        html = self.extract_html_body(raw_bytes)
        return html, "html"

gmail_service = GmailService()