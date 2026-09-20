from __future__ import annotations

import json
import os
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Any

from openai import AsyncOpenAI
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.models.cards import CardModel, Transaction
from app.redis.redis import redis as redis_client

CACHE_TTL_SECONDS = 86400
CACHE_KEY_PREFIX = "recommendations"
LOOKBACK_DAYS = 120
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

def _build_prompt(
    summary: dict[str, Any],
    preferred_category: str | None = None,
    preferred_merchant: str | None = None,
    preferred_bank: str | None = None,
) -> str:
    categories_text = "\n".join(
        f"  - {c['category'].replace('_', ' ').title()}: "
        f"₹{c['total_spend']:,.0f} total | ₹{c['monthly_avg']:,.0f}/month | {c['pct_of_total']}% of spend"
        for c in summary["top_categories"]
    ) or "  - No recorded transaction categories yet (rely on user stated preferences)"

    merchants_text = ", ".join(m["merchant"] for m in summary["top_merchants"]) or "No recent merchants"

    pref_lines = []
    if preferred_category:
        pref_lines.append(f"- Preferred Spending Category: {preferred_category.replace('_', ' ').title()}")
    if preferred_merchant:
        pref_lines.append(f"- Preferred Merchant / Brand: {preferred_merchant}")
    if preferred_bank:
        pref_lines.append(f"- Preferred Bank: {preferred_bank}")

    preferences_section = ""
    if pref_lines:
        preferences_section = "\n## User's Stated Preferences\n" + "\n".join(pref_lines) + "\n"

    cards_json = json.dumps(CARDS_REFERENCE, indent=2)

    return f"""You are a financial advisor specialising in Indian credit cards.

## User's Spending Profile (last {int(summary['months_analysed'])} months)
- Monthly average spend: ₹{summary['monthly_avg_spend']:,.0f}
- Top spending categories:
{categories_text}
- Top merchants: {merchants_text}
{preferences_section}
## Available Card Reference Dataset
{cards_json}

## Your Task
Based on the user's spending data and their stated preferences above, recommend exactly 2-3 credit cards from the reference dataset that would maximise their rewards and align with their preferences.

Rules:
- Only recommend cards from the reference dataset provided.
- If the user specified a preferred bank, give strong priority to recommending a competitive card from that bank if one exists in the dataset.
- If the user specified a preferred category or merchant, ensure recommended cards provide high rewards for that category/merchant.
- For each recommendation, calculate an estimated monthly reward value in INR based on the user's monthly spend in each category. If spend is zero, estimate based on average ₹25,000 monthly spend.
- Be specific — mention why this card fits their category or stated preferences in the "why" field.
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
    "why": "Specific 1-2 sentence reason referencing user's actual spend amounts or preferences",
    "top_perk": "One standout benefit of this card"
  }}
]"""

def _heuristic_recommendations(
    summary: dict[str, Any],
    preferred_category: str | None = None,
    preferred_merchant: str | None = None,
    preferred_bank: str | None = None,
) -> list[dict[str, Any]]:
    scored_cards = []
    cat_target = (preferred_category or "").lower().replace(" ", "_")
    merch_target = (preferred_merchant or "").lower()
    bank_target = (preferred_bank or "").lower()

    for card in CARDS_REFERENCE:
        score = 0
        card_bank = card.get("bank", "").lower()
        card_name = card.get("card_name", "").lower()
        best_for = [b.lower() for b in card.get("best_for", [])]
        highlights = card.get("highlights", "").lower()

        if bank_target and bank_target in card_bank:
            score += 15
        if cat_target and any(cat_target in b or b in cat_target for b in best_for):
            score += 8
        if merch_target and (merch_target in card_name or merch_target in highlights):
            score += 8

        for top_cat in summary.get("top_categories", []):
            cat_name = top_cat.get("category", "").lower()
            if any(cat_name in b for b in best_for):
                score += 4

        scored_cards.append((score, card))

    scored_cards.sort(key=lambda x: x[0], reverse=True)
    top_picks = [c[1] for c in scored_cards[:3]]

    results = []
    for c in top_picks:
        annual_fee = c.get("annual_fee", 500)
        est_monthly = 650 if annual_fee > 2000 else 400
        results.append({
            "card_name": c.get("card_name"),
            "bank": c.get("bank"),
            "annual_fee": annual_fee,
            "best_for_categories": c.get("best_for", ["online_shopping"])[:2],
            "estimated_monthly_reward_inr": est_monthly,
            "estimated_annual_net_benefit_inr": (est_monthly * 12) - annual_fee,
            "why": f"Tailored to maximize your returns with {c.get('highlights', 'industry leading rewards')}.",
            "top_perk": c.get("top_rewards", [{}])[0].get("note", c.get("highlights", "High cashback rate")),
        })
    return results

