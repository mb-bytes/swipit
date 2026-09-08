# tests/test_parse_federal.py
from app.api.gmail.gmail_service import GmailService
from app.api.gmail.parsers.parse_federal import parse_federal


def load_body(eml_path: str) -> str:
    with open(eml_path, "rb") as f:
        raw = f.read()
    gmail_service = GmailService()
    body, body_type = gmail_service.extract_best_body(raw)
    print("Body type used:", body_type)  # should print "html", not "plain"
    return body


def test_parse_federal_real_sample():
    body = load_body("tests/fixtures/federal_sample.eml")
    result = parse_federal(body)

    assert result["amount"] == 30.0
    assert result["merchant"] == "mukesh"
    assert result["card_last4"] is None
    print(result)


if __name__ == "__main__":
    test_parse_federal_real_sample()