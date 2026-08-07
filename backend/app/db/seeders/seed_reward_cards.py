
CARDS=[
  {
    "bank_name": "Axis Bank",
    "product_name": "Axis Flipkart Credit Card",
    "card_network": "Mastercard",
    "reward_type": "cashback",
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
  },
  {
    "bank_name": "Axis Bank",
    "product_name": "Axis Neo Credit Card",
    "card_network": "RuPay",
    "reward_type": "points",
    "base_rate": {
      "rate_type": "points_per_amount",
      "points": 1,
      "per_spend_amount": 200,
      "capping": None
    },
    "merchant_rates": [],
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
        "gift_card"
      ],
      "merchants": []
    }
  },
  {
    "bank_name": "Axis Bank",
    "product_name": "Axis MyZone Credit Card",
    "card_network": "Mastercard",
    "reward_type": "points",
    "base_rate": {
      "rate_type": "points_per_amount",
      "points": 4,
      "per_spend_amount": 200,
      "capping": None
    },
    "merchant_rates": [],
    "category_rates": [],
    "exclusions": {
      "categories": [
        "movie",
        "fuel",
        "insurance",
        "wallet_load",
        "rent",
        "utility",
        "telecom",
        "gold",
        "jewellery",
        "education",
        "government",
        "emi",
        "cash_advance",
        "repayment",
        "gift_card",
        "toll",
        "road_fee"
      ],
      "merchants": []
    }
  },
  {
    "bank_name": "Axis Bank",
    "product_name": "Axis Magnus Credit Card",
    "card_network": "Mastercard",
    "reward_type": "points",
    "base_rate": {
      "rate_type": "points_per_amount",
      "points": 12,
      "per_spend_amount": 200,
      "capping": None
    },
    "spend_tiers": [
      {
        "condition": {
          "type": "monthly_incremental_spend",
          "minimum_spend_amount": 150000
        },
        "rate_type": "points_per_amount",
        "points": 35,
        "per_spend_amount": 200,
        "capping": None
      }
    ],
    "merchant_rates": [],
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
        "charges"
      ],
      "merchants": []
    }
  },
  {
    "bank_name": "Axis Bank",
    "product_name": "Axis Rewards Credit Card",
    "card_network": "Visa",
    "reward_type": "points",
    "base_rate": {
      "rate_type": "points_per_amount",
      "points": 2,
      "per_spend_amount": 125,
      "capping": None
    },
    "merchant_rates": [
      {
        "merchants": [
          "departmental_store",
          "apparel_store"
        ],
        "rate_type": "points_per_amount",
        "points": 20,
        "per_spend_amount": 125,
        "capping": {
          "cap_amount": 7000,
          "cap_period": "calendar_month",
          "cap_type": "eligible_spend",
          "cap_scope": "merchant",
          "after_cap": {
            "action": "fallback_to_base_rate"
          }
        }
      }
    ],
    "category_rates": [],
    "milestones": [
      {
        "condition": {
          "type": "spend_threshold",
          "spend_amount": 30000,
          "period": "statement_month"
        },
        "reward": {
          "rate_type": "fixed_points",
          "points": 1500
        }
      }
    ],
    "exclusions": {
      "categories": [
        "transportation",
        "toll",
        "utility",
        "telecom",
        "insurance",
        "education",
        "government",
        "wallet_load",
        "rent",
        "fuel",
        "emi",
        "cash_advance",
        "repayment",
        "fees",
        "charges"
      ],
      "merchants": []
    }
  },
  {
    "bank_name": "Federal Bank",
    "product_name": "Federal Bank Celesta Credit Card",
    "card_network": "Visa",
    "reward_type": "points",
    "base_rate": {
      "rate_type": "points_per_amount",
      "points": 1,
      "per_spend_amount": 100,
      "capping": None
    },
    "merchant_rates": [],
    "category_rates": [
      {
        "categories": [
          "travel",
          "airlines",
          "hotels",
          "international"
        ],
        "rate_type": "points_multiplier",
        "multiplier": 3.0,
        "base_points": 1,
        "per_spend_amount": 100,
        "capping": None
      },
      {
        "categories": ["dining"],
        "rate_type": "points_multiplier",
        "multiplier": 2.0,
        "base_points": 1,
        "per_spend_amount": 100,
        "capping": None
      }
    ],
    "exclusions": {
      "categories": [
        "fuel",
        "wallet_load",
        "cash_advance",
        "rent",
        "government",
        "fees",
        "charges",
        "repayment",
        "emi"
      ],
      "merchants": []
    }
  },
  {
    "bank_name": "Federal Bank",
    "product_name": "Federal Bank Scapia Credit Card",
    "card_network": "Visa",
    "reward_type": "cashback",
    "base_rate": {
      "rate_type": "percentage",
      "rate": 10.0,
      "capping": None
    },
    "merchant_rates": [
      {
        "merchants": [
          "scapia_app",
          "scapia_travel"
        ],
        "rate_type": "percentage",
        "rate": 20.0,
        "capping": None
      }
    ],
    "category_rates": [],
    "network_rates": [
      {
        "card_network": "RuPay",
        "rate_type": "percentage",
        "rate": 5.0,
        "minimum_transaction_amount": 500,
        "capping": None
      }
    ],
    "exclusions": {
      "categories": [
        "money_transfer",
        "rent",
        "cash_advance",
        "emi",
        "forex",
        "education",
        "school_fee",
        "gift_card",
        "repayment",
        "crypto",
        "digital_asset",
        "fuel",
        "wallet_load",
        "government",
        "utility",
        "telecom"
      ],
      "merchants": []
    }
  },
  {
    "bank_name": "Federal Bank",
    "product_name": "Federal Bank Wave Credit Card",
    "card_network": "Visa",
    "reward_type": "points",
    "base_rate": {
      "rate_type": "points_per_amount",
      "points": 1,
      "per_spend_amount": 200,
      "capping": None
    },
    "merchant_rates": [],
    "category_rates": [],
    "milestones": [
      {
        "condition": {
          "type": "spend_threshold",
          "spend_amount": 50000,
          "period": "first_quarter_after_issuance"
        },
        "reward": {
          "rate_type": "fixed_points",
          "points": 1000
        }
      }
    ],
    "introductory_offers": [
      {
        "offer_type": "cashback",
        "rate_type": "percentage",
        "rate": 10.0,
        "category": "upi",
        "transaction_count": 5,
        "period": "first_30_days",
        "capping": {
          "cap_amount": 200,
          "cap_period": "offer_period",
          "cap_type": "reward_amount",
          "cap_scope": "offer",
          "after_cap": {
            "action": "zero_reward"
          }
        }
      }
    ],
    "exclusions": {
      "categories": [
        "fuel",
        "rent",
        "wallet_load",
        "cash_advance",
        "repayment",
        "fees",
        "charges",
        "emi"
      ],
      "merchants": []
    }
  },
  {
    "bank_name": "Federal Bank",
    "product_name": "Federal Bank Imperio Credit Card",
    "card_network": "Visa",
    "reward_type": "points",
    "base_rate": {
      "rate_type": "points_per_amount",
      "points": 1,
      "per_spend_amount": 150,
      "capping": None
    },
    "merchant_rates": [],
    "category_rates": [
      {
        "categories": [
          "healthcare",
          "grocery"
        ],
        "rate_type": "points_per_amount",
        "points": 3,
        "per_spend_amount": 150,
        "capping": None
      },
      {
        "categories": ["utility"],
        "rate_type": "points_per_amount",
        "points": 2,
        "per_spend_amount": 150,
        "capping": None
      }
    ],
    "exclusions": {
      "categories": [
        "fuel",
        "wallet_load",
        "cash_advance",
        "rent",
        "government",
        "fees",
        "charges",
        "repayment",
        "emi"
      ],
      "merchants": []
    }
  },
  {
    "bank_name": "Axis Bank",
    "product_name": "Axis IndianOil Credit Card",
    "card_network": "Mastercard",
    "reward_type": "points",
    "base_rate": {
      "rate_type": "points_per_amount",
      "points": 1,
      "per_spend_amount": 100,
      "capping": None
    },
    "merchant_rates": [
      {
        "merchants": [
          "indianoil",
          "iocl"
        ],
        "rate_type": "points_per_amount",
        "points": 20,
        "per_spend_amount": 100,
        "capping": {
          "cap_amount": 5000,
          "cap_period": "calendar_month",
          "cap_type": "eligible_spend",
          "cap_scope": "merchant",
          "after_cap": {
            "action": "fallback_to_base_rate"
          }
        }
      },
      {
        "merchants": ["online_shopping"],
        "rate_type": "points_per_amount",
        "points": 5,
        "per_spend_amount": 100,
        "capping": {
          "cap_amount": 5000,
          "cap_period": "calendar_month",
          "cap_type": "eligible_spend",
          "cap_scope": "merchant",
          "after_cap": {
            "action": "fallback_to_base_rate"
          }
        }
      }
    ],
    "category_rates": [
      {
        "categories": [
          "grocery",
          "supermarket"
        ],
        "rate_type": "points_per_amount",
        "points": 2,
        "per_spend_amount": 100,
        "capping": None
      }
    ],
    "exclusions": {
      "categories": [
        "utility",
        "telecom",
        "rent",
        "wallet_load",
        "government",
        "insurance",
        "gold",
        "jewellery",
        "education",
        "emi",
        "cash_advance",
        "fees",
        "charges",
        "repayment"
      ],
      "merchants": []
    }
  },
  {
    "bank_name": "Axis Bank",
    "product_name": "Axis Atlas Credit Card",
    "card_network": "Mastercard",
    "reward_type": "miles",
    "base_rate": {
      "rate_type": "points_per_amount",
      "points": 2,
      "per_spend_amount": 100,
      "capping": None
    },
    "merchant_rates": [],
    "category_rates": [
      {
        "categories": [
          "airlines",
          "hotels",
          "travel"
        ],
        "rate_type": "points_per_amount",
        "points": 5,
        "per_spend_amount": 100,
        "capping": {
          "cap_amount": 200000,
          "cap_period": "calendar_month",
          "cap_type": "eligible_spend",
          "cap_scope": "category",
          "after_cap": {
            "action": "fallback_to_base_rate"
          }
        }
      }
    ],
    "exclusions": {
      "categories": [
        "fuel",
        "rent",
        "wallet_load",
        "government",
        "utility",
        "telecom",
        "insurance",
        "gold",
        "jewellery",
        "education",
        "cash_advance",
        "repayment",
        "fees",
        "charges",
        "emi"
      ],
      "merchants": []
    }
  },
  {
    "bank_name": "Axis Bank",
    "product_name": "Other Axis Bank Credit Card",
    "card_network": None,
    "reward_type": None,
    "base_rate": {
      "rate_type": "unknown",
      "rate": None,
      "capping": None
    },
    "merchant_rates": [],
    "category_rates": [],
    "exclusions": {
      "categories": [],
      "merchants": []
    },
    "status": "requires_specific_product_name"
  },
  {
    "bank_name": "Federal Bank",
    "product_name": "Other Federal Bank Credit Card",
    "card_network": None,
    "reward_type": None,
    "base_rate": {
      "rate_type": "unknown",
      "rate": None,
      "capping": None
    },
    "merchant_rates": [],
    "category_rates": [],
    "exclusions": {
      "categories": [],
      "merchants": []
    },
    "status": "requires_specific_product_name"
  }
]
