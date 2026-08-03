from openai import AsyncOpenAI
from .categories import TransactionCategory
from .config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

VALID_CATEGORIES = [c.value for c in TransactionCategory]


async def classify_merchant_with_ai(merchant_key: str) -> str:
    prompt = (
        f"Classify the merchant '{merchant_key}' into exactly one of these categories: "
        f"{', '.join(VALID_CATEGORIES)}. "
        "Respond with only the category word, nothing else."
    )

    response = await client.chat.completions.create(
        model="gpt-4o-mini",  
        max_tokens=10,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.choices[0].message.content.strip().lower()
    print(f"AI call for: {merchant_key}")
    
    return raw if raw in VALID_CATEGORIES else TransactionCategory.OTHER.value