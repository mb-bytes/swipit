from fastapi import APIRouter, Depends
from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from .gmail_service import gmail_service
from app.api.dependencies import get_curr_user
from .parsers.parse_axis import parse_axis
from .parsers.parse_federal import parse_federal

gmail_router = APIRouter(tags=["gmail-routes"])

parsers = {
    "alerts@axis.bank.in": parse_axis,
    "fedmail@federal.bank.in": parse_federal
}

@gmail_router.post("/ingest")
async def ingest_gmail(db: AsyncSession = Depends(get_db), current_user=Depends(get_curr_user)):
    user_id = current_user.user_id
    gmail_client = await gmail_service.get_gmail_client(db, user_id=user_id)

    parsed_gmail = await gmail_service.parse_and_save(
        db=db,
        user_id=user_id,
        gmail_client=gmail_client,
        parsers=parsers,
        after_date="2026/07/01"
    )

    return parsed_gmail

