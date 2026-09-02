import React from "react";
import { Link } from "react-router-dom";
import { NotFoundGlitch } from "@/components/motion/not-found";
import { BrandLogo } from "@/components/Landing/Navbar/BrandLogo";

export function NotFoundPage() {
  return (
    <div className="relative min-h-[100dvh] w-full bg-[#0d0e11] text-[#f2eee5] overflow-hidden flex flex-col justify-between select-none">
      {/* Top Header */}
      <header className="absolute top-0 inset-x-0 z-50 p-6 flex items-center justify-start">
        <Link to="/" className="hover:opacity-85 transition-opacity">
          <BrandLogo size="md" inverted={true} />
        </Link>
      </header>

      {/* Main Glitch 404 View */}
      <main className="flex-grow flex items-center justify-center">
        <NotFoundGlitch />
      </main>
    </div>
  );
}

export default NotFoundPage;
