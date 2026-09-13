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

export function NumberPopIn({ value = "123", showButton = false, className = "" }) {
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
