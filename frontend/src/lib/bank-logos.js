import axisLogo from "@/assets/bank-logos/axis.png";
import federalLogo from "@/assets/bank-logos/federal.png";
import hdfcLogo from "@/assets/bank-logos/hdfc.png";
import hsbcLogo from "@/assets/bank-logos/hsbc.png";
import iciciLogo from "@/assets/bank-logos/icici.png";

export const KNOWN_BANK_LOGOS = {
  axis: axisLogo,
  federal: federalLogo,
  hdfc: hdfcLogo,
  hsbc: hsbcLogo,
  icici: iciciLogo,
};

const dynamicLogos = {};
try {
  const globModules = import.meta.glob(
    "@/assets/bank-logos/*.{png,jpg,jpeg,svg,webp}",
    { eager: true, import: "default" }
  );
  for (const [filePath, src] of Object.entries(globModules)) {
    const fileName = filePath.split("/").pop()?.split(".")[0]?.toLowerCase();
    if (fileName && src) {
      dynamicLogos[fileName] = src;
    }
  }
} catch {}

export const ALL_BANK_LOGOS = {
  ...KNOWN_BANK_LOGOS,
  ...dynamicLogos,
};

const BANK_ALIASES = {
  axis: ["axis"],
  federal: ["federal"],
  hdfc: ["hdfc"],
  icici: ["icici"],
  hsbc: ["hsbc"],
  sbi: ["sbi", "state bank"],
  kotak: ["kotak"],
  amex: ["amex", "american express"],
  citi: ["citi", "citibank"],
  scb: ["scb", "standard chartered"],
  rbl: ["rbl"],
  idfc: ["idfc"],
  pnb: ["pnb", "punjab national"],
  bob: ["bob", "bank of baroda"],
  yes: ["yes bank", "yes"],
};

export function getBankLogo(bankName, cardName) {
  const combined = `${bankName || ""} ${cardName || ""}`.toLowerCase().trim();
  if (!combined) return undefined;

  for (const [key, aliases] of Object.entries(BANK_ALIASES)) {
    if (aliases.some((alias) => combined.includes(alias))) {
      if (ALL_BANK_LOGOS[key]) {
        return ALL_BANK_LOGOS[key];
      }
    }
  }

  for (const [key, logoUrl] of Object.entries(ALL_BANK_LOGOS)) {
    if (combined.includes(key)) {
      return logoUrl;
    }
  }

  return undefined;
}
