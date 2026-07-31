from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from .card_service import card_service
from app.db.session import get_db
from app.api.dependencies import get_curr_user

card_router = APIRouter(tags=['card-router'])

@card_router.post("/create")
async def new_card(card_name: str, card_last4: str | None, db: AsyncSession = Depends(get_db), current_user=Depends(get_curr_user)):
    user_id = current_user.user_id
    new_card = card_service.get_or_create_card(db, user_id, card_name, card_last4)
    return new_card