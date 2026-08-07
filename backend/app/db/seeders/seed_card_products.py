from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.cards import CardProduct

SEED_PRODUCTS = [
    # Axis bank
    {"bank_name": "Axis Bank", "product_name": "Axis Flipkart Credit Card",    "card_network": "Mastercard",      "reward_type": "cashback"},
    {"bank_name": "Axis Bank", "product_name": "Axis Neo Credit Card",          "card_network": "Rupay",      "reward_type": "cashback"},
    {"bank_name": "Axis Bank", "product_name": "Axis MyZone Credit Card",       "card_network": "Mastercard", "reward_type": "points"},
    {"bank_name": "Axis Bank", "product_name": "Axis Magnus Credit Card",       "card_network": "Mastercard", "reward_type": "miles"},
    {"bank_name": "Axis Bank", "product_name": "Axis Rewards Credit Card",      "card_network": "Visa",       "reward_type": "points"},
    {"bank_name": "Axis Bank", "product_name": "Other Axis Bank Credit Card",   "card_network": None,         "reward_type": None},
    # Federal Bank
    {"bank_name": "Federal Bank", "product_name": "Federal Bank Celesta Credit Card", "card_network": "Visa", "reward_type": "points"},
    {"bank_name": "Federal Bank", "product_name": "Federal Bank Scapia Credit Card",  "card_network": "Visa", "reward_type": "points"},
    {"bank_name": "Federal Bank", "product_name": "Federal Bank Wave Credit Card",    "card_network": "Visa", "reward_type": "points"},
    {"bank_name": "Federal Bank", "product_name": "Federal Bank Imperio Credit Card",    "card_network": "Visa", "reward_type": "points"},
    {"bank_name": "Federal Bank", "product_name": "Other Federal Bank Credit Card",   "card_network": None,   "reward_type": None},
]


async def seed_card_products(db: AsyncSession) -> None:
    for data in SEED_PRODUCTS:
        result = await db.execute(
            select(CardProduct).where(
                CardProduct.bank_name == data["bank_name"],
                CardProduct.product_name == data["product_name"],
            )
        )
        if result.scalars().first() is None:
            db.add(CardProduct(**data))
    await db.commit()
