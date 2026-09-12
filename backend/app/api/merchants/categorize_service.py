import re
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.categories import TransactionCategory
from .merchant_service import merchant_service, merchant_cache_service
from app.db.seeders.seed_merchant import SEED_MERCHANT_MAP
from app.core.ai_client import classify_merchant_with_ai

MERCHANT_ALIASES = {
    "flipkart": ["flipkar", "flipka", "fkart", "flipkart"],
    "amazon": ["amzn", "amazn", "amazonpay", "amazon"],
    "myntra": ["myntr", "mynt", "myntra"],
    "swiggy": ["swigy", "swiggi", "swiggy"],
    "instamart": ["instama", "instamart"],
    "zomato": ["zomto", "zmt", "zomato"],
    "blinkit": ["blnkit", "blinkit", "grofers"],
    "zepto": ["zeptonow", "zepto"],
    "bigbasket": ["bbdaily", "bbinstant", "bigbasket"],
    "cleartrip": ["cleartrp", "clrtrip", "cltrip", "cleartrip"],
    "makemytrip": ["mmt", "makemytrip"],
    "bookmyshow": ["bms", "bookmyshow"],
    "cult.fit": ["cultfit", "curefit", "cult.fit"],
    "uber": ["uber"],
    "ola": ["olacabs", "ola"],
    "netflix": ["nflx", "netflix"],
    "spotify": ["sptfy", "spotify"],
    "pvr": ["pvrcinemas", "pvr"],
    "paytm": ["paytm"],
    "phonepe": ["phonepe"],
    "cred": ["cred"],
}

MERCHANT_DISPLAY_NAMES = {
    "flipkart": "Flipkart",
    "amazon": "Amazon",
    "myntra": "Myntra",
    "swiggy": "Swiggy",
    "instamart": "Instamart",
    "zomato": "Zomato",
    "blinkit": "Blinkit",
    "zepto": "Zepto",
    "bigbasket": "BigBasket",
    "cleartrip": "Cleartrip",
    "makemytrip": "MakeMyTrip",
    "bookmyshow": "BookMyShow",
    "cult.fit": "Cult.fit",
    "uber": "Uber",
    "ola": "Ola",
    "netflix": "Netflix",
    "spotify": "Spotify",
    "pvr": "PVR",
    "paytm": "Paytm",
    "phonepe": "PhonePe",
    "cred": "Cred",
}

class CategorizeService:
    def normalize_merchant(self, raw_name: str) -> str:
        name = raw_name.lower().strip()

        if "*" in name:
            name = name.split("*", 1)[1]

        clean = re.sub(r"[^a-z0-9\s]", " ", name)
        clean = re.sub(r"\s+", " ", clean).strip()

        for canonical, aliases in MERCHANT_ALIASES.items():
            for alias in aliases:
                if re.search(r"\b" + re.escape(alias), clean) or alias in clean.split():
                    return canonical

        words = clean.split(" ")
        return words[0] if words and words[0] else raw_name.lower().strip()

    def beautify_merchant(self, raw_name: str) -> str:
        if not raw_name:
            return ""
        key = self.normalize_merchant(raw_name)
        if key in MERCHANT_DISPLAY_NAMES:
            return MERCHANT_DISPLAY_NAMES[key]
        name = raw_name
        if "*" in name:
            name = name.split("*", 1)[1]
        stop_words = {"pvt", "ltd", "pa", "limi", "limited", "india", "in", "corp", "inc", "pay"}
        clean_words = [w for w in name.split() if w.lower().strip(".") not in stop_words]
        clean_name = " ".join(clean_words) if clean_words else name
        return " ".join(w.capitalize() for w in clean_name.split())

    async def categorize_transaction(self, db: AsyncSession, merchant_raw: str) -> str:
        merchant_key = self.normalize_merchant(merchant_raw)
    
        cached = merchant_cache_service.get_cached(merchant_key)
        if cached:
            return cached
    
        if merchant_key in SEED_MERCHANT_MAP:
            cat_val = SEED_MERCHANT_MAP[merchant_key]
            category = cat_val.value if hasattr(cat_val, "value") else str(cat_val)
            await merchant_service.upsert_category(db, merchant_key, category, source="seed")
            await merchant_cache_service.set_cached(merchant_key, category)
            return category

        db_row = await merchant_service.get_category(db, merchant_key)
        if db_row:
            await merchant_cache_service.set_cached(merchant_key, db_row.category)
            return db_row.category
    
        category = await classify_merchant_with_ai(merchant_key)
    
        await merchant_service.upsert_category(db, merchant_key, category, source="ai")
        await merchant_cache_service.set_cached(merchant_key, category)
    
        return category

categorize_service = CategorizeService()


