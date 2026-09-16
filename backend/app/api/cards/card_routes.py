import uuid
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from .card_schemas import CreateCardRequest, CreateManualTransactionRequest
from .card_service import card_service
from app.db.session import get_db
from app.api.dependencies import get_curr_user
from app.db.models.cards import CardProduct, CardModel, Transaction
from app.db.models.card_rewards import RewardCard
from app.api.rewards.reward_service import reward_service
from app.api.rewards.reward_schemas import TransactionInput
from app.api.merchants.categorize_service import categorize_service

from sqlalchemy.future import select


card_router = APIRouter(tags=["card-router"])


def title_case(s: str) -> str:
    if not s:
        return s
    return categorize_service.beautify_merchant(s)


def compute_reward_details(
    amount: float,
    reward: RewardCard | None,
    product: CardProduct | None = None,
    merchant: str = "",
    category: str = "unknown",
    tx_date: date | None = None,
    card_name: str = "",
) -> dict:
    reward_unit = (reward.reward_unit if reward else None) or (product.reward_type if product else None) or "cashback"
    point_val = float(reward.point_value_inr) if (reward and reward.point_value_inr is not None) else (0.25 if reward_unit == "points" else 1.0)

    if reward is None:
        if reward_unit == "points":
            pts = round((amount / 200.0) * 1.0, 2)
            inr = round(pts * point_val, 2)
            return {
                "reward_earned": inr,
                "points_earned": pts,
                "reward_unit": "points",
                "point_value_inr": point_val,
            }
        return {
            "reward_earned": 0.0,
            "points_earned": 0.0,
            "reward_unit": reward_unit or "cashback",
            "point_value_inr": point_val,
        }

    try:
        merchant_key = categorize_service.normalize_merchant(merchant) if merchant else ""
        tx_input = TransactionInput(
            amount=amount,
            category=category or "unknown",
            merchant_key=merchant_key,
            card_network=reward.network or (product.card_network if product else "") or "",
            transaction_date=tx_date or date.today(),
        )
        result = reward_service.process_reward(reward.config or {}, tx_input)
        raw = result.reward_earned
        if reward.reward_unit != "cashback" or reward_unit == "points":
            inr = round(raw * point_val, 2)
            pts = round(raw, 2)
        else:
            inr = round(raw, 2)
            pts = 0.0

        return {
            "reward_earned": inr,
            "points_earned": pts,
            "reward_unit": reward_unit,
            "point_value_inr": point_val,
        }
    except Exception:
        return {
            "reward_earned": 0.0,
            "points_earned": 0.0,
            "reward_unit": reward_unit or "cashback",
            "point_value_inr": point_val,
        }


def compute_reward(
    amount: float,
    reward: RewardCard | None,
    merchant: str = "",
    category: str = "unknown",
    tx_date: date | None = None,
) -> float:
    return compute_reward_details(amount, reward, merchant=merchant, category=category, tx_date=tx_date)["reward_earned"]


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
        select(CardModel, CardProduct, RewardCard)
        .outerjoin(
            CardProduct,
            (CardModel.product_id == CardProduct.product_id) | (CardModel.card_name == CardProduct.product_name),
        )
        .outerjoin(
            RewardCard,
            (RewardCard.product_id == CardModel.product_id) | (RewardCard.product_id == CardProduct.product_id),
        )
        .where(CardModel.user_id == current_user.user_id)
    )
    cards = []
    for row in result.all():
        card, product, reward = row
        reward_type = (reward.reward_unit if reward else None) or (product.reward_type if product else None) or "cashback"
        point_val = float(reward.point_value_inr) if (reward and reward.point_value_inr is not None) else (0.25 if reward_type == "points" else 1.0)

        cards.append({
            "card_id": str(card.card_id),
            "card_name": card.card_name,
            "card_last4": card.card_last4 or "1234",
            "bank_name": product.bank_name if product else (card.card_name.split()[0] if card.card_name else "Bank"),
            "product_name": product.product_name if product else card.card_name,
            "card_network": product.card_network if product else (reward.network if reward else None),
            "reward_type": reward_type,
            "reward_unit": reward.reward_unit if reward else reward_type,
            "point_value_inr": point_val,
        })
    return cards


