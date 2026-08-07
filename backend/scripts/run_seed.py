import asyncio
import app.db.models  # ensures all SQLAlchemy mappers are registered
from app.db.session import AsyncSessionLocal
from app.db.models.merchants import MerchantCategoryModel
from app.db.models.cards import CardProduct
from app.db.models.card_rewards import RewardCard
from app.db.seeders.seed_merchant import SEED_MERCHANT_MAP
from app.db.seeders.seed_card_products import SEED_PRODUCTS
from app.db.seeders.seed_reward_cards import CARDS
from sqlalchemy import select


async def seed():
    async with AsyncSessionLocal() as db:

        # Seed Merchants
        merchant_count = 0
        for merchant_key, category in SEED_MERCHANT_MAP.items():
            existing = await db.scalar(
                select(MerchantCategoryModel).where(MerchantCategoryModel.merchant_key == merchant_key)
            )
            if existing:
                continue
            cat_val = category.value if hasattr(category, "value") else str(category)
            db.add(MerchantCategoryModel(merchant_key=merchant_key, category=cat_val, source="seed"))
            merchant_count += 1
        await db.commit()
        print(f"[1/3] Seeded {merchant_count} merchants")

        # Seed Card Products
        product_count = 0
        for data in SEED_PRODUCTS:
            result = await db.execute(
                select(CardProduct).where(
                    CardProduct.bank_name == data["bank_name"],
                    CardProduct.product_name == data["product_name"],
                )
            )
            if result.scalars().first() is None:
                db.add(CardProduct(**data))
                product_count += 1
        await db.commit()
        print(f"[2/3] Seeded {product_count} card products")

        # Seed Reward Cards
        reward_count = 0
        for c in CARDS:
            # Fetch matching CardProduct
            result = await db.execute(
                select(CardProduct).where(
                    CardProduct.product_name == c["product_name"],
                    CardProduct.bank_name == c["bank_name"],
                )
            )
            product = result.scalar_one_or_none()
            if not product:
                print(f"  Skipping: CardProduct not found for {c['product_name']}")
                continue

            existing = await db.scalar(select(RewardCard).where(RewardCard.product_id == product.product_id))
            if existing:
                continue

            config_payload = {
                "base_rate": c.get("base_rate"),
                "merchant_rates": c.get("merchant_rates", []),
                "category_rates": c.get("category_rates", []),
                "spend_tiers": c.get("spend_tiers", []),
                "milestones": c.get("milestones", []),
                "network_rates": c.get("network_rates", []),
                "introductory_offers": c.get("introductory_offers", []),
                "exclusions": c.get("exclusions", {"categories": [], "merchants": []}),
            }
            db.add(RewardCard(
                product_id=product.product_id,
                bank_name=c["bank_name"],
                network=c.get("card_network"),
                annual_fee=c.get("annual_fee", 0),
                reward_unit=c.get("reward_type") or "points",
                point_value_inr=1.0 if c.get("reward_type") == "cashback" else 0.25,
                config=config_payload,
                is_active=True,
            ))
            reward_count += 1
        await db.commit()
        print(f"[3/3] Seeded {reward_count} reward cards")

    print("All seeders executed successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
