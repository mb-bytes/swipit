from enum import StrEnum
 
 
class TransactionCategory(StrEnum):
    FOOD = "food"
    TRAVEL = "travel"
    SHOPPING = "shopping"
    BILLS = "bills"
    ENTERTAINMENT = "entertainment"
    GROCERIES = "groceries"
    HEALTH = "health"
    TRANSFER = "transfer"
    INVESTMENT = "investment"
    SUBSCRIPTION = "subscription"
    OTHER = "other"
