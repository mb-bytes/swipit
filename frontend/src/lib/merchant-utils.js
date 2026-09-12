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
  { key: "blinkit", patterns: ["blnkit", "blinkit", "grofers"] },
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
