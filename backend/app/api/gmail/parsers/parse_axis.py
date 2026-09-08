import re
from datetime import datetime

def strip_html_tags(html: str) -> str:
    text = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    text = text.replace("&amp;", "&").replace("&nbsp;", " ").replace("&#160;", " ")
    return re.sub(r"[\s\u00a0\ufffd]+", " ", text).strip()

def parse_axis(body: str) -> dict | None:
    clean = strip_html_tags(body)

    NON_TXN_PHRASES = [
        "One-Time Password",
        "OTP to complete",
        "fund transfer limit",
        "successfully registered",
        "credit card application",
        "AutoPay transaction",
        "AutoPay ID",
        "Did you miss completing",
    ]
    for phrase in NON_TXN_PHRASES:
        if phrase.lower() in clean.lower():
            return None

    amount_match = re.search(r"Transaction Amount:\s*INR\s*([\d,]+(?:\.\d+)?)", clean, re.I)
    merchant_match = re.search(r"Merchant Name:\s*(.+?)\s+(?:Axis Bank|Credit Card No|Date & Time)", clean, re.I)
    last4_match = re.search(r"(?:Credit Card No\.?|Card No\.)\s*XX\s*(\d{4})", clean, re.I) or re.search(r"XX(\d{4})", clean)
    dt_match = re.search(r"Date & Time:\s*([\d-]+),\s*([\d:]+)\s*IST", clean, re.I)

    if not last4_match:
        return None

    if not (amount_match and merchant_match and dt_match):
        return {
            "bank_name": "Axis Bank",
            "card_name": "Axis Bank Credit Card",
            "card_last4": last4_match.group(1),
            "amount": float(amount_match.group(1).replace(",", "")) if amount_match else 0.0,
            "merchant": merchant_match.group(1).strip() if merchant_match else "Axis Bank",
            "transaction_date": datetime.now().date(),
            "transaction_time": datetime.now().time(),
        }

    date_str = dt_match.group(1)
    time_str = dt_match.group(2)

    transaction_datetime = datetime.now()
    for fmt in ("%d-%m-%Y %H:%M:%S", "%d-%m-%y %H:%M:%S"):
        try:
            transaction_datetime = datetime.strptime(f"{date_str} {time_str}", fmt)
            break
        except ValueError:
            continue

    return {
        "bank_name": "Axis Bank",
        "card_name": "Axis Bank Credit Card",
        "amount": float(amount_match.group(1).replace(",", "")),
        "merchant": merchant_match.group(1).strip(),
        "card_last4": last4_match.group(1),
        "transaction_date": transaction_datetime.date(),
        "transaction_time": transaction_datetime.time(),
    }
