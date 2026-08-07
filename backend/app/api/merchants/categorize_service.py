import re
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.categories import TransactionCategory
from .merchant_service import merchant_service, merchant_cache_service
from app.db.seeders.seed_merchant import SEED_MERCHANT_MAP
from app.core.ai_client import classify_merchant_with_ai

class CategorizeService:
    def normalize_merchant(self, raw_name: str) -> str:
        name = raw_name.lower().strip()

        if "*" in name:
            name = name.split("*", 1)[1]

        name = re.sub(r"[^a-z0-9\s]", " ", name)
        name = re.sub(r"\s+", " ", name).strip()

        name = name.split(" ")[0] if name else name

        return name if name else raw_name.lower().strip()

    async def categorize_transaction(self, db: AsyncSession, merchant_raw: str) -> str:
        merchant_key = self.normalize_merchant(merchant_raw)
    
        # 1 in-memory cache
        cached = merchant_cache_service.get_cached(merchant_key)
        if cached:
            return cached
    
        # 2 SEED map 
        if merchant_key in SEED_MERCHANT_MAP:
            cat_val = SEED_MERCHANT_MAP[merchant_key]
            category = cat_val.value if hasattr(cat_val, "value") else str(cat_val)
            await merchant_service.upsert_category(db, merchant_key, category, source="seed")
            await merchant_cache_service.set_cached(merchant_key, category)
            return category

        # 3 DB lookup
        db_row = await merchant_service.get_category(db, merchant_key)
        if db_row:
            await merchant_cache_service.set_cached(merchant_key, db_row.category)
            return db_row.category
    
        # 4 Fall back to AI
        category = await classify_merchant_with_ai(merchant_key)
    
        await merchant_service.upsert_category(db, merchant_key, category, source="ai")
        await merchant_cache_service.set_cached(merchant_key, category)
    
        return category

categorize_service = CategorizeService()


