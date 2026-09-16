import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PredictiveArc } from "@/components/ui/predective-arc";

type AuthSplitLayoutProps = {
  left: ReactNode;
  right: ReactNode;
  className?: string;
  frameClassName?: string;
  leftClassName?: string;
  rightClassName?: string;
};

export function AuthSplitLayout({
  left,
  right,
  className,
  frameClassName,
  leftClassName,
  rightClassName,
}: AuthSplitLayoutProps) {
  return (
    <div
      className={cn(
        "relative h-screen max-h-screen w-full overflow-hidden bg-[#f8f9fb] text-[#111215] paper-grain",
        className,
      )}
    >
      <div
        className={cn(
          "relative mx-auto flex h-full w-full max-w-[1600px] overflow-hidden",
          frameClassName,
        )}
      >
        <div
          className={cn(
            "relative hidden flex-1 overflow-hidden bg-[#f3f4f6]/40 border-r border-neutral-300/60 lg:block",
            leftClassName,
          )}
        >
          {left}
        </div>
        <div
          className={cn(
            "relative flex w-full flex-col justify-between overflow-hidden px-6 py-5 sm:px-10 lg:w-[480px] xl:w-[520px] lg:px-12",
            rightClassName,
          )}
        >
          <div className="absolute bottom-0 left-0 right-0 h-[45%] z-0 overflow-hidden pointer-events-auto [mask-image:linear-gradient(to_bottom,transparent_0%,black_35%)]">
            <PredictiveArc
              className="h-full w-full"
              style={{ minWidth: 0, minHeight: 0, width: "100%", height: "100%" }}
            />
          </div>
          <div className="relative z-10 flex w-full flex-1 flex-col justify-between overflow-y-auto min-h-0">
            {right}
          </div>
        </div>
      </div>
    </div>
  );
}
