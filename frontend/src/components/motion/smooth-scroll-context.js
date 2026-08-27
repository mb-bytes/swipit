import { createContext, useContext } from "react";

export const SmoothScrollContext = createContext({
  lenis: null,
  scroll: 0,
  progress: 0,
  velocity: 0,
  scrollTo: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);
