from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.dependencies import get_curr_user
from .recommendation_service import get_recommendations, invalidate_cache

recommendations_router = APIRouter(tags=["recommendations"])


@recommendations_router.get(
    "/",
    summary="Get AI-powered credit card recommendations based on your real spending",
)
async def get_card_recommendations(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_curr_user),
):
    try:
        result = await get_recommendations(user_id=current_user.user_id, db=db)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate recommendations: {str(e)}",
        )


@recommendations_router.post(
    "/invalidate-cache",
    summary="Clear cached recommendations for the current user",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def clear_recommendations_cache(
    current_user=Depends(get_curr_user),
):
    await invalidate_cache(user_id=current_user.user_id)
