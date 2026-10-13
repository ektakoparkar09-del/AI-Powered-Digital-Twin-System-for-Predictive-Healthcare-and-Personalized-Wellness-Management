
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Dna, Menu, LogOut, Shield } from "lucide-react";

import { navSections, adminItem } from "@/lib/navConfig";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function MobileNav({ user }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isAdmin = user?.role === "admin";

  const renderLink = (item) => {
    const active = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
          active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent"
        )}
      >
        <item.icon className="w-[18px] h-[18px]" />
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card/90 backdrop-blur-xl border-b border-border z-50 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <Dna className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold font-display text-sm">ChronoTwin-X</span>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="p-2 rounded-lg hover:bg-muted transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 bg-sidebar border-sidebar-border overflow-y-auto">
          <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border sticky top-0 bg-sidebar z-10">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <Dna className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-sidebar-foreground font-display">ChronoTwin-X</h1>
              <p className="text-[10px] text-sidebar-foreground/50">Digital Twin Healthcare</p>
            </div>
          </div>
          <nav className="py-4 px-3 space-y-3">
            {navSections.map((section) => (
              <div key={section.title}>
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">{section.title}</p>
                <div className="space-y-0.5">{section.items.map(renderLink)}</div>
              </div>
            ))}
            {isAdmin && (
              <>
                <div className="border-t border-sidebar-border" />
                {renderLink(adminItem)}
              </>
            )}
            <div className="border-t border-sidebar-border" />
            <button
              onClick={() => db.auth.logout()}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent w-full"
            >
              <LogOut className="w-[18px] h-[18px]" />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}