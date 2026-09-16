import { useState, useEffect } from "react";

const __TRANSITION_STYLES = `
:root {
  --digit-dur: 500ms;
  --digit-distance: 8px;
  --digit-stagger: 70ms;
  --digit-blur: 2px;
  --digit-ease: cubic-bezier(0.34, 1.45, 0.64, 1);
  --digit-dir-x: 0;
  --digit-dir-y: 1;
}

@keyframes t-digit-pop-in {
  0%   {
    transform: translate(
      calc(var(--digit-distance) * var(--digit-dir-x)),
      calc(var(--digit-distance) * var(--digit-dir-y))
    );
    opacity: 0;
    filter: blur(var(--digit-blur));
  }
  100% { transform: translate(0, 0); opacity: 1; filter: blur(0); }
}

.t-digit-group {
  display: inline-flex;
  align-items: baseline;
}
.t-digit {
  display: inline-block;
  will-change: transform, opacity, filter;
}
.t-digit-group.is-animating .t-digit {
  animation: t-digit-pop-in var(--digit-dur) var(--digit-ease) both;
}

@media (prefers-reduced-motion: reduce) {
  .t-digit-group .t-digit { animation: none !important; }
}
`;

if (typeof document !== "undefined" && !document.getElementById("transitions-p9")) {
  const __style = document.createElement("style");
  __style.id = "transitions-p9";
  __style.textContent = __TRANSITION_STYLES;
  document.head.appendChild(__style);
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function RollingDigit({ digit, delay = 0, duration = 1.2 }) {
  const [mounted, setMounted] = useState(false);
  const num = parseInt(digit, 10);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [digit]);

  // 2 cycles of 0-9 so it spins through a full set before settling on the target digit
  const targetIndex = 10 + (isNaN(num) ? 0 : num);
  const targetY = mounted ? -(targetIndex * 5) : 0;

  return (
    <span className="inline-block relative overflow-hidden h-[1em] leading-[1em] align-baseline select-none">
      {/* Invisible placeholder to establish identical width and baseline */}
      <span className="invisible select-none opacity-0 pointer-events-none">{digit}</span>
      <span
        className="absolute inset-x-0 top-0 flex flex-col will-change-transform"
        style={{
          transform: `translateY(${targetY}%)`,
          transition: `transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        }}
      >
        {[...DIGITS, ...DIGITS].map((n, idx) => (
          <span
            key={idx}
            className="h-[1em] leading-[1em] flex items-center justify-center text-center select-none"
          >
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

export function RollingNumber({
  value = "0",
  className = "",
  duration = 1.2,
  stagger = 0.05,
}) {
  const strValue = String(value);
  let digitCount = 0;

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      {strValue.split("").map((ch, i) => {
        const isDigit = /^\d$/.test(ch);
        if (isDigit) {
          const delay = digitCount * stagger;
          digitCount++;
          return (
            <RollingDigit
              key={`${i}-${ch}`}
              digit={ch}
              delay={delay}
              duration={duration}
            />
          );
        }
        return (
          <span key={i} className="inline-block">
            {ch === " " ? "\u00A0" : ch}
          </span>
        );
      })}
    </span>
  );
}

export function NumberPopIn({
  value = "123",
  showButton = false,
  className = "",
  variant = "pop",
  duration = 1.2,
}) {
  if (variant === "rolling") {
    return (
      <RollingNumber
        value={value}
        className={className}
        duration={duration}
      />
    );
  }

  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    setPlaying(false);
    const frame1 = requestAnimationFrame(() => {
      const frame2 = requestAnimationFrame(() => setPlaying(true));
      return () => cancelAnimationFrame(frame2);
    });
    return () => cancelAnimationFrame(frame1);
  }, [value]);

  const replay = () => {
    setPlaying(false);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setPlaying(true))
    );
  };

  const strValue = String(value);

  return (
    <>
      {showButton && (
        <button type="button" onClick={replay}>
          Animate
        </button>
      )}
      <span className={"t-digit-group " + (playing ? "is-animating " : "") + className}>
        {strValue.split("").map((ch, i) => (
          <span
            key={i}
            className="t-digit"
            style={{
              animationDelay: i > 0 ? `calc(var(--digit-stagger) * ${i})` : undefined,
            }}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        ))}
      </span>
    </>
  );
}

export default NumberPopIn;

