import { MetalButton } from "@/components/Landing/Navbar/MetalButton";
import { WovenCloth } from "./WovenCloth";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

export function Hero() {
  return (
    <section
      id="home"
      className="relative pt-20 pb-12 sm:pt-24 sm:pb-14 md:pt-26 md:pb-16 overflow-hidden paper-grain flex items-center"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <ScrollReveal delay={0.1} y={20}>
              <h1 className="text-5xl sm:text-7xl lg:text-[5.2rem] font-bold tracking-[-0.04em] text-[#0f1013] leading-[1.03]">
                Systematize <br />
                Every Swipe.
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.2} y={20}>
              <p className="mt-7 text-base sm:text-[1.125rem] text-[#3e4149] max-w-xl font-normal leading-[1.6]">
                An intelligent credit card companion designed to track card rewards, maximize milestone spend, and recommend the highest-earning card for every transaction.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.3} y={20}>
              <div className="mt-9 flex items-center">
                <MetalButton
                  text="Unlock the Edge"
                  height={48}
                  width={180}
                  showIcon={true}
                />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.4} y={20}>
              <div className="mt-12 pt-8 border-t border-neutral-300/70 w-full flex flex-wrap items-center gap-6 sm:gap-8 text-xs font-mono text-[#5c606b]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#107846]" />
                  <span>Automated Transaction Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#107846]" />
                  <span>Zero Password Storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#107846]" />
                  <span>Smart Multiplier Routing</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-6 w-full flex items-center justify-center lg:-mt-16 xl:-mt-20">
            <div className="w-full relative">
              <ScrollReveal delay={0.2} y={20}>
                <WovenCloth />
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
