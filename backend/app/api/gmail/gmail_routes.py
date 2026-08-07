from fastapi import APIRouter, Depends, status
from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from .gmail_service import gmail_service
from app.api.dependencies import get_curr_user
from .parsers.parse_axis import parse_axis
from .parsers.parse_federal import parse_federal
from app.celery_task import ingest_gmail_for_user, c_app
from fastapi.responses import JSONResponse
from celery.result import AsyncResult

gmail_router = APIRouter(tags=["gmail-routes"])

PARSERS = {
    "alerts@axis.bank.in": parse_axis,
    "fedmail@federal.bank.in": parse_federal,
}

@gmail_router.post(
    "/discover-cards",
    summary="Scan Gmail and return new cards found (no DB writes)",
)
async def discover_cards(
    after_date: str = "2026/01/01",
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_curr_user),
):
    user_id = str(current_user.user_id)
    gmail_client = await gmail_service.get_gmail_client(db, user_id=user_id)
    discovered = await gmail_service.discover_cards(
        db=db,
        user_id=user_id,
        gmail_client=gmail_client,
        parsers=PARSERS,
        after_date=after_date,
    )
    return {
        "new_cards_found": len(discovered),
        "cards": discovered,
    }

@gmail_router.post("/ingest", summary="Ingest Gmail transactions into registered cards")
async def ingest_gmail(
    after_date: str = "2026/07/25",
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_curr_user),
):
    user_id = str(current_user.user_id)
    task = ingest_gmail_for_user.delay(user_id, after_date)
    return JSONResponse(
        status_code=status.HTTP_202_ACCEPTED,
        content={
            "message": "Gmail ingestion started in the background.",
            "task_id": task.id,
        },
    )


@gmail_router.get("/task/{task_id}", summary="Check background ingestion task status")
async def get_task_status(task_id: str):
    result = AsyncResult(task_id, app=c_app)
    response = {"task_id": task_id, "status": result.state}
    if result.state == "SUCCESS":
        response["result"] = result.result
    elif result.state == "FAILURE":
        response["error"] = str(result.result)
    return response
