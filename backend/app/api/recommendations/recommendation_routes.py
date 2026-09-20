from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.dependencies import get_curr_user, rate_limit
from .recommendation_service import get_recommendations, invalidate_cache, get_cache_ttl

recommendations_router = APIRouter(tags=["recommendations"])


@recommendations_router.get(
    "/ttl",
    summary="Get remaining TTL for recommendations cache",
)
async def get_recommendations_ttl(
    current_user=Depends(get_curr_user),
):
    return await get_cache_ttl(user_id=current_user.user_id)


@recommendations_router.get(
    "/",
    summary="Get AI-powered credit card recommendations based on your real spending and preferences",
    dependencies=[Depends(rate_limit(60, 60))],
)
async def get_card_recommendations(
    preferred_category: str | None = None,
    preferred_merchant: str | None = None,
    preferred_bank: str | None = None,
    only_cached: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_curr_user),
):
    try:
        result = await get_recommendations(
            user_id=current_user.user_id,
            db=db,
            preferred_category=preferred_category,
            preferred_merchant=preferred_merchant,
            preferred_bank=preferred_bank,
            only_cached=only_cached,
        )
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
