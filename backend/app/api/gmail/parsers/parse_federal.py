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
"""
import re
from datetime import datetime


def strip_html_tags(html: str) -> str:
    """
    Good enough for simple bank alert HTML (no nested tables of data to
    preserve structure from) -- not a general-purpose HTML parser.
    """
    text = re.sub(r"<[^>]+>", " ", html)
    text = text.replace("&amp;", "&")
    return re.sub(r"[\s\u00a0\ufffd]+", " ", text).strip()


def parse_federal(html_body: str) -> dict:
    """
    Extract merchant, amount, and date from a Federal Bank transaction
    alert. Always pass the text/html body -- see module docstring.
    """
    clean = strip_html_tags(html_body)

    amount_match = re.search(r"spent\s+INR\s*([\d,]+\.\d{2})", clean)
    merchant_match = re.search(r"at\s+(.+?)\s+on\s+\d{2}-\d{2}-\d{4}", clean)
    date_match = re.search(r"on\s+(\d{2}-\d{2}-\d{4})", clean)

    if not (amount_match and merchant_match and date_match):
        raise ValueError(f"Could not parse all fields from Federal Bank email body: {clean[:200]}")

    merchant_raw = merchant_match.group(1).strip()
    # Merchant descriptor often carries a leading numeric terminal/merchant
    # code (e.g. "620842249393 mukesh") -- strip it for a readable name,
    # but keep the raw version too in case you need it later.
    merchant_clean = re.sub(r"^\d+\s+", "", merchant_raw)

    transaction_date = datetime.strptime(date_match.group(1), "%d-%m-%Y").date()

    return {
        "bank_name": "Federal Bank",
        "amount": float(amount_match.group(1).replace(",", "")),
        "merchant": merchant_clean,
        "merchant_raw": merchant_raw,
        "card_last4": None,
        "transaction_date": transaction_date,
    }