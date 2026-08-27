"use client";

import { useSmoothScroll } from "./smooth-scroll-context";
import { cn } from "@/lib/utils";

export function ScrollTo({
  to,
  offset = 0,
  duration,
  children,
  className,
  onClick,
  ...props
}) {
  const { scrollTo } = useSmoothScroll();

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) onClick(e);

    if (scrollTo) {
      scrollTo(to, {
        offset,
        duration,
      });
    } else {
      if (typeof to === "string" && to.startsWith("#")) {
        const el = document.querySelector(to);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY + offset;
          window.scrollTo({ top, behavior: "smooth" });
        }
      } else if (typeof to === "number") {
        window.scrollTo({ top: to + offset, behavior: "smooth" });
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </button>
  );
}
