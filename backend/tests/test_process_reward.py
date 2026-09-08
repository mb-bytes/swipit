from app.api.rewards.reward_service import reward_service
from app.api.rewards.reward_schemas import TransactionInput
from datetime import date

config = {
    "base_rate": {
      "rate_type": "percentage",
      "rate": 1.0,
      "capping": None
    },
    "merchant_rates": [
      {
        "merchants": ["myntra"],
        "rate_type": "percentage",
        "rate": 7.5,
        "capping": {
          "cap_amount": 4000,
          "cap_period": "statement_quarter",
          "cap_type": "reward_amount",
          "cap_scope": "merchant",
          "after_cap": {
            "action": "fallback_to_base_rate"
          }
        }
      },
      {
        "merchants": ["flipkart", "cleartrip"],
        "rate_type": "percentage",
        "rate": 5.0,
        "capping": {
          "cap_amount": 4000,
          "cap_period": "statement_quarter",
          "cap_type": "reward_amount",
          "cap_scope": "merchant",
          "after_cap": {
            "action": "fallback_to_base_rate"
          }
        }
      },
      {
        "merchants": ["swiggy", "uber", "pvr", "cult.fit", "fitpass"],
        "rate_type": "percentage",
        "rate": 4.0,
        "capping": None
      }
    ],
    "category_rates": [],
    "exclusions": {
      "categories": [
        "utility",
        "telecom",
        "education",
        "rent",
        "wallet_load",
        "government",
        "insurance",
        "gold",
        "jewellery",
        "fuel",
        "cash_advance",
        "repayment",
        "emi",
        "fees",
        "charges",
        "gift_card"
      ],
      "merchants": []
    }
}

tx = TransactionInput(amount=1000, category="shopping", merchant_key="amazon", card_network="Mastercard", transaction_date=date.today())
result = reward_service.process_reward(config, tx)
print(result)