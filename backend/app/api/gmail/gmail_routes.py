from fastapi import APIRouter, Depends
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

parsers = {
    "alerts@axis.bank.in": parse_axis,
    "fedmail@federal.bank.in": parse_federal
}

@gmail_router.post("/ingest", status_code=202)
async def ingest_gmail(db: AsyncSession = Depends(get_db), current_user=Depends(get_curr_user)):
    user_id = str(current_user.user_id)
    task = ingest_gmail_for_user.delay(user_id)
    return JSONResponse(
        status_code=202,
        content={
            "message": "Gmail ingestion started in the background.",
            "task_id": task.id,
        }
    )


@gmail_router.get("/task/{task_id}")
async def get_task_status(task_id: str):
    
    result = AsyncResult(task_id, app=c_app)

    response = {"task_id": task_id, "status": result.state}

    if result.state == "SUCCESS":
        response["result"] = result.result
    elif result.state == "FAILURE":
        response["error"] = str(result.result)

    return response



