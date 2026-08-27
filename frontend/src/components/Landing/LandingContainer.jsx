"use client";

import { NavbarDemo } from "@/components/Landing/Navbar/Navbar";
import { Hero } from "@/components/Landing/Hero/Hero";
import { Audience } from "@/components/Landing/Audience/Audience";
import { Features } from "@/components/Landing/Features/Features";
import { Contact } from "@/components/Landing/Contact/Contact";
import { Footer } from "@/components/Landing/Footer/Footer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { ScrollProgress } from "@/components/motion/scroll-progress";

export function LandingContainer() {
  return (
    <SmoothScroll root={true} lerp={0.12} duration={0.7}>
      <ScrollProgress height={3} position="top" />
      <div className="min-h-screen w-full bg-[#f2eee5] text-[#111215] overflow-x-hidden flex flex-col paper-grain">
        <NavbarDemo />
        <main className="flex-grow">
          <Hero />
          <Audience />
          <Features />
          <Contact />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}

export default LandingContainer;