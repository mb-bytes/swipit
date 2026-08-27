import swipitLogo from "@/assets/swipit-logo.png";
import { cn } from "@/lib/utils";

export function BrandLogo({ className = "", size = "md", iconOnly = false, inverted = false }) {
  const sizeMap = {
    sm: { img: "h-8 w-8", text: "text-lg font-bold tracking-[-0.03em]", badge: "text-[11px] px-1.5 py-0.5 ml-1" },
    md: { img: "h-11 w-11", text: "text-2xl font-bold tracking-[-0.035em]", badge: "text-xs px-2 py-0.5 ml-1" },
    lg: { img: "h-14 w-14", text: "text-4xl font-extrabold tracking-[-0.04em]", badge: "text-sm px-2.5 py-1 ml-1.5" },
    xl: { img: "h-18 w-18", text: "text-5xl font-black tracking-[-0.04em]", badge: "text-base px-3 py-1 ml-2" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={cn("inline-flex items-center gap-2.5 group select-none cursor-pointer", className)}>
      <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        <img
          src={swipitLogo}
          alt="SwipIt Logo"
          className={cn("object-contain transition-all duration-300", currentSize.img)}
        />
      </div>

      {!iconOnly && (
        <span className={cn("flex items-center leading-none", inverted ? "text-white" : "text-[#111215]", currentSize.text)}>
          <span className="font-extrabold">Swip</span>
          <span className={cn(
            "font-mono font-bold uppercase rounded shadow-xs transition-colors duration-200 group-hover:bg-[#d9480f] group-hover:text-white",
            inverted ? "bg-white/20 text-white" : "bg-[#111215] text-[#f2eee5]",
            currentSize.badge
          )}>
            It
          </span>
        </span>
      )}
    </div>
  );
}

export default BrandLogo;
