from datetime import date

def get_period_key(transaction_date: date, cap_period: str) -> str:
    if cap_period in ("calendar_month", "statement_month"):
        return transaction_date.strftime("%Y-%m")
    elif cap_period == "statement_quarter":
        quarter = (transaction_date.month - 1) // 3 + 1
        return f"{transaction_date.year}-Q{quarter}"
    else:
        return transaction_date.strftime("%Y-%m")