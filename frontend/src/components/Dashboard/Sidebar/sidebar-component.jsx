"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { BrandLogo } from "@/components/Landing/Navbar/BrandLogo";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <>
      <motion.div
        className={cn(
          "h-full px-3.5 py-4 hidden md:flex md:flex-col bg-[#eae5d9]/90 backdrop-blur-xs border-r border-neutral-300/80 shrink-0 select-none z-30 transition-colors",
          className
        )}
        animate={{
          width: animate ? (open ? "260px" : "72px") : "260px",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}>
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-14 px-4 flex flex-row md:hidden items-center justify-between bg-[#eae5d9] border-b border-neutral-300/80 w-full z-40"
        )}
        {...props}>
        <div className="flex justify-between items-center w-full">
          <BrandLogo size="sm" />
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="p-2 rounded-xl bg-white/70 border border-neutral-300/80 text-neutral-800 hover:bg-white cursor-pointer shadow-2xs">
            <IconMenu2 className="w-5 h-5 text-neutral-800" />
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.25,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-[#f2eee5] p-6 z-[100] flex flex-col justify-between paper-grain",
                className
              )}>
              <div
                className="absolute right-5 top-5 z-50 p-2 rounded-xl bg-white/80 border border-neutral-300/80 text-neutral-800 cursor-pointer shadow-2xs hover:bg-white"
                onClick={() => setOpen(!open)}>
                <IconX className="w-5 h-5" />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  active = false,
  ...props
}) => {
  const { open, animate } = useSidebar();
  return (
    <button
      type="button"
      onClick={link.onClick}
      className={cn(
        "flex items-center w-full gap-3 group/sidebar px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer text-left",
        active
          ? "bg-[#111215] text-[#f2eee5] shadow-xs"
          : "text-neutral-700 hover:bg-neutral-300/50 hover:text-neutral-900",
        className
      )}
      {...props}>
      <span className={cn(
        "shrink-0 transition-transform duration-200 group-hover/sidebar:scale-110",
        active ? "text-[#f2eee5]" : "text-neutral-600"
      )}>
        {link.icon}
      </span>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className={cn(
          "text-sm font-medium tracking-tight whitespace-pre inline-block !p-0 !m-0 transition-colors truncate",
          active ? "text-[#f2eee5] font-semibold" : "text-neutral-800"
        )}>
        {link.label}
      </motion.span>
      {link.badge && open && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            "ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold shrink-0",
            active ? "bg-white/20 text-white" : "bg-[#d9480f]/10 text-[#d9480f] border border-[#d9480f]/20"
          )}>
          {link.badge}
        </motion.span>
      )}
    </button>
  );
};

