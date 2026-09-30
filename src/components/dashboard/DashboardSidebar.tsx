"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  FolderGit2,
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { TerraReconLogo } from "@/components/layout/TerraReconLogo";

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
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0D1210] border-b border-[#26302C] text-[#F1F4F2]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <TerraReconLogo size="sm" showSubtext={false} />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-[8px] border border-[#26302C] text-[#9BA6A1] hover:text-[#F1F4F2] hover:bg-[#121916] transition-colors duration-200"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/75"
        />
      )}

      {/* Sidebar Container — uses same graphite/border language as landing navbar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 md:z-20 h-screen w-64 bg-[#0D1210] border-r border-[#26302C] flex flex-col justify-between select-none transition-transform duration-200 ease-in-out font-sans ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top Branding & Main Nav */}
        <div className="flex flex-col flex-1 p-4 space-y-6">
          {/* Brand — identical logo/wordmark as landing navbar */}
          <div className="px-2 pt-2">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 group transition-opacity duration-200 hover:opacity-85"
            >
              <TerraReconLogo size="md" showSubtext={true} />
            </Link>
          </div>

          {/* Navigation Links — matching landing nav typography and hover style */}
          <nav className="space-y-1 font-sans text-[11px] tracking-[0.04em]">
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] transition-all duration-200 ${
                    isActive
                      ? "bg-[#78AFA2]/10 text-[#F1F4F2] border border-[#78AFA2]/20 font-medium"
                      : "text-[#9BA6A1] hover:text-[#F1F4F2] hover:bg-[#121916] border border-transparent"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                      isActive ? "text-[#78AFA2]" : "text-[#68736E]"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: User profile + Logout — same surface/border treatment */}
        <div className="p-4 border-t border-[#26302C] bg-[#0D1210] space-y-3 font-sans">
          {/* User Profile Card */}
          <div className="flex items-center gap-3 p-2.5 rounded-[8px] bg-[#121916] border border-[#26302C]">
            <div className="w-8 h-8 rounded-full bg-[#080B0A] border border-[#26302C] flex items-center justify-center text-xs font-semibold text-[#78AFA2] shrink-0">
              {user ? user.name.charAt(0) : "S"}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[11px] font-medium text-[#F1F4F2] truncate leading-snug">
                {user ? user.name : "Survey Specialist"}
              </span>
              <span className="text-[10px] text-[#68736E] truncate leading-snug">
                {user ? user.email : "user@terra-recon.io"}
              </span>
            </div>
          </div>

          {/* Logout Button — same button treatment as landing "Get Started" inverted */}
          <button
            onClick={() => {
              logout();
              setMobileOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[8px] bg-[#121916] hover:bg-[#17211d] text-[#9BA6A1] hover:text-[#B87575] text-[11px] tracking-[0.04em] transition-colors duration-200 cursor-pointer border border-[#26302C]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
