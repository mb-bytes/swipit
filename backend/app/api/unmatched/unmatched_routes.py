import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.api.dependencies import get_curr_user
from app.db.models.unmatched import UnmatchedTransaction
from app.db.models.cards import CardModel, Transaction
from app.api.merchants.categorize_service import categorize_service
from app.api.cards.card_routes import title_case
from .unmatched_schemas import AssignCardRequest

unmatched_router = APIRouter(tags=["unmatched"])


@unmatched_router.get("")
async def list_unmatched(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_curr_user),
):
    from sqlalchemy import delete

    subquery = select(Transaction.raw_email_id).where(Transaction.raw_email_id.isnot(None))
    await db.execute(
        delete(UnmatchedTransaction).where(
            UnmatchedTransaction.user_id == current_user.user_id,
            UnmatchedTransaction.raw_email_id.in_(subquery),
        )
    )
    await db.commit()

    result = await db.execute(
        select(UnmatchedTransaction)
        .where(UnmatchedTransaction.user_id == current_user.user_id)
        .order_by(UnmatchedTransaction.transaction_date.desc())
    )
    rows = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "bank_name": r.bank_name,
            "merchant": title_case(r.merchant),
            "amount": float(r.amount),
            "currency": r.currency,
            "transaction_date": r.transaction_date.strftime("%d %b %Y"),
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@unmatched_router.post("/{unmatched_id}/assign")
async def assign_card(
    unmatched_id: uuid.UUID,
    body: AssignCardRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_curr_user),
):
    unmatched_result = await db.execute(
        select(UnmatchedTransaction).where(
            UnmatchedTransaction.id == unmatched_id,
            UnmatchedTransaction.user_id == current_user.user_id,
        )
    )
    unmatched = unmatched_result.scalars().first()
    if not unmatched:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unmatched transaction not found")

    card_result = await db.execute(
        select(CardModel).where(
            CardModel.card_id == body.card_id,
            CardModel.user_id == current_user.user_id,
        )
    )
    card = card_result.scalars().first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found or does not belong to this user")

    category = await categorize_service.categorize_transaction(db, unmatched.merchant)

    existing_txn_result = await db.execute(
        select(Transaction).where(Transaction.raw_email_id == unmatched.raw_email_id)
    )
    existing_txn = existing_txn_result.scalars().first()

    if existing_txn:
        existing_txn.card_id = body.card_id
        if category and not existing_txn.category:
            existing_txn.category = category
        txn = existing_txn
    else:
        txn = Transaction(
            card_id=body.card_id,
            merchant=unmatched.merchant,
            amount=unmatched.amount,
            category=category,
            transaction_date=unmatched.transaction_date,
            transaction_time=unmatched.transaction_time,
            raw_email_id=unmatched.raw_email_id,
        )
        db.add(txn)

    await db.delete(unmatched)
    await db.commit()
    await db.refresh(txn)

    from app.celery_task import call_manage_transaction
    call_manage_transaction.delay(str(txn.transaction_id))

    return {
        "transaction_id": str(txn.transaction_id),
        "merchant": title_case(txn.merchant),
        "amount": float(txn.amount),
        "category": txn.category,
        "transaction_date": txn.transaction_date.strftime("%d %b %Y"),
        "card_id": str(body.card_id),
        "card_name": card.card_name,
        "reward_earned": round(float(txn.amount) * 0.04, 2),
    }


@unmatched_router.delete("/all")
async def dismiss_all_unmatched(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_curr_user),
):
    from sqlalchemy import delete
    await db.execute(
        delete(UnmatchedTransaction).where(
            UnmatchedTransaction.user_id == current_user.user_id
        )
    )
    await db.commit()
    return JSONResponse(content={"message": "All unmatched transactions dismissed"})


@unmatched_router.delete("/{unmatched_id}")
async def dismiss_unmatched(
    unmatched_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_curr_user),
):
    result = await db.execute(
        select(UnmatchedTransaction).where(
            UnmatchedTransaction.id == unmatched_id,
            UnmatchedTransaction.user_id == current_user.user_id,
        )
    )
    unmatched = result.scalars().first()
    if not unmatched:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unmatched transaction not found")

    await db.delete(unmatched)
    await db.commit()
    return JSONResponse(content={"message": "Dismissed"})
