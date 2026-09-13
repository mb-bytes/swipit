const MERCHANT_DISPLAY_MAP = {
  flipkart: "Flipkart",
  amazon: "Amazon",
  myntra: "Myntra",
  swiggy: "Swiggy",
  instamart: "Instamart",
  zomato: "Zomato",
  blinkit: "Blinkit",
  zepto: "Zepto",
  bigbasket: "BigBasket",
  cleartrip: "Cleartrip",
  makemytrip: "MakeMyTrip",
  bookmyshow: "BookMyShow",
  "cult.fit": "Cult.fit",
  uber: "Uber",
  ola: "Ola",
  netflix: "Netflix",
  spotify: "Spotify",
  pvr: "PVR",
  paytm: "Paytm",
  phonepe: "PhonePe",
  cred: "Cred",
};

const MERCHANT_MATCHERS = [
  { key: "flipkart", patterns: ["flipkar", "flipka", "fkart", "flipkart"] },
  { key: "amazon", patterns: ["amzn", "amazn", "amazonpay", "amazon"] },
  { key: "myntra", patterns: ["myntr", "mynt", "myntra"] },
  { key: "swiggy", patterns: ["swigy", "swiggi", "swiggy"] },
  { key: "instamart", patterns: ["instama", "instamart"] },
  { key: "zomato", patterns: ["zomto", "zmt", "zomato"] },
  { key: "blinkit", patterns: ["blnkit", "blinkit", "grofers", "blinki"] },
  { key: "zepto", patterns: ["zeptonow", "zepto"] },
  { key: "bigbasket", patterns: ["bbdaily", "bbinstant", "bigbasket"] },
  { key: "cleartrip", patterns: ["cleartrp", "clrtrip", "cltrip", "cleartrip"] },
  { key: "makemytrip", patterns: ["mmt", "makemytrip"] },
  { key: "bookmyshow", patterns: ["bms", "bookmyshow"] },
  { key: "cult.fit", patterns: ["cultfit", "curefit", "cult.fit"] },
  { key: "uber", patterns: ["uber"] },
  { key: "ola", patterns: ["olacabs", "ola"] },
  { key: "netflix", patterns: ["nflx", "netflix"] },
  { key: "spotify", patterns: ["sptfy", "spotify"] },
  { key: "pvr", patterns: ["pvrcinemas", "pvr"] },
  { key: "paytm", patterns: ["paytm"] },
  { key: "phonepe", patterns: ["phonepe"] },
  { key: "cred", patterns: ["cred"] },
];

export function beautifyMerchantName(rawName) {
  if (!rawName) return "Unknown";
  let str = String(rawName).trim();
  if (str.includes("*")) {
    str = str.split("*")[1].trim();
  }
  const clean = str.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  for (const { key, patterns } of MERCHANT_MATCHERS) {
    if (patterns.some((p) => clean.includes(p))) {
      return MERCHANT_DISPLAY_MAP[key] || key.charAt(0).toUpperCase() + key.slice(1);
    }
  }
  const stopWords = new Set(["pvt", "ltd", "pa", "limi", "limited", "india", "in", "corp", "inc", "pay"]);
  const words = str
    .split(/\s+/)
    .filter((w) => !stopWords.has(w.toLowerCase().replace(/[^a-z0-9]/g, "")));
  const base = words.length > 0 ? words.join(" ") : str;
  return base
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

const CATEGORY_DISPLAY_MAP = {
  online_shopping: "Online Shopping",
  shopping: "Shopping",
  food_dining: "Food & Dining",
  dining: "Dining",
  food: "Food",
  groceries: "Groceries",
  grocery: "Groceries",
  travel: "Travel",
  flights: "Flights",
  hotels: "Hotels",
  entertainment: "Entertainment",
  movies: "Movies",
  utilities: "Utilities",
  bills: "Bills & Utilities",
  fuel: "Fuel",
  health_wellness: "Health & Wellness",
  health: "Health",
  medical: "Medical",
  jewellery: "Jewellery",
  jewelry: "Jewellery",
  electronics: "Electronics",
  education: "Education",
  investment: "Investment",
  finance: "Finance",
  insurance: "Insurance",
  personal_care: "Personal Care",
  transportation: "Transportation",
  commute: "Commute",
  other: "Other",
  others: "Other",
  general: "General",
};

export function beautifyCategory(rawCategory) {
  if (!rawCategory) return "";
  const clean = String(rawCategory).trim().toLowerCase();
  if (CATEGORY_DISPLAY_MAP[clean]) {
    return CATEGORY_DISPLAY_MAP[clean];
  }
  // Replace underscores, hyphens, and multiple spaces with a single space
  const words = clean.replace(/[_-]+/g, " ").trim().split(/\s+/);
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
