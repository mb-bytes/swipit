import { useMemo } from "react";
import { cx, sortCx } from "@/lib/cx";
import { PaypassIcon } from "./icons";

const styles = sortCx({
    transparent: {
        root: "bg-black/10 bg-linear-to-br from-white/30 to-transparent backdrop-blur-[6px] before:pointer-events-none before:absolute before:inset-0 before:z-1 before:rounded-[inherit] before:mask-linear-135 before:mask-linear-to-white/20 before:ring-1 before:ring-white/30 before:ring-inset text-white",
        company: "text-white",
        footerText: "text-white",
        paypassIcon: "text-white",
    },
    "transparent-gradient": {
        root: "bg-black/10 bg-linear-to-br from-white/30 to-transparent backdrop-blur-[6px] before:pointer-events-none before:absolute before:inset-0 before:z-1 before:rounded-[inherit] before:mask-linear-135 before:mask-linear-to-white/20 before:ring-1 before:ring-white/30 before:ring-inset text-white",
        company: "text-white",
        footerText: "text-white",
        paypassIcon: "text-white",
    },
    "brand-dark": {
        root: "bg-linear-to-tr from-brand-900 to-brand-700 before:pointer-events-none before:absolute before:inset-0 before:z-1 before:rounded-[inherit] before:mask-linear-135 before:mask-linear-to-white/20 before:ring-1 before:ring-white/30 before:ring-inset text-white",
        company: "text-white",
        footerText: "text-white",
        paypassIcon: "text-white",
    },
    "brand-light": {
        root: "bg-brand-100 before:pointer-events-none before:absolute before:inset-0 before:z-1 before:rounded-[inherit] before:mask-linear-135 before:mask-linear-to-white/20 before:ring-1 before:ring-black/10 before:ring-inset text-neutral-800",
        company: "text-neutral-700",
        footerText: "text-neutral-700",
        paypassIcon: "text-neutral-600",
    },
    "gray-dark": {
        root: "bg-linear-to-tr from-neutral-950 via-neutral-900 to-neutral-800 text-white before:pointer-events-none before:absolute before:inset-0 before:z-1 before:rounded-[inherit] before:mask-linear-135 before:mask-linear-to-white/20 before:ring-1 before:ring-white/20 before:ring-inset shadow-2xl",
        company: "text-white",
        footerText: "text-white",
        paypassIcon: "text-white",
    },
    "gray-light": {
        root: "bg-linear-to-br from-white via-neutral-100 to-neutral-200 before:pointer-events-none before:absolute before:inset-0 before:z-1 before:rounded-[inherit] before:mask-linear-135 before:mask-linear-to-white/20 before:ring-1 before:ring-black/10 before:ring-inset shadow-xl text-neutral-900",
        company: "text-neutral-900",
        footerText: "text-neutral-800",
        paypassIcon: "text-neutral-600",
    },
    "transparent-strip": {
        root: "bg-linear-to-br from-white/30 to-transparent backdrop-blur-[6px] before:pointer-events-none before:absolute before:inset-0 before:z-1 before:rounded-[inherit] before:mask-linear-135 before:mask-linear-to-white/20 before:ring-1 before:ring-white/30 before:ring-inset text-white",
        company: "text-white",
        footerText: "text-white",
        paypassIcon: "text-white",
    },
    "gray-strip": {
        root: "bg-neutral-100 before:pointer-events-none before:absolute before:inset-0 before:z-1 before:rounded-[inherit] before:mask-linear-135 before:mask-linear-to-white/20 before:ring-1 before:ring-white/30 before:ring-inset text-neutral-800",
        company: "text-neutral-700",
        footerText: "text-white",
        paypassIcon: "text-neutral-400",
    },
    "gradient-strip": {
        root: "bg-linear-to-b from-[#A5C0EE] to-[#FBC5EC] before:pointer-events-none before:absolute before:inset-0 before:z-1 before:rounded-[inherit] before:mask-linear-135 before:mask-linear-to-white/20 before:ring-1 before:ring-white/30 before:ring-inset text-white",
        company: "text-white",
        footerText: "text-white",
        paypassIcon: "text-white",
    },
    "salmon-strip": {
        root: "bg-[#F4D9D0] before:pointer-events-none before:absolute before:inset-0 before:z-1 before:rounded-[inherit] before:mask-linear-135 before:mask-linear-to-white/20 before:ring-1 before:ring-white/30 before:ring-inset text-neutral-800",
        company: "text-neutral-700",
        footerText: "text-white",
        paypassIcon: "text-white",
    },
    "gray-strip-vertical": {
        root: "bg-linear-to-br from-white/30 to-transparent before:pointer-events-none before:absolute before:inset-0 before:z-1 before:rounded-[inherit] before:mask-linear-135 before:mask-linear-to-white/20 before:ring-1 before:ring-white/30 before:ring-inset text-white",
        company: "text-white",
        footerText: "text-white",
        paypassIcon: "text-neutral-400",
    },
    "gradient-strip-vertical": {
        root: "bg-linear-to-b from-[#FBC2EB] to-[#A18CD1] before:pointer-events-none before:absolute before:inset-0 before:z-1 before:rounded-[inherit] before:mask-linear-135 before:mask-linear-to-white/20 before:ring-1 before:ring-white/30 before:ring-inset text-white",
        company: "text-white",
        footerText: "text-white",
        paypassIcon: "text-white",
    },
    "salmon-strip-vertical": {
        root: "bg-[#F4D9D0] before:pointer-events-none before:absolute before:inset-0 before:z-1 before:rounded-[inherit] before:mask-linear-135 before:mask-linear-to-white/20 before:ring-1 before:ring-white/30 before:ring-inset text-white",
        company: "text-white",
        footerText: "text-white",
        paypassIcon: "text-white",
    },
});

