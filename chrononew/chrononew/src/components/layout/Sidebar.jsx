
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Dna,
} from "lucide-react";

import { navSections, adminItem } from "@/lib/navConfig";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";

export default function Sidebar({ user }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const renderItem = (item) => {
    const active =
      location.pathname === item.path ||
      (item.path !== "/" &&
        location.pathname.startsWith(item.path));

    return (
      <Link
        key={item.path}
        to={item.path}
        title={collapsed ? item.label : undefined}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
          active
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-primary/20"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )}
      >
        <item.icon
          className={cn(
            "w-[18px] h-[18px] flex-shrink-0",
            active && "drop-shadow-sm"
          )}
        />

        {!collapsed && (
          <span className="font-medium truncate">
            {item.label}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-40 transition-all duration-300 flex flex-col",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <Dna className="w-5 h-5 text-white" />
        </div>

        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-sidebar-foreground font-display tracking-tight">
              ChronoTwin-X
            </h1>

            <p className="text-[10px] text-sidebar-foreground/50">
              Digital Twin Healthcare
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-3 px-3 space-y-3 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {section.title}
              </p>
            )}

            {collapsed && (
              <div className="my-1 border-t border-sidebar-border/50" />
            )}

            <div className="space-y-0.5">
              {section.items.map(renderItem)}
            </div>
          </div>
        ))}

        {isAdmin && (
          <>
            <div className="border-t border-sidebar-border" />
            {renderItem(adminItem)}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground w-full transition-all"
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />

          {!collapsed && (
            <span className="font-medium">
              Logout
            </span>
          )}
        </button>

        <button
          onClick={() => setCollapsed((prev) => !prev)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex items-center justify-center w-full py-1.5 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
}

