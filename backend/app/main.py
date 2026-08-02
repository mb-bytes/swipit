from fastapi import FastAPI
from .api.users.user_routes import user_router
from .api.users.google_auth_routes import google_router
from .api.gmail.gmail_routes import gmail_router
from app.api.cards.merchants.merchant_service import merchant_service, merchant_cache
from app.db.session import AsyncSessionLocal
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with AsyncSessionLocal() as db:
        await merchant_cache.hydrate_cache(db)
    yield


app = FastAPI(title="SwipIt", version="v1", lifespan=lifespan)

app.include_router(user_router, prefix="/api/user")
app.include_router(google_router, prefix="/auth/google")
app.include_router(gmail_router, prefix="/api/gmail")


@app.get("/health")
def get_health():
    return {"message":"App Running"}