@card_router.get("/transactions/recent", summary="List the N most recent transactions (home dashboard)")
async def get_recent_transactions(
    limit: int = Query(default=5, ge=1, le=50),
    days: int | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_curr_user),
):
    query = (
        select(Transaction, CardModel, RewardCard, CardProduct)
        .join(CardModel, Transaction.card_id == CardModel.card_id)
        .outerjoin(
            CardProduct,
            (CardModel.product_id == CardProduct.product_id) | (CardModel.card_name == CardProduct.product_name),
        )
        .outerjoin(
            RewardCard,
            (RewardCard.product_id == CardModel.product_id) | (RewardCard.product_id == CardProduct.product_id),
        )
        .where(CardModel.user_id == current_user.user_id)
    )
    if isinstance(days, int):
        cutoff = date.today() - timedelta(days=days)
        query = query.where(Transaction.transaction_date >= cutoff)
    query = query.order_by(Transaction.transaction_date.desc()).limit(limit)
    result = await db.execute(query)
    txns = []
    for row in result.all():
        tx, card, reward, product = row
        rd = compute_reward_details(
            float(tx.amount),
            reward,
            product=product,
            merchant=tx.merchant,
            category=tx.category or "unknown",
            tx_date=tx.transaction_date,
            card_name=card.card_name,
        )
        txns.append({
            "transaction_id": str(tx.transaction_id),
            "card_id": str(card.card_id),
            "merchant": title_case(tx.merchant),
            "amount": float(tx.amount),
            "category": tx.category,
            "transaction_date": tx.transaction_date.strftime("%d %b %Y") if hasattr(tx.transaction_date, "strftime") else str(tx.transaction_date),
            "raw_date": tx.transaction_date.isoformat() if hasattr(tx.transaction_date, "isoformat") else str(tx.transaction_date),
            "card_name": card.card_name,
            "reward_earned": rd["reward_earned"],
            "points_earned": rd["points_earned"],
            "reward_unit": rd["reward_unit"],
            "point_value_inr": rd["point_value_inr"],
        })
    return txns


@card_router.get("/transactions/last-5-days", summary="List transactions from the last 5 days")
async def get_last_5_days_transactions(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_curr_user),
):
    cutoff = date.today() - timedelta(days=5)
    result = await db.execute(
        select(Transaction, CardModel, RewardCard, CardProduct)
        .join(CardModel, Transaction.card_id == CardModel.card_id)
        .outerjoin(
            CardProduct,
            (CardModel.product_id == CardProduct.product_id) | (CardModel.card_name == CardProduct.product_name),
        )
        .outerjoin(
            RewardCard,
            (RewardCard.product_id == CardModel.product_id) | (RewardCard.product_id == CardProduct.product_id),
        )
        .where(
            CardModel.user_id == current_user.user_id,
            Transaction.transaction_date >= cutoff,
        )
        .order_by(Transaction.transaction_date.desc())
    )
    txns = []
    for row in result.all():
        tx, card, reward, product = row
        rd = compute_reward_details(
            float(tx.amount),
            reward,
            product=product,
            merchant=tx.merchant,
            category=tx.category or "unknown",
            tx_date=tx.transaction_date,
            card_name=card.card_name,
        )
        txns.append({
            "transaction_id": str(tx.transaction_id),
            "card_id": str(card.card_id),
            "merchant": title_case(tx.merchant),
            "amount": float(tx.amount),
            "category": tx.category,
            "transaction_date": tx.transaction_date.strftime("%d %b %Y") if hasattr(tx.transaction_date, "strftime") else str(tx.transaction_date),
            "raw_date": tx.transaction_date.isoformat() if hasattr(tx.transaction_date, "isoformat") else str(tx.transaction_date),
            "card_name": card.card_name,
            "reward_earned": rd["reward_earned"],
            "points_earned": rd["points_earned"],
            "reward_unit": rd["reward_unit"],
            "point_value_inr": rd["point_value_inr"],
        })
    return txns


