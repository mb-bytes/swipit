import re
from datetime import datetime


def parse_axis(body: str) -> dict | None:
    """
    Extract merchant, amount, last-4, and date/time from an Axis Bank
    credit card transaction alert's plain-text body.

    Returns None for non-transaction emails (HTML-only templates, promos,
    OTPs, fund transfer limits, registrations, AutoPay, etc.) so the
    caller can count them as skipped rather than failed.
    """
    # Collapse all whitespace variants (normal space, non-breaking space,
    # decode-error placeholder, tabs, newlines) into single spaces so the
    # label-based regexes below don't break on inconsistent formatting.
    clean = re.sub(r"[\s\u00a0\ufffd]+", " ", body)

    # ------------------------------------------------------------------ #
    # Guard: skip non-transaction emails silently
    # ------------------------------------------------------------------ #
    # HTML-only emails that don't contain transaction keywords
    if body.lstrip().startswith("<") and "Transaction Amount" not in clean:
        return None

    # Known non-transaction alert types from Axis Bank
    NON_TXN_PHRASES = [
        "One-Time Password",
        "OTP to complete",
        "fund transfer limit",
        "successfully registered for Axis Bank Internet Banking",
        "transaction limit of INR",
        "credit card application",
        "Did you miss completing",
    ]
    for phrase in NON_TXN_PHRASES:
        if phrase.lower() in clean.lower():
            return None

    # AutoPay confirmation emails — different layout, skip for now
    if "AutoPay transaction" in clean or "AutoPay ID" in clean:
        return None

    # ------------------------------------------------------------------ #
    # Standard transaction alert parsing
    # ------------------------------------------------------------------ #
    amount_match = re.search(r"Transaction Amount:\s*INR\s*([\d,]+(?:\.\d+)?)", clean)
    merchant_match = re.search(r"Merchant Name:\s*(.+?)\s+Axis Bank Credit Card No\.", clean)
    last4_match = re.search(r"Axis Bank Credit Card No\.\s*XX(\d{4})", clean)
    dt_match = re.search(r"Date & Time:\s*([\d-]+),\s*([\d:]+)\s*IST", clean)

    if not (amount_match and merchant_match and last4_match and dt_match):
        raise ValueError(f"Could not parse all fields from Axis email body: {clean[:200]}")

    date_str = dt_match.group(1)
    time_str = dt_match.group(2)

    # Handle both 4-digit year (07-07-2026) and 2-digit year (07-07-26)
    for fmt in ("%d-%m-%Y %H:%M:%S", "%d-%m-%y %H:%M:%S"):
        try:
            transaction_datetime = datetime.strptime(f"{date_str} {time_str}", fmt)
            break
        except ValueError:
            continue
    else:
        raise ValueError(
            f"Could not parse date/time '{date_str} {time_str}' from Axis email"
        )

    return {
        "bank_name": "Axis Bank",
        "card_name": "Axis Bank Credit Card",
        "amount": float(amount_match.group(1).replace(",", "")),
        "merchant": merchant_match.group(1).strip(),
        "card_last4": last4_match.group(1),
        "transaction_date": transaction_datetime.date(),
        "transaction_time": transaction_datetime.time(),
    }
