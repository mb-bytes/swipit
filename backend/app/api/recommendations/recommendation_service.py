from __future__ import annotations

import json
import os
import uuid
from datetime import date, timedelta
from typing import Any

from openai import AsyncOpenAI
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.models.cards import CardModel, Transaction
from app.redis.redis import redis as redis_client

CACHE_TTL_SECONDS = 3600  # 1 hour
CACHE_KEY_PREFIX = "recommendations"
LOOKBACK_DAYS = 90
TOP_N_CATEGORIES = 3
TOP_N_MERCHANTS = 5

_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
_CARDS_REFERENCE_PATH = os.path.join(_DATA_DIR, "indian_cards_reference.json")

_openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

with open(_CARDS_REFERENCE_PATH, "r", encoding="utf-8") as _f:
    CARDS_REFERENCE: list[dict] = json.load(_f)

async def summarize_spending(user_id: uuid.UUID, db: AsyncSession) -> dict[str, Any]:
    since = date.today() - timedelta(days=LOOKBACK_DAYS)

    card_ids_result = await db.execute(
        select(CardModel.card_id).where(CardModel.user_id == user_id)
    )
    card_ids = [row[0] for row in card_ids_result.all()]

    if not card_ids:
        return {
            "top_categories": [],
            "top_merchants": [],
            "monthly_avg_spend": 0.0,
            "total_spend": 0.0,
            "months_analysed": LOOKBACK_DAYS / 30,
        }

    category_rows = await db.execute(
        select(Transaction.category, func.sum(Transaction.amount).label("total"))
        .where(
            Transaction.card_id.in_(card_ids),
            Transaction.transaction_date >= since,
            Transaction.category.isnot(None),
        )
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
    )
    category_totals: list[tuple[str, float]] = [
        (row.category, float(row.total)) for row in category_rows.all()
    ]

    merchant_rows = await db.execute(
        select(Transaction.merchant, func.sum(Transaction.amount).label("total"))
        .where(
            Transaction.card_id.in_(card_ids),
            Transaction.transaction_date >= since,
        )
        .group_by(Transaction.merchant)
        .order_by(func.sum(Transaction.amount).desc())
        .limit(TOP_N_MERCHANTS)
    )
    top_merchants = [
        {"merchant": row.merchant, "total_spend": float(row.total)}
        for row in merchant_rows.all()
    ]

    grand_total = sum(t for _, t in category_totals)
    months = LOOKBACK_DAYS / 30  

    top_categories = [
        {
            "category": cat,
            "total_spend": total,
            "pct_of_total": round((total / grand_total * 100) if grand_total else 0, 1),
            "monthly_avg": round(total / months, 2),
        }
        for cat, total in category_totals[:TOP_N_CATEGORIES]
    ]

    return {
        "top_categories": top_categories,
        "top_merchants": top_merchants,
        "monthly_avg_spend": round(grand_total / months, 2),
        "total_spend": round(grand_total, 2),
        "months_analysed": months,
    }

def _build_prompt(summary: dict[str, Any]) -> str:
    categories_text = "\n".join(
        f"  - {c['category'].replace('_', ' ').title()}: "
        f"₹{c['total_spend']:,.0f} total | ₹{c['monthly_avg']:,.0f}/month | {c['pct_of_total']}% of spend"
        for c in summary["top_categories"]
    )
    merchants_text = ", ".join(m["merchant"] for m in summary["top_merchants"]) or "N/A"

    cards_json = json.dumps(CARDS_REFERENCE, indent=2)

    return f"""You are a financial advisor specialising in Indian credit cards.

## User's Spending Profile (last {int(summary['months_analysed'])} months)
- Monthly average spend: ₹{summary['monthly_avg_spend']:,.0f}
- Top spending categories:
{categories_text}
- Top merchants: {merchants_text}

## Available Card Reference Dataset
{cards_json}

## Your Task
Based on the user's ACTUAL spending data above, recommend exactly 2-3 credit cards from the reference dataset that would maximise their rewards.

Rules:
- Only recommend cards from the reference dataset provided.
- For each recommendation, calculate an estimated monthly reward value in INR based on the user's monthly spend in each category.
- Be specific — mention the user's actual category spending amounts in the "why" field.
- Prefer cards where the top reward categories closely match the user's top spending categories.
- Consider annual fee vs estimated annual reward value (reward - annual_fee should be positive).

Return ONLY a valid JSON array with this exact structure (no markdown, no extra text):
[
  {{
    "card_name": "Full card name from dataset",
    "bank": "Bank name from dataset",
    "annual_fee": 1000,
    "best_for_categories": ["category1", "category2"],
    "estimated_monthly_reward_inr": 450,
    "estimated_annual_net_benefit_inr": 4400,
    "why": "Specific 1-2 sentence reason referencing user's actual spend amounts",
    "top_perk": "One standout benefit of this card"
  }}
]"""


async def get_ai_recommendations(summary: dict[str, Any]) -> list[dict[str, Any]]:
    prompt = _build_prompt(summary)

    response = await _openai_client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=1500,
        temperature=0.2,
        messages=[
            {
                "role": "system",
                "content": "You are a helpful financial advisor. Always respond with valid JSON only, no markdown or extra text.",
            },
            {"role": "user", "content": prompt},
        ],
    )

    raw = response.choices[0].message.content.strip()

    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    return json.loads(raw)

async def get_recommendations(user_id: uuid.UUID, db: AsyncSession) -> dict[str, Any]:
    cache_key = f"{CACHE_KEY_PREFIX}:{user_id}"

    cached = await redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    summary = await summarize_spending(user_id, db)
    recommendations = await get_ai_recommendations(summary)

    result = {
        "spending_summary": summary,
        "recommendations": recommendations,
        "cached": False,
    }

    await redis_client.setex(cache_key, CACHE_TTL_SECONDS, json.dumps(result))

    return result


async def invalidate_cache(user_id: uuid.UUID) -> None:
    cache_key = f"{CACHE_KEY_PREFIX}:{user_id}"
    await redis_client.delete(cache_key)
