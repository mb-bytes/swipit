"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "./resizeable-navbar.jsx";
import { MetalButton } from "./MetalButton.jsx";
import { useSmoothScroll } from "@/components/motion/smooth-scroll-context";

import { NAV_ITEMS } from "@/constants";

export function NavbarDemo() {
  const { scrollTo } = useSmoothScroll();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileLink = (e, link) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (scrollTo) {
      scrollTo(link, { offset: -70, duration: 0.6 });
    } else {
      const el = document.querySelector(link);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Navbar>
      <NavBody>
        <NavbarLogo />
        <NavItems items={NAV_ITEMS} />
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center justify-center text-sm font-semibold text-[#0b0f19] px-4 py-2 rounded-full hover:bg-black/5 transition-colors duration-200"
          >
            Log in
          </Link>
          <div className="hidden sm:flex items-center">
            <MetalButton
              text="Unlock the Edge"
              height={44}
              width={174}
              showIcon={true}
            />
          </div>
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          <div className="flex flex-col space-y-2">
            {NAV_ITEMS.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={(e) => handleMobileLink(e, item.link)}
                className="px-3 py-2 text-sm font-medium text-neutral-900 rounded-lg hover:bg-neutral-200/60 transition-colors cursor-pointer"
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="pt-3 border-t border-neutral-300/80 flex flex-col gap-2.5">
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-sm font-semibold text-[#0b0f19] rounded-xl hover:bg-black/5 transition-colors"
            >
              Log in
            </Link>
            <div className="flex justify-center w-full">
              <MetalButton
                text="Unlock the Edge"
                height={46}
                width={180}
                className="w-full"
              />
            </div>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}

export default NavbarDemo;
