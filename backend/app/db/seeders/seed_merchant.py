from app.core.categories import TransactionCategory as C

SEED_MERCHANT_MAP: dict[str, str] = {
    # Food & Dining
    "swiggy": C.DINING,
    "zomato": C.DINING,
    "eats": C.DINING,

    # Quick Commerce & Groceries
    "instamart": C.GROCERIES,
    "instama": C.GROCERIES,
    "blinkit": C.GROCERIES,
    "zepto": C.GROCERIES,
    "bigbasket": C.GROCERIES,
    "dmart": C.SUPERMARKET,

    # E-Commerce & Retail
    "amazon": C.ONLINE_SHOPPING,
    "flipkart": C.ONLINE_SHOPPING,
    "myntra": C.APPAREL,
    "ajio": C.APPAREL,
    "nykaa": C.ONLINE_SHOPPING,
    "tata cliq": C.ONLINE_SHOPPING,

    # Travel & Transit
    "irctc": C.TRAVEL,
    "makemytrip": C.TRAVEL,
    "cleartrip": C.TRAVEL,
    "easemytrip": C.TRAVEL,
    "goibibo": C.TRAVEL,
    "uber": C.TRANSPORTATION,
    "ola": C.TRANSPORTATION,
    "rapido": C.TRANSPORTATION,

    # Fuel & Energy
    "iocl": C.FUEL,
    "indianoil": C.FUEL,
    "hpcl": C.FUEL,
    "bpcl": C.FUEL,

    # Telecom
    "airtel": C.TELECOM,
    "jio": C.TELECOM,
    "vodafone": C.TELECOM,
    "vi": C.TELECOM,

    # Utility Bills
    "tata power": C.UTILITY,
    "bescom": C.UTILITY,
    "cesc": C.UTILITY,
    "mgl": C.UTILITY,
    "igl": C.UTILITY,

    # Entertainment & Movies
    "netflix": C.SUBSCRIPTION,
    "spotify": C.SUBSCRIPTION,
    "hotstar": C.SUBSCRIPTION,
    "prime video": C.SUBSCRIPTION,
    "pvr": C.MOVIE,
    "inox": C.MOVIE,
    "bookmyshow": C.ENTERTAINMENT,
    "district": C.ENTERTAINMENT,
    "distric": C.ENTERTAINMENT,

    # Healthcare & Wellness
    "apollo pharmacy": C.HEALTHCARE,
    "practo": C.HEALTHCARE,
    "pharmeasy": C.HEALTHCARE,
    "1mg": C.HEALTHCARE,
    "cult.fit": C.HEALTHCARE,
    "fitpass": C.HEALTHCARE,

    # Rent & Wallets
    "cred": C.RENT,
    "nobroker": C.RENT,
    "housing": C.RENT,
    "paytm": C.WALLET_LOAD,

    # Investments
    "zerodha": C.INVESTMENT,
    "groww": C.INVESTMENT,
    "upstox": C.INVESTMENT,

    # Money Transfers
    "neft": C.MONEY_TRANSFER,
    "imps": C.MONEY_TRANSFER,
    "upi": C.MONEY_TRANSFER,
}

