import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from .card_schemas import CreateCardRequest, CreateManualTransactionRequest
from .card_service import card_service
from app.db.session import get_db
from app.api.dependencies import get_curr_user
from app.db.models.cards import CardProduct, CardModel, Transaction
from app.db.models.card_rewards import RewardCard

from sqlalchemy.future import select


card_router = APIRouter(tags=["card-router"])


def title_case(s: str) -> str:
    if not s:
        return s
    return " ".join(word.capitalize() for word in s.split())


def compute_reward(amount: float, reward: RewardCard | None) -> float:
    if reward is None:
        return 0.0
    try:
        config = reward.config or {}
        base = config.get("base_rate", {})
        rate_type = base.get("rate_type", "")
        point_value = float(reward.point_value_inr or 0)

        if rate_type == "points_per_amount":
            points_per_block = float(base.get("points", 0))
            per_spend = float(base.get("per_spend_amount", 1))
            if per_spend <= 0:
                return 0.0
            blocks = int(amount / per_spend)
            points = blocks * points_per_block
            return round(points * point_value, 2)

        if rate_type == "percentage":
            rate = float(base.get("rate", 0))
            return round(amount * rate / 100, 2)

        return 0.0
    except Exception:
        return 0.0


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


@card_router.get("/transactions/recent", summary="List the N most recent transactions (home dashboard)")
async def get_recent_transactions(
    limit: int = Query(default=5, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_curr_user),
):
    result = await db.execute(
        select(Transaction, CardModel, RewardCard)
        .join(CardModel, Transaction.card_id == CardModel.card_id)
        .outerjoin(RewardCard, RewardCard.product_id == CardModel.product_id)
        .where(CardModel.user_id == current_user.user_id)
        .order_by(Transaction.transaction_date.desc())
        .limit(limit)
    )
    txns = []
    for row in result.all():
        tx, card, reward = row
        txns.append({
            "transaction_id": str(tx.transaction_id),
            "card_id": str(card.card_id),
            "merchant": title_case(tx.merchant),
            "amount": float(tx.amount),
            "category": tx.category,
            "transaction_date": tx.transaction_date.strftime("%d %b %Y") if hasattr(tx.transaction_date, "strftime") else str(tx.transaction_date),
            "raw_date": tx.transaction_date.isoformat() if hasattr(tx.transaction_date, "isoformat") else str(tx.transaction_date),
            "card_name": card.card_name,
            "reward_earned": compute_reward(float(tx.amount), reward),
        })
    return txns


@card_router.get("/transactions", summary="List all transactions for current user")
async def get_user_transactions(db: AsyncSession = Depends(get_db), current_user=Depends(get_curr_user)):
    result = await db.execute(
        select(Transaction, CardModel, RewardCard)
        .join(CardModel, Transaction.card_id == CardModel.card_id)
        .outerjoin(RewardCard, RewardCard.product_id == CardModel.product_id)
        .where(CardModel.user_id == current_user.user_id)
        .order_by(Transaction.transaction_date.desc())
    )
    txns = []
    for row in result.all():
        tx, card, reward = row
        txns.append({
            "transaction_id": str(tx.transaction_id),
            "card_id": str(card.card_id),
            "merchant": title_case(tx.merchant),
            "amount": float(tx.amount),
            "category": tx.category,
            "transaction_date": tx.transaction_date.strftime("%d %b %Y") if hasattr(tx.transaction_date, "strftime") else str(tx.transaction_date),
            "raw_date": tx.transaction_date.isoformat() if hasattr(tx.transaction_date, "isoformat") else str(tx.transaction_date),
            "card_name": card.card_name,
            "reward_earned": compute_reward(float(tx.amount), reward),
        })
    return txns

@card_router.post("/transactions", summary="Manually add a transaction")
async def add_transaction(
    body: CreateManualTransactionRequest,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_curr_user),
):
    card_result = await db.execute(
        select(CardModel).where(CardModel.card_id == body.card_id, CardModel.user_id == current_user.user_id)
    )
    card = card_result.scalars().first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found or does not belong to this user")

    reward = None
    if card.product_id:
        reward_result = await db.execute(
            select(RewardCard).where(RewardCard.product_id == card.product_id)
        )
        reward = reward_result.scalars().first()

    try:
        txn = await card_service.create_manual_transaction(
            db,
            card_id=body.card_id,
            merchant=body.merchant,
            amount=body.amount,
            category=body.category,
            transaction_date=body.transaction_date,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "transaction_id": str(txn.transaction_id),
        "card_id": str(txn.card_id),
        "merchant": title_case(txn.merchant),
        "amount": float(txn.amount),
        "category": txn.category,
        "transaction_date": txn.transaction_date.strftime("%d %b %Y") if hasattr(txn.transaction_date, "strftime") else str(txn.transaction_date),
        "raw_date": txn.transaction_date.isoformat() if hasattr(txn.transaction_date, "isoformat") else str(txn.transaction_date),
        "card_name": card.card_name,
        "reward_earned": compute_reward(float(txn.amount), reward),
    }

@card_router.delete("/transactions/{transaction_id}")
async def delete_transaction(transaction_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user = Depends(get_curr_user)):
    try:
        await card_service.delete_transaction(db, transaction_id, current_user.user_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return JSONResponse(content={"message": "Transaction has been deleted"})