const _NORMAL_TYPES = ["transparent", "transparent-gradient", "brand-dark", "brand-light", "gray-dark", "gray-light"] as const;
const STRIP_TYPES = ["transparent-strip", "gray-strip", "gradient-strip", "salmon-strip"] as const;
const VERTICAL_STRIP_TYPES = ["gray-strip-vertical", "gradient-strip-vertical", "salmon-strip-vertical"] as const;

type CreditCardType = (typeof _NORMAL_TYPES)[number] | (typeof STRIP_TYPES)[number] | (typeof VERTICAL_STRIP_TYPES)[number];

interface CreditCardProps {
    company?: string;
    cardNumber?: string;
    cardHolder?: string;
    cardExpiration?: string;
    cardTier?: string;
    perk?: string;
    type?: CreditCardType;
    width?: number;
    className?: string;
}

const ORIGINAL_WIDTH = 300;
const ORIGINAL_HEIGHT = 190;

function calculateScale(width: number, originalWidth: number, originalHeight: number) {
    const scale = width / originalWidth;
    return {
        scale,
        scaledWidth: width,
        scaledHeight: originalHeight * scale,
    };
}

export const CreditCard = ({
    company = "Company",
    cardNumber = "•••• •••• •••• 1234",
    cardHolder = "Cardholder",
    cardExpiration = "••/••",
    cardTier = "Tier",
    perk = "Perk",
    type = "gray-dark",
    width,
    className,
}: CreditCardProps) => {
    const originalWidth = ORIGINAL_WIDTH;
    const originalHeight = ORIGINAL_HEIGHT;

    const { scale, scaledWidth, scaledHeight } = useMemo(() => {
        if (!width)
            return {
                scale: 1,
                scaledWidth: originalWidth,
                scaledHeight: originalHeight,
            };

        return calculateScale(width, originalWidth, originalHeight);
    }, [width]);

    const isDarkType = type === "gray-dark" || type === "brand-dark" || type === "transparent" || type === "transparent-gradient";

    return (
        <div
            style={{
                width: `${scaledWidth}px`,
                height: `${scaledHeight}px`,
            }}
            className={cx("relative flex select-none", className)}
        >
            <div
                style={{
                    transform: `scale(${scale})`,
                    width: `${originalWidth}px`,
                    height: `${originalHeight}px`,
                }}
                className={cx("absolute top-0 left-0 flex origin-top-left flex-col justify-between overflow-hidden rounded-2xl p-4.5 shadow-2xl transition-all duration-300", styles[type].root)}
            >
                {STRIP_TYPES.includes(type as (typeof STRIP_TYPES)[number]) && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1/2 bg-neutral-800"></div>
                )}
                {VERTICAL_STRIP_TYPES.includes(type as (typeof VERTICAL_STRIP_TYPES)[number]) && (
                    <div className="pointer-events-none absolute inset-y-0 right-22 left-0 z-0 bg-neutral-800"></div>
                )}
                {type === "transparent-gradient" && (
                    <div className="absolute -top-4 -left-4 grid grid-cols-2 blur-3xl">
                        <div className="size-20 rounded-tl-full bg-pink-500 opacity-30 mix-blend-normal" />
                        <div className="size-20 rounded-tr-full bg-orange-500 opacity-50 mix-blend-normal" />
                        <div className="size-20 rounded-bl-full bg-blue-500 opacity-30 mix-blend-normal" />
                        <div className="bg-green-500 size-20 rounded-br-full opacity-30 mix-blend-normal" />
                    </div>
                )}

                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={cx("text-sm font-black tracking-tight", styles[type].company)}>
                            {company}
                        </span>
                        <span className={cx("text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded font-bold", isDarkType ? "bg-white/15 text-white/90" : "bg-black/10 text-neutral-800")}>
                            {cardTier}
                        </span>
                    </div>

                    <PaypassIcon className={cx("w-4 h-4", styles[type].paypassIcon)} />
                </div>

                <div className="relative flex items-center justify-between my-1">
                    <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-300 via-amber-100 to-amber-400 border border-amber-500/50 shadow-inner relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                            <div className="border-r border-b border-amber-600/40" />
                            <div className="border-b border-amber-600/40" />
                            <div className="border-r border-amber-600/40" />
                            <div />
                        </div>
                        <div className="w-3.5 h-3.5 rounded-full border border-amber-600/50 relative z-10" />
                    </div>

                    <div className={cx("text-[10px] font-mono tracking-widest font-semibold uppercase", isDarkType ? "text-neutral-300" : "text-neutral-700")}>
                        {perk}
                    </div>
                </div>

                <div className={cx("relative font-mono text-[13px] tracking-[0.18em] font-semibold", styles[type].footerText)}>
                    {cardNumber}
                </div>

                <div className={cx("relative flex items-end justify-between pt-1 border-t", isDarkType ? "border-white/10" : "border-black/5")}>
                    <div className="flex min-w-0 flex-col">
                        <span className={cx("text-[8px] font-mono tracking-wider uppercase leading-none", isDarkType ? "text-neutral-400" : "text-neutral-500")}>
                            Cardholder
                        </span>
                        <p
                            style={{ wordBreak: "break-word" }}
                            className={cx("text-xs font-bold leading-tight tracking-[0.4px] uppercase truncate max-w-[160px] mt-0.5", styles[type].footerText)}
                        >
                            {cardHolder}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                        <div className="flex flex-col items-end">
                            <span className={cx("text-[8px] font-mono tracking-wider uppercase leading-none", isDarkType ? "text-neutral-400" : "text-neutral-500")}>
                                Valid Thru
                            </span>
                            <span className={cx("text-[11px] font-mono font-bold leading-tight mt-0.5", styles[type].footerText)}>
                                {cardExpiration}
                            </span>
                        </div>

                        <div className="flex flex-col items-end">
                            <span className={cx("text-[8px] font-mono tracking-wider uppercase leading-none", isDarkType ? "text-neutral-400" : "text-neutral-500")}>
                                CVV
                            </span>
                            <span className="text-[11px] font-mono font-bold leading-tight text-amber-400 mt-0.5">
                                777
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
