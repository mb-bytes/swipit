# tests/test_parse_axis.py
import email
from email import policy
from app.api.gmail.parsers.parse_axis import parse_axis

def load_plain_text_body(eml_path: str) -> str:
    with open(eml_path, "rb") as f:
        raw = f.read()
    msg = email.message_from_bytes(raw, policy=policy.default)
    for part in msg.walk():
        if part.get_content_type() == "text/plain":
            charset = part.get_content_charset() or "utf-8"
            return part.get_payload(decode=True).decode(charset, errors="replace")
    raise ValueError("No text/plain part found in this email")


def test_parse_axis_real_sample():
    body = load_plain_text_body("tests/fixtures/axis_sample.eml")
    result = parse_axis(body)

    assert result["amount"] == 154.0
    assert result["merchant"] == "FLIPKART PA"
    assert result["card_last4"] == "3306"
    print(result)  # eyeball it too, not just assertions


if __name__ == "__main__":
    test_parse_axis_real_sample()