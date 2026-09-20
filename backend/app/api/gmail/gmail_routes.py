from fastapi import APIRouter, Depends, HTTPException, status
from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .gmail_service import gmail_service
from app.api.dependencies import get_curr_user, rate_limit
from .parsers.parse_axis import parse_axis
from .parsers.parse_federal import parse_federal
from app.celery_task import ingest_gmail_for_user, c_app
from celery.result import AsyncResult
from app.db.models.cards import CardModel
from datetime import date, timedelta

gmail_router = APIRouter(tags=["gmail-routes"])

PARSERS = {
    "alerts@axis.bank.in": parse_axis,
    "fedmail@federal.bank.in": parse_federal,
}


@gmail_router.post("/ingest", summary="Ingest Gmail transactions into registered cards", dependencies=[Depends(rate_limit(10, 60))])
async def ingest_gmail(
    after_date: str = "2026/07/25",
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_curr_user),
):
    user_id = current_user.user_id
    card_result = await db.execute(
        select(CardModel).where(CardModel.user_id == user_id).limit(1)
    )
    if not card_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please register at least one card before syncing Gmail transactions",
        )

    task = ingest_gmail_for_user.delay(str(user_id), after_date)
    return {
        "status": "pending",
        "task_id": task.id,
        "message": "Gmail sync has started in the background",
    }


@gmail_router.post("/sync-last-5-days", summary="Ingest last 5 days of Gmail transactions", dependencies=[Depends(rate_limit(10, 60))])
async def sync_last_5_days(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_curr_user),
):
    user_id = current_user.user_id
    card_result = await db.execute(
        select(CardModel).where(CardModel.user_id == user_id).limit(1)
    )
    if not card_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please register at least one card before syncing Gmail transactions",
        )

    after_date = (date.today() - timedelta(days=5)).strftime("%Y/%m/%d")
    task = ingest_gmail_for_user.delay(str(user_id), after_date)
    return {
        "status": "pending",
        "task_id": task.id,
        "message": "Gmail sync has started in the background",
    }


@gmail_router.get("/task/{task_id}", summary="Check background ingestion task status")
async def get_task_status(task_id: str):
    result = AsyncResult(task_id, app=c_app)
    response = {"task_id": task_id, "status": result.state}
    if result.successful():
        response["result"] = result.result
    elif result.failed():
        response["error"] = str(result.result)
    return response
