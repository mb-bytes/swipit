import swipitLogo from "@/assets/swipit-logo.png";
import {
  GithubLogoIcon,
  XLogoIcon,
  LinkedinLogoIcon,
  ArrowUp,
} from "@phosphor-icons/react";
import { ScrollTo } from "@/components/motion/scroll-to";
import { useSmoothScroll } from "@/components/motion/smooth-scroll-context";

export function Footer() {
  const { scrollTo } = useSmoothScroll();

  const handleNavClick = (e, link) => {
    e.preventDefault();
    if (scrollTo) {
      scrollTo(link, { offset: -70, duration: 1.2 });
    } else {
      const el = document.querySelector(link);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="relative bg-[#0d0e12] text-white pt-20 pb-12 overflow-hidden border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-12 pb-16 border-b border-neutral-800">
          <div className="col-span-2 sm:col-span-1 md:col-span-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-4">
              Navigation
            </span>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <a
                  href="#home"
                  onClick={(e) => handleNavClick(e, "#home")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Platform
                </a>
              </li>
              <li>
                <a
                  href="#persona"
                  onClick={(e) => handleNavClick(e, "#persona")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Target Architecture
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  onClick={(e) => handleNavClick(e, "#features")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Workflow Orchestration
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => handleNavClick(e, "#contact")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Developer Channel
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-4">
              Supported Parsers
            </span>
            <ul className="space-y-2.5 text-xs font-mono text-neutral-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                <span>Axis Bank</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                <span>Federal Bank</span>
              </li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-4">
              Next Banks To Be Supported
            </span>
            <ul className="space-y-2.5 text-xs font-mono text-neutral-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                <span>HDFC</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                <span>ICICI</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                <span>SBI</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                <span>Kotak</span>
              </li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1 md:col-span-3 flex flex-col justify-between items-start md:items-end">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400 block mb-4">
                Connect
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-600 flex items-center justify-center text-neutral-400 hover:text-white transition-all shadow-sm"
                  aria-label="X Twitter"
                >
                  <XLogoIcon weight="bold" className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-600 flex items-center justify-center text-neutral-400 hover:text-white transition-all shadow-sm"
                  aria-label="GitHub"
                >
                  <GithubLogoIcon weight="bold" className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-600 flex items-center justify-center text-neutral-400 hover:text-white transition-all shadow-sm"
                  aria-label="LinkedIn"
                >
                  <LinkedinLogoIcon weight="bold" className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="mt-8 md:mt-0">
              <ScrollTo
                to={0}
                className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700"
              >
                <ArrowUp weight="bold" className="w-3.5 h-3.5" />
                <span>Return to top</span>
              </ScrollTo>
            </div>
          </div>
        </div>

        <div className="py-16 flex flex-col items-center justify-center select-none text-center">
          <div className="flex items-center justify-center gap-3 sm:gap-5 mb-2">
            <img
              src={swipitLogo}
              alt="SwipIt Logo"
              className="h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 object-contain drop-shadow-md"
            />
            <div className="text-[clamp(3.2rem,12vw,9rem)] font-bold tracking-[-0.04em] text-[#f2eee5] leading-none flex items-baseline justify-center">
              <span>Swip</span>
              <span className="text-[#d9480f]">It</span>
            </div>
          </div>
          <span className="font-mono text-xs text-neutral-500 uppercase tracking-widest mt-2">
            Intelligent Card Rewards & Spends Optimizer
          </span>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-400 border-t border-neutral-800/80">
          <div>
            © {new Date().getFullYear()} SwipIt Technologies. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-neutral-300">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-neutral-300">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-neutral-300">Security Disclosures</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
