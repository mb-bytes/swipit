import uuid
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from .card_schemas import CreateCardRequest
from .card_service import card_service
from app.db.session import get_db
from app.api.dependencies import get_curr_user
from app.db.models.cards import CardProduct, CardModel, Transaction

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

@card_router.delete("/{card_id}")
async def remove_card(
    card_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_curr_user),
):
    try:
        await card_service.remove_card(db, card_id, current_user.user_id)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return JSONResponse(content={"message": "Card has been removed successfully"})


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


@card_router.get("/my-cards", summary="List current user's registered cards")
async def get_user_cards(db: AsyncSession = Depends(get_db), current_user=Depends(get_curr_user)):
    result = await db.execute(
        select(CardModel, CardProduct)
        .outerjoin(CardProduct, CardModel.product_id == CardProduct.product_id)
        .where(CardModel.user_id == current_user.user_id)
    )
    cards = []
    for row in result.all():
        card, product = row
        cards.append({
            "card_id": str(card.card_id),
            "card_name": card.card_name,
            "card_last4": card.card_last4 or "1234",
            "bank_name": product.bank_name if product else (card.card_name.split()[0] if card.card_name else "Bank"),
            "product_name": product.product_name if product else card.card_name,
            "card_network": product.card_network if product else None,
        })
    return cards


@card_router.get("/transactions", summary="List recent transactions for current user")
async def get_user_transactions(db: AsyncSession = Depends(get_db), current_user=Depends(get_curr_user)):
    result = await db.execute(
        select(Transaction, CardModel)
        .join(CardModel, Transaction.card_id == CardModel.card_id)
        .where(CardModel.user_id == current_user.user_id)
        .order_by(Transaction.transaction_date.desc())
        .limit(25)
    )
    txns = []
    for row in result.all():
        tx, card = row
        txns.append({
            "transaction_id": str(tx.transaction_id),
            "card_id": str(card.card_id),
            "merchant": tx.merchant,
            "amount": float(tx.amount),
            "category": tx.category,
            "transaction_date": tx.transaction_date.strftime("%d %b %Y") if hasattr(tx.transaction_date, "strftime") else str(tx.transaction_date),
            "card_name": card.card_name,
            "reward_earned": round(float(tx.amount) * 0.04, 2),
        })
    return txns