"use client";

import { useState } from "react";
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

export function NavbarDemo() {
  const { scrollTo } = useSmoothScroll();
  const navItems = [
    {
      name: "Platform",
      link: "#home",
    },
    {
      name: "Who It's For",
      link: "#persona",
    },
    {
      name: "Features",
      link: "#features",
    },
    {
      name: "Contact",
      link: "#contact",
    },
  ];

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
        <NavItems items={navItems} />
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center">
            <MetalButton
              text="Unlock the Edge"
              height={38}
              width={154}
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
            {navItems.map((item, idx) => (
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
          <div className="pt-3 border-t border-neutral-300/80 flex flex-col gap-3">
            <div className="flex justify-center w-full">
              <MetalButton
                text="Unlock the Edge"
                height={42}
                width={170}
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
