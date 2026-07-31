"""
Federal Bank credit card transaction alert parser.
Tested against a real Federal Bank alert email.

Sender: fedmail@federal.bank.in
Subject: "Transaction Alert" (no useful info in the subject itself --
          unlike Axis/HDFC, the card number isn't in the subject either)

IMPORTANT QUIRKS specific to Federal Bank:
1. The text/plain part is a placeholder ("this email is sent in HTML
   format...") -- it does NOT contain the real transaction data. You
   must always use the text/html part for this bank, never text/plain.
2. There is no card number anywhere in this email template at all --
   card_last4 will always be None for this parser. If you have more
   than one Federal Bank card connected for the same user, you cannot
   disambiguate which card a transaction belongs to from this email
   alone -- worth deciding now how you want to handle that (e.g. only
   support ingestion for users with exactly one Federal Bank card, or
   ask the user to confirm/assign transactions with no card_last4).

Email types handled:
- Debit/spend alert: "You have spent Rs. INR X.XX at MERCHANT on DATE"
- Foreign currency debit: "You have spent Rs. USD X.XX at MERCHANT on DATE"
- Payment/credit alert: "Thank you for your payment of Rs X.XX towards your credit card"
- Non-transaction emails (statements, promos, HTML-only): returns None -- caller should skip
"""
import re
from datetime import datetime

# Sentinel returned when the email is not a parseable transaction.
# The caller in gmail_routes should check for None and count as skipped.
NOT_A_TRANSACTION = None


def strip_html_tags(html: str) -> str:
    """
    Good enough for simple bank alert HTML (no nested tables of data to
    preserve structure from) -- not a general-purpose HTML parser.
    """
    text = re.sub(r"<[^>]+>", " ", html)
    text = text.replace("&amp;", "&")
    return re.sub(r"[\s\u00a0\ufffd]+", " ", text).strip()


def _is_transaction_email(clean: str) -> bool:
    """Quick guard: does this cleaned body look like any known transaction alert?"""
    return bool(
        re.search(r"spent\s+Rs\.?\s*(INR|USD|EUR|GBP|AED)", clean, re.I)
        or re.search(r"payment\s+of\s+Rs\s+[\d,]+", clean, re.I)
    )


def parse_federal(html_body: str) -> dict | None:
    """
    Extract transaction data from a Federal Bank email.

    Returns a dict on success, or None if the email is not a
    transaction alert (statement, promo, HTML-only template, etc.).
    Raises ValueError only for emails that look like transactions but
    whose fields cannot be extracted — those represent genuine parser gaps.
    """
    clean = strip_html_tags(html_body)

    # --- Guard: skip non-transaction emails silently ---
    if not _is_transaction_email(clean):
        return NOT_A_TRANSACTION

    # ------------------------------------------------------------------ #
    # 1. Debit / spend alert
    #    "You have spent Rs. INR 1,234.56 at MERCHANT on 01-07-2026"
    #    "You have spent Rs. USD 5.90 at Openai on 30-05-2026"
    # ------------------------------------------------------------------ #
    spend_amount_match = re.search(
        r"spent\s+Rs\.?\s*(INR|USD|EUR|GBP|AED)\s*([\d,]+\.?\d*)", clean, re.I
    )
    merchant_match = re.search(r"at\s+(.+?)\s+on\s+\d{2}-\d{2}-\d{4}", clean)
    date_match = re.search(r"on\s+(\d{2}-\d{2}-\d{4})", clean)

    if spend_amount_match and merchant_match and date_match:
        currency = spend_amount_match.group(1).upper()
        raw_amount = spend_amount_match.group(2).replace(",", "")
        amount = float(raw_amount)

        merchant_raw = merchant_match.group(1).strip()
        # Strip leading terminal/merchant code (e.g. "620842249393 mukesh")
        merchant_clean = re.sub(r"^\d+\s+", "", merchant_raw)

        transaction_date = datetime.strptime(date_match.group(1), "%d-%m-%Y").date()

        return {
            "bank_name": "Federal Bank",
            "card_name": "Federal Bank Credit Card",
            "txn_type": "debit",
            "amount": amount,
            "currency": currency,
            "merchant": merchant_clean,
            "merchant_raw": merchant_raw,
            "card_last4": None,
            "transaction_date": transaction_date,
            "transaction_time": None,
        }

    # ------------------------------------------------------------------ #
    # 2. Payment / credit alert
    #    "Thank you for your payment of Rs 1,656.00 towards your credit card"
    # ------------------------------------------------------------------ #
    payment_match = re.search(
        r"payment\s+of\s+Rs\s+([\d,]+\.?\d*)\s+towards\s+your\s+credit\s+card",
        clean,
        re.I,
    )
    # Payment emails sometimes carry a card suffix like "ending with xx2693"
    card_last4_match = re.search(r"ending\s+with\s+(?:xx)?(\d{4})", clean, re.I)
    # Payment emails don't have a merchant/date in the same line format;
    # use a loose date search as a best-effort.
    payment_date_match = re.search(r"(\d{2}-\d{2}-\d{4})", clean)

    if payment_match:
        amount = float(payment_match.group(1).replace(",", ""))
        card_last4 = card_last4_match.group(1) if card_last4_match else None
        # Payment emails don't include a date in the body; fall back to
        # today so we never violate the NOT NULL constraint on transaction_date.
        transaction_date = (
            datetime.strptime(payment_date_match.group(1), "%d-%m-%Y").date()
            if payment_date_match
            else datetime.today().date()
        )

        return {
            "bank_name": "Federal Bank",
            "card_name": "Federal Bank Wave Credit Card",
            "txn_type": "credit",
            "amount": amount,
            "currency": "INR",
            "merchant": "Federal Bank Payment",
            "merchant_raw": "Federal Bank Payment",
            "card_last4": card_last4,
            "transaction_date": transaction_date,
            "transaction_time": None,
        }

    # ------------------------------------------------------------------ #
    # Looked like a transaction email but we couldn't extract fields.
    # ------------------------------------------------------------------ #
    raise ValueError(
        f"Could not parse all fields from Federal Bank email body: {clean[:200]}"
    )