import { MetalButton } from "@/components/Landing/Navbar/MetalButton";
import { HeroPocketCard } from "./HeroPocketCard";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

export function Hero() {
  return (
    <section
      id="home"
      className="relative pt-20 pb-12 sm:pt-24 sm:pb-14 md:pt-28 md:pb-20 overflow-hidden flex items-center min-h-[92dvh]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <ScrollReveal delay={0.1} y={20}>
              <h1 className="text-5xl sm:text-7xl lg:text-[5.2rem] font-bold tracking-[-0.04em] text-[#0b0f19] leading-[1.03]">
                Systematize <br />
                Every Swipe.
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.2} y={20}>
              <p className="mt-7 text-base sm:text-[1.125rem] text-[#424854] max-w-xl font-normal leading-[1.6]">
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
          </div>

          <div className="lg:col-span-6 w-full flex items-center justify-center">
            <div className="w-full relative">
              <ScrollReveal delay={0.2} y={20}>
                <HeroPocketCard />
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
