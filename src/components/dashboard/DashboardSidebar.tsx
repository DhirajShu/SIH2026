"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Boxes,
  FolderGit2,
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Radio,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/lib/auth";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: Boxes, exact: true },
    { href: "/dashboard/projects", label: "Projects", icon: FolderGit2, exact: false },
    { href: "/dashboard/new", label: "New Reconstruction", icon: PlusCircle, exact: false },
    { href: "/dashboard/demo", label: "Demo Reconstruction", icon: Sparkles, exact: false },
    { href: "/dashboard/settings", label: "Settings", icon: Settings, exact: false },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-neutral-950 border-b border-neutral-800 text-neutral-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-500">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-mono text-sm font-semibold tracking-wider text-neutral-100">
            TerraRecon
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 md:z-20 h-screen w-64 bg-neutral-950 border-r border-neutral-800/80 flex flex-col justify-between select-none transition-transform duration-200 ease-in-out font-sans ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top Branding & Main Nav */}
        <div className="flex flex-col flex-1 p-4 space-y-6">
          {/* Brand */}
          <div className="px-2 pt-2">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-500 group-hover:border-amber-500/50 transition-colors">
                <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-sm tracking-wider font-semibold text-neutral-100 leading-tight">
                  TerraRecon
                </span>
                <span className="text-[10px] font-mono text-neutral-400 leading-tight">
                  GEOSPATIAL ENGINE
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 font-mono text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/80"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: User profile + Logout */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-950/60 space-y-3 font-mono">
          {/* User Profile Card */}
          <div className="flex items-center gap-3 p-2 rounded-lg bg-neutral-900/50 border border-neutral-800/80">
            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-semibold text-neutral-200 shrink-0">
              {user ? user.name.charAt(0) : "U"}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-medium text-neutral-200 truncate leading-snug">
                {user ? user.name : "Surveyor Specialist"}
              </span>
              <span className="text-[10px] text-neutral-400 truncate leading-snug">
                {user ? user.email : "user@terra-recon.io"}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              logout();
              setMobileOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 text-xs transition-colors cursor-pointer border border-neutral-800/80"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
