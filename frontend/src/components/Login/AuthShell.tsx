import type { ReactNode, RefObject } from "react";
import { createContext, useContext, useRef } from "react";
import { ParticleField } from "./ParticleField";
import { AuthSplitLayout } from "./AuthSplitLayout";
import cardFigureSrc from "@/assets/figures/card-figure.svg";

type ImpulseRef = RefObject<number>;
const TypingImpulseContext = createContext<ImpulseRef | null>(null);

export function useAuthTypingImpulse(): ImpulseRef {
  const ctx = useContext(TypingImpulseContext);
  if (!ctx) throw new Error("useAuthTypingImpulse outside <AuthShell>");
  return ctx;
}

export function AuthShell({
  children,
  leftContent,
  src = cardFigureSrc,
}: {
  children: ReactNode;
  leftContent?: ReactNode;
  src?: string;
}) {
  const typingImpulseRef = useRef(0);

  return (
    <TypingImpulseContext.Provider value={typingImpulseRef}>
      <AuthSplitLayout
        left={
          <>
            <ParticleField
              src={src}
              sampleStep={4.2}
              threshold={26}
              dotSize={0.95}
              renderScale={0.95}
              align="center"
              color="rgba(18, 22, 32, 0.82)"
              typingImpulseRef={typingImpulseRef}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(900px 600px at 50% 50%, transparent 45%, rgba(248, 249, 251, 0.65) 95%)",
              }}
            />
            {leftContent}
          </>
        }
        right={children}
      />
    </TypingImpulseContext.Provider>
  );
}
