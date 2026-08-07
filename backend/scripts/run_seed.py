import asyncio
from app.db.session import AsyncSessionLocal
from app.db.models.merchants import MerchantCategoryModel
from app.db.seeders.seed_merchant import SEED_MERCHANT_MAP
from sqlalchemy import select
 
 
async def seed():
    async with AsyncSessionLocal() as db:
        for merchant_key, category in SEED_MERCHANT_MAP.items():
            existing = await db.scalar(
                select(MerchantCategoryModel).where(MerchantCategoryModel.merchant_key == merchant_key)
            )
            if existing:
                continue
            db.add(MerchantCategoryModel(merchant_key=merchant_key, category=category, source="seed"))
        await db.commit()
    print(f"Seeded {len(SEED_MERCHANT_MAP)} merchants")
 
 
if __name__ == "__main__":
    asyncio.run(seed())
