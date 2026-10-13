import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { useAuth } from "@/lib/AuthContext";

export default function AppLayout() {
  const { user } = useAuth();
  
  return (
    <div className="w-full p-4 md:p-6 lg:p-8">
      <Sidebar user={user} />
      <MobileNav user={user} />
      <main className="lg:ml-[260px] pt-14 lg:pt-0 min-h-screen bg-slate-50">
        <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}