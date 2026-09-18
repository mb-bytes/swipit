import { useState, useRef, useEffect } from "react";
import { CreditCard } from "@/components/Signup/credit-card";

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const CARDS_DATA = [
  {
    id: "hdfc-infinia",
    company: "HDFC BANK",
    cardTier: "INFINIA",
    cardNumber: "•••• •••• •••• 8842",
    cardHolder: "Peter Parker",
    cardExpiration: "09/29",
    perk: "5X REWARDS",
    type: "gray-dark",
  },
  {
    id: "axis-magnus",
    company: "AXIS BANK",
    cardTier: "BURGUNDY",
    cardNumber: "•••• •••• •••• 4129",
    cardHolder: "Tony Stark",
    cardExpiration: "11/28",
    perk: "5.4X EDGE",
    type: "terracotta",
  },
  {
    id: "amex-platinum",
    company: "AMERICAN EXPRESS",
    cardTier: "PLATINUM",
    cardNumber: "•••• •••• 3004",
    cardHolder: "",
    cardExpiration: "03/30",
    perk: "Steve Rogers",
    type: "gray-light",
  },
  {
    id: "federal-scapia",
    company: "FEDERAL BANK",
    cardTier: "SCAPIA",
    cardNumber: "•••• •••• •••• 9921",
    cardHolder: "GLOBAL NOMAD",
    cardExpiration: "07/28",
    perk: "ZERO FOREX",
    type: "cobalt",
  },
];

export function HeroCardPlateStack() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 640,
  );
  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let animId;
    const startTimestamp = performance.now();
    const count = CARDS_DATA.length;

    const tick = (now) => {
      const elapsed = (now - startTimestamp) / 1000;
      const isMob = window.innerWidth < 640;

      mousePos.current.x +=
        (mousePos.current.targetX - mousePos.current.x) * 0.08;
      mousePos.current.y +=
        (mousePos.current.targetY - mousePos.current.y) * 0.08;

      if (containerRef.current) {
        const rotX = 54 - (isMob ? 0 : mousePos.current.y * 7);
        const rotZ = -38 + (isMob ? 0 : mousePos.current.x * 8);
        containerRef.current.style.transform = `rotateX(${rotX}deg) rotateZ(${rotZ}deg)`;
      }

      for (let i = 0; i < count; i++) {
        const cardEl = cardRefs.current[i];
        if (!cardEl) continue;

        const expandZ = (i - 1.5) * (isMob ? 40 : 58);
        const thinZ = (i - 1.5) * (isMob ? 16 : 22);
        const stackedZ = (i - 1.5) * (isMob ? 20 : 28);

        let curZ = stackedZ;

        if (elapsed <= 1.3) {
          const expandProg = easeOutCubic(Math.min(1, elapsed / 0.95));
          curZ = thinZ + (expandZ - thinZ) * expandProg;
        } else if (elapsed <= 2.2) {
          const collapseProg = easeInOutCubic(
            Math.min(1, (elapsed - 1.3) / 0.8),
          );
          curZ = expandZ + (thinZ - expandZ) * collapseProg;
        } else if (elapsed <= 2.9) {
          const settleProg = easeOutCubic(Math.min(1, (elapsed - 2.2) / 0.65));
          curZ = thinZ + (stackedZ - thinZ) * settleProg;
        } else {
          curZ = stackedZ;
        }

        cardEl.style.transform = `translate3d(0px, 0px, ${curZ}px)`;
        cardEl.style.zIndex = i * 10 + 10;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handlePointerMove = (e) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mousePos.current.targetX = Math.max(-1, Math.min(1, nx));
    mousePos.current.targetY = Math.max(-1, Math.min(1, ny));
  };

  const handlePointerLeave = () => {
    mousePos.current.targetX = 0;
    mousePos.current.targetY = 0;
  };

  return (
    <div className="relative w-full max-w-xl mx-auto flex flex-col items-center select-none py-6 sm:py-8 overflow-visible">
      <div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative w-full aspect-[4/3.8] max-w-[340px] sm:max-w-[540px] flex items-center justify-center overflow-visible"
        style={{ perspective: isMobile ? 1000 : 1300 }}
      >
        <div
          ref={containerRef}
          className={`relative flex items-center justify-center transition-transform duration-75 overflow-visible ${
            isMobile ? "w-[280px] h-[177px]" : "w-[390px] h-[247px]"
          }`}
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(54deg) rotateZ(-38deg)",
          }}
        >
          {CARDS_DATA.map((card, i) => (
            <div
              key={card.id}
              ref={(el) => (cardRefs.current[i] = el)}
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                transformStyle: "preserve-3d",
                willChange: "transform",
                boxShadow: "none",
              }}
            >
              <CreditCard
                company={card.company}
                cardTier={card.cardTier}
                cardNumber={card.cardNumber}
                cardHolder={card.cardHolder}
                cardExpiration={card.cardExpiration}
                perk={card.perk}
                type={card.type}
                width={isMobile ? 280 : 390}
                showIcons={true}
                noShadow={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HeroCardPlateStack;
