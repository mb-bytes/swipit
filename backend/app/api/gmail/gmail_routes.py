from fastapi import APIRouter, Depends, HTTPException, status
from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .gmail_service import gmail_service
from app.api.dependencies import get_curr_user, get_curr_user_flexible
from .parsers.parse_axis import parse_axis
from .parsers.parse_federal import parse_federal, strip_html_tags
from app.celery_task import ingest_gmail_for_user, c_app
from fastapi.responses import JSONResponse
from celery.result import AsyncResult
from app.db.models.cards import CardModel
import uuid

gmail_router = APIRouter(tags=["gmail-routes"])

PARSERS = {
    "alerts@axis.bank.in": parse_axis,
    "fedmail@federal.bank.in": parse_federal,
}

@gmail_router.post("/ingest", summary="Ingest Gmail transactions into registered cards")
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


@gmail_router.get("/task/{task_id}", summary="Check background ingestion task status")
@gmail_router.get("/status/{task_id}", summary="Check status of a background Gmail ingest task")
async def get_task_status(task_id: str):
    result = AsyncResult(task_id, app=c_app)
    response = {"task_id": task_id, "status": result.state}
    if result.successful():
        response["result"] = result.result
    elif result.failed():
        response["error"] = str(result.result)
    return response


@gmail_router.get("/debug-parse", summary="Debug: fetch and parse recent bank emails without saving")
async def debug_parse(
    sender: str = "fedmail@federal.bank.in",
    after_date: str = "2026/01/01",
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_curr_user_flexible),
):
    import asyncio
    import traceback as tb

    parser = PARSERS.get(sender)
    if not parser:
        raise HTTPException(status_code=400, detail=f"No parser registered for sender: {sender}")

    gmail_client = await gmail_service.get_gmail_client(db, user_id=str(current_user.user_id))
    messages = await asyncio.to_thread(gmail_service.search_bank_emails, gmail_client, sender, after_date)
    messages = messages[:limit]

    results = []
    for msg in messages:
        entry: dict = {"message_id": msg["id"]}
        try:
            raw_bytes = await gmail_service.fetch_raw_message_with_retry(gmail_client, msg["id"])
            body, body_type = gmail_service.extract_best_body(raw_bytes)
            entry["body_type"] = body_type

            if body is None:
                entry["outcome"] = "no_body"
                entry["clean_preview"] = None
                entry["parse_result"] = None
            else:
                entry["clean_preview"] = strip_html_tags(body)[:400]
                try:
                    parsed = parser(body)
                    entry["outcome"] = "parsed" if parsed else "skipped_not_transaction"
                    entry["parse_result"] = parsed
                except ValueError as e:
                    entry["outcome"] = "parse_error"
                    entry["parse_result"] = str(e)
                except Exception as e:
                    entry["outcome"] = "exception"
                    entry["parse_result"] = tb.format_exc()
        except Exception as e:
            entry["outcome"] = "fetch_error"
            entry["parse_result"] = str(e)

        results.append(entry)

    import json
    from fastapi import Response
    payload = {"sender": sender, "fetched": len(messages), "results": results}
    return Response(
        content=json.dumps(payload, indent=2, default=str),
        media_type="application/json"
    )
