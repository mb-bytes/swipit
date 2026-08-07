from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.merchants import MerchantCategoryModel
import asyncio
 
from app.db.seeders.seed_merchant import SEED_MERCHANT_MAP

_cache: dict[str, str] = {}
_lock = asyncio.Lock()

class MerchantCache:
    def get_cached(self, merchant_key: str) -> str | None:
        return _cache.get(merchant_key)
 
 
    async def set_cached(self, merchant_key: str, category: str) -> None:
        async with _lock:
            _cache[merchant_key] = category
 
 
    async def hydrate_cache(self, db) -> None:
        """Call once at app startup to warm the cache from SEED_MERCHANT_MAP and DB."""
        global _cache
        initial_cache = {k: v.value if hasattr(v, 'value') else str(v) for k, v in SEED_MERCHANT_MAP.items()}
        db_categories = await merchant_service.get_all_categories(db)
        initial_cache.update(db_categories)
        _cache = initial_cache


class MerchantService:
    async def get_category(self, db: AsyncSession, merchant_key: str) -> MerchantCategoryModel | None:
        return await db.scalar(
            select(MerchantCategoryModel).where(MerchantCategoryModel.merchant_key == merchant_key)
        )
    
    
    async def upsert_category(
        self, db: AsyncSession, merchant_key: str, category: str, source: str = "ai"
    ) -> MerchantCategoryModel:
        existing = await self.get_category(db, merchant_key)
        if existing:
            existing.category = category
            existing.source = source
            await db.commit()
            return existing
    
        row = MerchantCategoryModel(merchant_key=merchant_key, category=category, source=source)
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row
    
    
    async def get_all_categories(self, db: AsyncSession) -> dict[str, str]:
        """Used to hydrate the in-memory cache at startup."""
        rows = await db.scalars(select(MerchantCategoryModel))
        return {row.merchant_key: row.category for row in rows}

merchant_service = MerchantService()
merchant_cache_service = MerchantCache()