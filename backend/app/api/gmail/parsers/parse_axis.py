import re
import email
from email import policy
from datetime import datetime

def parse_axis(body: str) -> dict:
    """
    Extract merchant, amount, last-4, and date/time from an Axis Bank
    credit card transaction alert's plain-text body.
    """
    # Collapse all whitespace variants (normal space, non-breaking space,
    # decode-error placeholder, tabs, newlines) into single spaces so the
    # label-based regexes below don't break on inconsistent formatting.
    clean = re.sub(r"[\s\u00a0\ufffd]+", " ", body)

    amount_match = re.search(r"Transaction Amount:\s*INR\s*([\d,]+(?:\.\d+)?)", clean)
    merchant_match = re.search(r"Merchant Name:\s*(.+?)\s+Axis Bank Credit Card No\.", clean)
    last4_match = re.search(r"Axis Bank Credit Card No\.\s*XX(\d{4})", clean)
    dt_match = re.search(r"Date & Time:\s*([\d-]+),\s*([\d:]+)\s*IST", clean)

    if not (amount_match and merchant_match and last4_match and dt_match):
        raise ValueError(f"Could not parse all fields from Axis email body: {clean[:200]}")

    transaction_datetime = datetime.strptime(
        f"{dt_match.group(1)} {dt_match.group(2)}", "%d-%m-%Y %H:%M:%S"
    )

    return {
        "bank_name": "Axis Bank",
        "amount": float(amount_match.group(1).replace(",", "")),
        "merchant": merchant_match.group(1).strip(),
        "card_last4": last4_match.group(1),
        "transaction_date": transaction_datetime.date(),
        "transaction_time": transaction_datetime.time(),
    }
