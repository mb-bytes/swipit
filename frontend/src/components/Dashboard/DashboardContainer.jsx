import React from "react";
import { SidebarDemo } from "./Sidebar/Sidebar.jsx";
import { Outlet } from "react-router-dom";

function DashboardContainer() {
    return (
        <div className="h-screen w-screen overflow-hidden bg-[#f2eee5] text-[#111215] paper-grain select-none">
            <SidebarDemo>
                <Outlet />
            </SidebarDemo>
        </div>
    );
}

export default DashboardContainer;