async def get_ai_recommendations(
    summary: dict[str, Any],
    preferred_category: str | None = None,
    preferred_merchant: str | None = None,
    preferred_bank: str | None = None,
) -> list[dict[str, Any]]:
    prompt = _build_prompt(
        summary,
        preferred_category=preferred_category,
        preferred_merchant=preferred_merchant,
        preferred_bank=preferred_bank,
    )

    try:
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
    except Exception as e:
        print(f"[recommendations] AI completion error: {e}, falling back to heuristic")
        return _heuristic_recommendations(
            summary,
            preferred_category=preferred_category,
            preferred_merchant=preferred_merchant,
            preferred_bank=preferred_bank,
        )

def _normalize_recommendations(recs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    for r in recs:
        if "best_for_categories" in r and isinstance(r["best_for_categories"], list):
            r["best_for_categories"] = [
                str(c).replace("_", " ").title() for c in r["best_for_categories"]
            ]
    return recs

async def get_recommendations(
    user_id: uuid.UUID,
    db: AsyncSession,
    preferred_category: str | None = None,
    preferred_merchant: str | None = None,
    preferred_bank: str | None = None,
    only_cached: bool = False,
) -> dict[str, Any]:
    cache_key = f"{CACHE_KEY_PREFIX}:{user_id}"

    try:
        cached = await redis_client.get(cache_key)
        if cached:
            res = json.loads(cached)
            res["cached"] = True
            try:
                ttl = await redis_client.ttl(cache_key)
                res["ttl_seconds"] = max(0, ttl) if (ttl is not None and ttl > 0) else 0
            except Exception:
                res["ttl_seconds"] = 0
            if "recommendations" in res and isinstance(res["recommendations"], list):
                res["recommendations"] = _normalize_recommendations(res["recommendations"])
            return res
    except Exception as e:
        print(f"[recommendations] Redis read error: {e}")

    if only_cached:
        return {"cached": False, "recommendations": []}

    summary = await summarize_spending(user_id, db)
    recommendations = await get_ai_recommendations(
        summary,
        preferred_category=preferred_category,
        preferred_merchant=preferred_merchant,
        preferred_bank=preferred_bank,
    )
    recommendations = _normalize_recommendations(recommendations)

    now_iso = datetime.now(timezone.utc).isoformat()
    result = {
        "spending_summary": summary,
        "recommendations": recommendations,
        "preferences": {
            "preferred_category": preferred_category,
            "preferred_merchant": preferred_merchant,
            "preferred_bank": preferred_bank,
        },
        "cached": True,
        "evaluated_at": now_iso,
        "ttl_seconds": CACHE_TTL_SECONDS,
    }

    try:
        await redis_client.setex(cache_key, CACHE_TTL_SECONDS, json.dumps(result))
        ttl = await redis_client.ttl(cache_key)
        result["cached"] = True
        result["ttl_seconds"] = max(0, ttl) if (ttl is not None and ttl > 0) else CACHE_TTL_SECONDS
    except Exception as e:
        print(f"[recommendations] Redis set error: {e}")
        result["cached"] = False
        result["ttl_seconds"] = 0

    return result

async def get_cache_ttl(user_id: uuid.UUID) -> dict[str, Any]:
    cache_key = f"{CACHE_KEY_PREFIX}:{user_id}"
    try:
        ttl = await redis_client.ttl(cache_key)
        if ttl is not None and ttl > 0:
            return {"cached": True, "ttl_seconds": ttl}
        return {"cached": False, "ttl_seconds": 0}
    except Exception as e:
        print(f"[recommendations] Redis ttl error: {e}")
        return {"cached": False, "ttl_seconds": 0}

async def invalidate_cache(user_id: uuid.UUID) -> None:
    cache_key = f"{CACHE_KEY_PREFIX}:{user_id}"
    try:
        await redis_client.delete(cache_key)
    except Exception as e:
        print(f"[recommendations] Redis delete error: {e}")
