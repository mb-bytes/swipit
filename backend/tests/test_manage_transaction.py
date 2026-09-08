import asyncio, uuid
from app.db.session import AsyncSessionLocal
from app.api.rewards.reward_service import reward_service

async def test():
    async with AsyncSessionLocal() as db:
        result = await reward_service.manage_transaction(
            db, uuid.UUID("9e03e18c-ae7e-4e69-813a-9e290db587b1")
        )
        print(result)

asyncio.run(test())
