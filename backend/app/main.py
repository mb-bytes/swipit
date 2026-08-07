from fastapi import FastAPI
from .api.users.user_routes import user_router
from .api.users.google_auth_routes import google_router
from .api.gmail.gmail_routes import gmail_router
from .api.cards.card_routes import card_router
from .api.merchants.merchant_service import merchant_service, merchant_cache_service
from .db.session import AsyncSessionLocal
from .db.seeders.seed_card_products import seed_card_products
from .db.models import card_rewards 
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with AsyncSessionLocal() as db:
        await merchant_cache_service.hydrate_cache(db)
        await seed_card_products(db)
    yield


app = FastAPI(title="SwipIt", version="v1", lifespan=lifespan)

app.include_router(user_router, prefix="/api/user")
app.include_router(google_router, prefix="/auth/google")
app.include_router(gmail_router, prefix="/api/gmail")
app.include_router(card_router, prefix="/api/cards")


@app.get("/health")
def get_health():
    return {"message": "App Running"}