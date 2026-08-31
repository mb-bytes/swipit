"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./sidebar-component";
import {
    IconArrowLeft,
    IconBrandTabler,
    IconSettings,
    IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/Landing/Navbar/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function SidebarDemo({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleLogout = async () => {
        try {
            if (logout) await logout();
        } finally {
            navigate("/signin");
        }
    };

    const links = [
        {
            label: "Home",
            href: "/dashboard",
            icon: (
                <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700" />
            ),
        },
        {
            label: "Settings",
            href: "/settings",
            icon: (
                <IconSettings className="h-5 w-5 shrink-0 text-neutral-700" />
            ),
        },
    ];

    const displayName = user?.name || user?.username || "Manu Arora";
    const userInitials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div
            className={cn(
                "flex w-full h-screen flex-1 flex-col overflow-hidden bg-[#eae5d9] md:flex-row paper-grain text-[#111215]"
            )}>
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <SidebarLink
                            link={{
                                label: displayName,
                                href: "#",
                                icon: (
                                    <div className="h-7 w-7 shrink-0 rounded-full bg-[#111215] text-[#f2eee5] font-mono text-xs font-bold flex items-center justify-center shadow-2xs">
                                        {userInitials}
                                    </div>
                                ),
                            }}
                        />
                    </div>
                </SidebarBody>
            </Sidebar>
            {children}
        </div>
    );
}

export const Logo = () => {
    return (
        <div className="py-1">
            <BrandLogo size="sm" />
        </div>
    );
};

export const LogoIcon = () => {
    return (
        <div className="py-1">
            <BrandLogo size="sm" iconOnly={true} />
        </div>
    );
};



