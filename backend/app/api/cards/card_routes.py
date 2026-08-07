from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from .card_schemas import CreateCardRequest
from .card_service import card_service
from app.db.session import get_db
from app.api.dependencies import get_curr_user
from app.db.models.cards import CardProduct

from sqlalchemy.future import select


card_router = APIRouter(tags=["card-router"])


@card_router.post("/create", summary="Add a card manually using a catalogue product")
async def new_card(
    body: CreateCardRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_curr_user),
):
    try:
        card = await card_service.create_card_from_product(
            db,
            user_id=current_user.user_id,
            product_id=body.product_id,
            card_last4=body.card_last4,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return {
        "card_id": str(card.card_id),
        "card_name": card.card_name,
        "card_last4": card.card_last4,
    }


@card_router.get("/catalogue", summary="List all available card products grouped by bank")
async def get_catalogue(db: AsyncSession = Depends(get_db), current_user=Depends(get_curr_user)):
    result = await db.execute(select(CardProduct).order_by(CardProduct.bank_name, CardProduct.product_name))
    products = result.scalars().all()

    catalogue: dict[str, list] = {}
    for p in products:
        catalogue.setdefault(p.bank_name, []).append({
            "product_id": str(p.product_id),
            "product_name": p.product_name,
            "card_network": p.card_network,
            "reward_type": p.reward_type,
        })
    return catalogue