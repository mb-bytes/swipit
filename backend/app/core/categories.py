from enum import StrEnum


class TransactionCategory(StrEnum):
    # Core Spend Categories
    FOOD = "food"
    DINING = "dining"
    GROCERIES = "groceries"
    SUPERMARKET = "supermarket"
    SHOPPING = "shopping"
    ONLINE_SHOPPING = "online_shopping"
    DEPARTMENTAL_STORE = "departmental_store"
    APPAREL = "apparel_store"

    # Travel & Transit
    TRAVEL = "travel"
    AIRLINES = "airlines"
    HOTELS = "hotels"
    TRANSPORTATION = "transportation"
    TOLL = "toll"
    FUEL = "fuel"

    # Utilities & Bills
    BILLS = "bills"
    UTILITY = "utility"
    TELECOM = "telecom"
    SUBSCRIPTION = "subscription"

    # Financial & Special Exclusions
    RENT = "rent"
    WALLET_LOAD = "wallet_load"
    GOVERNMENT = "government"
    INSURANCE = "insurance"
    EDUCATION = "education"
    JEWELLERY = "jewellery"
    GOLD = "gold"
    EMI = "emi"
    CASH_ADVANCE = "cash_advance"
    REPAYMENT = "repayment"
    FEES = "fees"
    CHARGES = "charges"
    GIFT_CARD = "gift_card"
    FOREX = "forex"
    CRYPTO = "crypto"

    # Entertainment & Health
    ENTERTAINMENT = "entertainment"
    MOVIE = "movie"
    HEALTH = "health"
    HEALTHCARE = "healthcare"

    # Transfers & Others
    TRANSFER = "transfer"
    MONEY_TRANSFER = "money_transfer"
    INVESTMENT = "investment"
    OTHER = "other"

