const __TRANSITION_STYLES = `
:root {
  --icon-swap-dur: 250ms;
  --icon-swap-blur: 2px;
  --icon-swap-start-scale: 0.25;
  --icon-swap-ease: ease-in-out;
}

.t-icon-swap {
  position: relative;
  display: inline-grid;
}
.t-icon-swap .t-icon {
  grid-area: 1 / 1;
  transition:
    opacity   var(--icon-swap-dur) var(--icon-swap-ease),
    filter    var(--icon-swap-dur) var(--icon-swap-ease),
    transform var(--icon-swap-dur) var(--icon-swap-ease);
  will-change: opacity, filter, transform;
}
.t-icon-swap[data-state="a"] .t-icon[data-icon="a"],
.t-icon-swap[data-state="b"] .t-icon[data-icon="b"] {
  opacity: 1;
  filter: blur(0);
  transform: scale(1);
}
.t-icon-swap[data-state="a"] .t-icon[data-icon="b"],
.t-icon-swap[data-state="b"] .t-icon[data-icon="a"] {
  opacity: 0;
  filter: blur(var(--icon-swap-blur));
  transform: scale(var(--icon-swap-start-scale));
}

@media (prefers-reduced-motion: reduce) {
  .t-icon-swap .t-icon { transition: none !important; }
}
`;

if (typeof document !== "undefined" && !document.getElementById("transitions-p5")) {
  const __style = document.createElement("style");
  __style.id = "transitions-p5";
  __style.textContent = __TRANSITION_STYLES;
  document.head.appendChild(__style);
}

export function IconSwap({ iconA, iconB, isOpen, onToggle, className = "" }) {
  const state = isOpen ? "b" : "a";

  return (
    <button
      type="button"
      aria-label={state === "a" ? "Open Menu" : "Close Menu"}
      onClick={onToggle}
      className={`p-2 rounded-full focus:outline-none ${className}`}
    >
      <span className="t-icon-swap" data-state={state}>
        <span className="t-icon" data-icon="a">{iconA}</span>
        <span className="t-icon" data-icon="b">{iconB}</span>
      </span>
    </button>
  );
}
