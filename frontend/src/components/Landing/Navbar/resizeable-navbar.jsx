"use client";

import { useRef, useState, useEffect, Children, isValidElement, cloneElement } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { List, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";
import { IconSwap } from "./IconSwap";
import { useSmoothScroll } from "@/components/motion/smooth-scroll-context";

export const Navbar = ({ children, className }) => {
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 30) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  });

  return (
    <motion.header
      ref={ref}
      className={cn(
        "fixed inset-x-0 top-0 z-50 w-full transition-all duration-200",
        scrolled
          ? "py-3 bg-[#f2eee5]/92 backdrop-blur-md border-b border-neutral-300/60 shadow-xs"
          : "py-5 bg-transparent",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {Children.map(children, (child) =>
          isValidElement(child)
            ? cloneElement(child, { scrolled })
            : child
        )}
      </div>
    </motion.header>
  );
};

export const NavBody = ({ children, className }) => {
  return (
    <div
      className={cn(
        "hidden md:flex items-center justify-between w-full",
        className
      )}
    >
      {children}
    </div>
  );
};

export const NavItems = ({ items, className, onItemClick }) => {
  const { scrollTo, lenis } = useSmoothScroll();
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const clickUntilRef = useRef(0);
  const tabRefs = useRef([]);
  const [activePill, setActivePill] = useState({ left: 0, width: 0, opacity: 0 });
  const [hoverPill, setHoverPill] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const el = tabRefs.current[activeIdx];
    if (el) {
      setActivePill({
        left: el.offsetLeft,
        width: el.offsetWidth,
        opacity: 1,
      });
    }
  }, [activeIdx]);

  useEffect(() => {
    if (hoveredIdx !== null && hoveredIdx !== activeIdx) {
      const el = tabRefs.current[hoveredIdx];
      if (el) {
        setHoverPill({
          left: el.offsetLeft,
          width: el.offsetWidth,
          opacity: 1,
        });
      }
    } else {
      setHoverPill((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [hoveredIdx, activeIdx]);

  useEffect(() => {
    let rafId;

    const checkActiveSection = () => {
      // If user recently clicked a tab, let the smooth animation land on target first
      if (Date.now() < clickUntilRef.current) return;

      const currentScrollY = window.scrollY || window.pageYOffset || 0;

      // When near the top of the page, force first section (Platform) active
      if (currentScrollY < 120) {
        setActiveIdx(0);
        return;
      }

      // When near the bottom of the page, activate last section (Contact)
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      if (currentScrollY + windowHeight >= documentHeight - 100) {
        setActiveIdx(items.length - 1);
        return;
      }

      const offsetThreshold = windowHeight * 0.35;
      const sectionElements = items.map((item) => {
        const id = item.link.replace("#", "");
        return document.getElementById(id);
      });

      let matchedIdx = 0;
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offsetThreshold) {
            matchedIdx = i;
            break;
          }
        }
      }
      setActiveIdx(matchedIdx);
    };

    const updateActive = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(checkActiveSection);
    };

    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive, { passive: true });

    if (lenis) {
      lenis.on("scroll", updateActive);
    }

    checkActiveSection();

    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
      if (lenis) {
        lenis.off("scroll", updateActive);
      }
      cancelAnimationFrame(rafId);
    };
  }, [items, lenis]);

  const handleNavClick = (e, link, idx) => {
    e.preventDefault();
    setActiveIdx(idx);
    clickUntilRef.current = Date.now() + 650;

    if (onItemClick) onItemClick(e);
    if (scrollTo) {
      scrollTo(link, { offset: -70, duration: 0.6 });
    } else {
      const el = document.querySelector(link);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      onMouseLeave={() => setHoveredIdx(null)}
      className={cn(
        "hidden md:flex items-center gap-1 p-1 bg-white/70 backdrop-blur-md border border-neutral-300/80 rounded-full shadow-2xs relative",
        className
      )}
    >
      <motion.div
        animate={activePill}
        transition={{ type: "spring", stiffness: 600, damping: 38 }}
        className="absolute top-1 bottom-1 bg-[#111215] rounded-full shadow-xs pointer-events-none -z-10"
      />

      <motion.div
        animate={hoverPill}
        transition={{ duration: 0.12 }}
        className="absolute top-1 bottom-1 bg-neutral-900/10 rounded-full pointer-events-none -z-10"
      />

      {items.map((item, idx) => {
        const isActive = activeIdx === idx;
        const isHovered = hoveredIdx === idx;

        return (
          <a
            key={`nav-link-${idx}`}
            ref={(el) => (tabRefs.current[idx] = el)}
            href={item.link}
            onMouseEnter={() => setHoveredIdx(idx)}
            onClick={(e) => handleNavClick(e, item.link, idx)}
            className={cn(
              "relative px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors duration-150 cursor-pointer select-none",
              isActive
                ? "text-white font-semibold"
                : isHovered
                  ? "text-neutral-950 font-medium"
                  : "text-neutral-700 hover:text-neutral-900"
            )}
          >
            <span className="relative z-10">{item.name}</span>
          </a>
        );
      })}
    </nav>
  );
};

export const MobileNav = ({ children, className }) => {
  return (
    <div
      className={cn(
        "flex md:hidden items-center justify-between w-full",
        className
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavHeader = ({ children, className }) => {
  return (
    <div className={cn("flex w-full items-center justify-between", className)}>
      {children}
    </div>
  );
};

export const MobileNavToggle = ({ isOpen, onToggle }) => {
  return (
    <IconSwap
      isOpen={isOpen}
      onToggle={onToggle}
      iconA={<List weight="bold" className="w-5 h-5 text-neutral-900" />}
      iconB={<X weight="bold" className="w-5 h-5 text-neutral-900" />}
      className="p-1.5 text-neutral-900 hover:bg-neutral-200/50 cursor-pointer"
    />
  );
};

export const MobileNavMenu = ({ children, className, isOpen }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18 }}
          className={cn(
            "fixed inset-x-4 top-18 z-50 flex flex-col gap-4 rounded-2xl bg-[#f5f1e8] p-6 shadow-xl border border-neutral-300/80 backdrop-blur-xl",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const NavbarLogo = () => {
  const { scrollTo } = useSmoothScroll();

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (scrollTo) {
      scrollTo(0, { duration: 0.8 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <a href="#home" onClick={handleLogoClick} className="inline-flex items-center cursor-pointer">
      <BrandLogo size="md" />
    </a>
  );
};

export default Navbar;
