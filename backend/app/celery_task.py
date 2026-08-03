from celery import Celery
from app.core.mail import mail, create_message
from asgiref.sync import async_to_sync
import asyncio

c_app = Celery()

c_app.config_from_object('app.core.config')


@c_app.task()
def send_mail(recipient: str, subject: str, body: str):
    message = create_message(recipients=[recipient], subject=subject, body=body)
    async_to_sync(mail.send_message)(message)


@c_app.task(bind=True, max_retries=3, default_retry_delay=60)
def ingest_gmail_for_user(self, user_id: str, after_date: str = "2026/07/25"):
    """
    Offloads the entire Gmail ingestion pipeline to a Celery worker.

    Steps:
      1. Open a fresh AsyncSession (independent of FastAPI's request lifecycle).
      2. Fetch & refresh the user's Google OAuth credentials from Postgres.
      3. Build a Gmail API client.
      4. Search bank-sender emails, parse each one, and save transactions.

    Args:
        user_id:    UUID string of the user whose Gmail should be ingested.
        after_date: Gmail date filter, e.g. "2026/07/01".
    """
    from app.db.session import AsyncSessionLocal
    from app.api.gmail.gmail_service import gmail_service
    from app.api.gmail.gmail_routes import parsers

    async def _run():
        async with AsyncSessionLocal() as db:
            gmail_client = await gmail_service.get_gmail_client(db, user_id=user_id)
            result = await gmail_service.parse_and_save(
                db=db,
                user_id=user_id,
                gmail_client=gmail_client,
                parsers=parsers,
                after_date=after_date,
            )
            return result

    try:
        return asyncio.run(_run())
    except Exception as exc:
        raise self.retry(exc=exc)


