import React, { Suspense } from "react";
import { SidebarDemo } from "./Sidebar/Sidebar.jsx";
import { Outlet } from "react-router-dom";
import { DashboardProvider } from "@/contexts/DashboardContext";

function DashboardFallback() {
    return (
        <div className="h-full w-full min-h-[50vh] flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#111215]/20 border-t-[#111215] animate-spin" />
        </div>
    );
}

function DashboardContainer() {
    return (
        <div className="h-screen w-screen overflow-hidden bg-[#f2eee5] text-[#111215] paper-grain select-none">
            <DashboardProvider>
                <SidebarDemo>
                    <Suspense fallback={<DashboardFallback />}>
                        <Outlet />
                    </Suspense>
                </SidebarDemo>
            </DashboardProvider>
        </div>
    );
}

export default DashboardContainer;