@card_router.get("/transactions", summary="List all transactions for current user")
async def get_user_transactions(db: AsyncSession = Depends(get_db), current_user=Depends(get_curr_user)):
    result = await db.execute(
        select(Transaction, CardModel, RewardCard, CardProduct)
        .join(CardModel, Transaction.card_id == CardModel.card_id)
        .outerjoin(
            CardProduct,
            (CardModel.product_id == CardProduct.product_id) | (CardModel.card_name == CardProduct.product_name),
        )
        .outerjoin(
            RewardCard,
            (RewardCard.product_id == CardModel.product_id) | (RewardCard.product_id == CardProduct.product_id),
        )
        .where(CardModel.user_id == current_user.user_id)
        .order_by(Transaction.transaction_date.desc())
    )
    txns = []
    for row in result.all():
        tx, card, reward, product = row
        rd = compute_reward_details(
            float(tx.amount),
            reward,
            product=product,
            merchant=tx.merchant,
            category=tx.category or "unknown",
            tx_date=tx.transaction_date,
            card_name=card.card_name,
        )
        txns.append({
            "transaction_id": str(tx.transaction_id),
            "card_id": str(card.card_id),
            "merchant": title_case(tx.merchant),
            "amount": float(tx.amount),
            "category": tx.category,
            "transaction_date": tx.transaction_date.strftime("%d %b %Y") if hasattr(tx.transaction_date, "strftime") else str(tx.transaction_date),
            "raw_date": tx.transaction_date.isoformat() if hasattr(tx.transaction_date, "isoformat") else str(tx.transaction_date),
            "card_name": card.card_name,
            "reward_earned": rd["reward_earned"],
            "points_earned": rd["points_earned"],
            "reward_unit": rd["reward_unit"],
            "point_value_inr": rd["point_value_inr"],
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
    product = None
    if card.product_id:
        reward_result = await db.execute(
            select(RewardCard).where(RewardCard.product_id == card.product_id)
        )
        reward = reward_result.scalars().first()
        prod_result = await db.execute(
            select(CardProduct).where(CardProduct.product_id == card.product_id)
        )
        product = prod_result.scalars().first()

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

    rd = compute_reward_details(
        float(txn.amount),
        reward,
        product=product,
        merchant=txn.merchant,
        category=txn.category or "unknown",
        tx_date=txn.transaction_date,
        card_name=card.card_name,
    )

    return {
        "transaction_id": str(txn.transaction_id),
        "card_id": str(txn.card_id),
        "merchant": title_case(txn.merchant),
        "amount": float(txn.amount),
        "category": txn.category,
        "transaction_date": txn.transaction_date.strftime("%d %b %Y") if hasattr(txn.transaction_date, "strftime") else str(txn.transaction_date),
        "raw_date": txn.transaction_date.isoformat() if hasattr(txn.transaction_date, "isoformat") else str(txn.transaction_date),
        "card_name": card.card_name,
        "reward_earned": rd["reward_earned"],
        "points_earned": rd["points_earned"],
        "reward_unit": rd["reward_unit"],
        "point_value_inr": rd["point_value_inr"],
    }

@card_router.put("/transactions/{transaction_id}")
async def update_transaction(
    transaction_id: uuid.UUID,
    update_details: dict,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_curr_user),
):
    try:
        updated = await card_service.update_transaction(
            db, transaction_id, current_user.user_id, update_details
        )
        return {
            "transaction_id": str(updated.transaction_id),
            "card_id": str(updated.card_id),
            "merchant": title_case(updated.merchant),
            "amount": float(updated.amount),
            "category": updated.category,
            "transaction_date": (
                updated.transaction_date.strftime("%d %b %Y")
                if hasattr(updated.transaction_date, "strftime")
                else str(updated.transaction_date)
            ),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@card_router.delete("/transactions/{transaction_id}")
async def delete_transaction(transaction_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user = Depends(get_curr_user)):
    try:
        await card_service.delete_transaction(db, transaction_id, current_user.user_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return JSONResponse(content={"message": "Transaction has been deleted"})
