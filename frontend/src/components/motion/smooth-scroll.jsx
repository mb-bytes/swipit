"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Lenis from "lenis";
import { cn } from "@/lib/utils";
import { SmoothScrollContext } from "./smooth-scroll-context";

export function SmoothScroll({
  children,
  root = true,
  lerp = 0.1,
  duration = 1.2,
  orientation = "vertical",
  wheelMultiplier = 1,
  touch = false,
  className,
  ...props
}) {
  const [lenisInstance, setLenisInstance] = useState(null);
  const [scrollState, setScrollState] = useState({
    scroll: 0,
    progress: 0,
    velocity: 0,
  });
  const containerRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      wrapper: root ? window : containerRef.current,
      content: root ? document.documentElement : undefined,
      lerp,
      duration,
      orientation,
      wheelMultiplier,
      touchMultiplier: touch ? 1 : 0,
      smoothWheel: true,
      syncTouch: touch,
    });

    setLenisInstance(lenis);

    const handleScroll = (e) => {
      setScrollState({
        scroll: e.scroll,
        progress: e.progress,
        velocity: e.velocity,
      });
    };

    lenis.on("scroll", handleScroll);

    let frameId;
    const raf = (time) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      setLenisInstance(null);
    };
  }, [root, lerp, duration, orientation, wheelMultiplier, touch]);

  const scrollTo = useCallback(
    (target, options) => {
      if (lenisInstance) {
        lenisInstance.scrollTo(target, options);
      }
    },
    [lenisInstance]
  );

  const contextValue = useMemo(
    () => ({
      lenis: lenisInstance,
      scroll: scrollState.scroll,
      progress: scrollState.progress,
      velocity: scrollState.velocity,
      scrollTo,
    }),
    [lenisInstance, scrollState, scrollTo]
  );

  if (root) {
    return (
      <SmoothScrollContext.Provider value={contextValue}>
        {children}
      </SmoothScrollContext.Provider>
    );
  }

  return (
    <SmoothScrollContext.Provider value={contextValue}>
      <div ref={containerRef} className={cn(className)} {...props}>
        {children}
      </div>
    </SmoothScrollContext.Provider>
  );
}

export default SmoothScroll;
