"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderGit2,
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Radio,
  Boxes
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { TerraReconLogo } from "./TerraReconLogo";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Boxes },
    { href: "/dashboard/projects", label: "Projects", icon: FolderGit2 },
    { href: "/dashboard/new", label: "New Reconstruction", icon: PlusCircle, highlight: true },
    { href: "/dashboard/settings", label: "Sensors & CRS", icon: Settings },
  ];

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isLandingPage = pathname === "/";

  // Landing page has its own navigation embedded in the scroll story
  if (isLandingPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080B0A]/92 border-b border-[#26302C]/80 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo and Brand — same wordmark/treatment as landing */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group transition-opacity duration-200 hover:opacity-85">
            <TerraReconLogo size={24} subtext="GEOSPATIAL ENGINE" />
          </Link>

          {/* Desktop Navigation Links — uses same visual language as landing nav */}
          {!isAuthPage && (
            <nav className="hidden md:flex items-center gap-1 ml-4 border-l border-[#26302C] pl-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/dashboard" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[11px] font-sans tracking-[0.04em] transition-colors duration-200 ${
                      link.highlight
                        ? isActive
                          ? "bg-[#78AFA2] text-[#080B0A] font-semibold"
                          : "bg-[#78AFA2]/10 text-[#78AFA2] border border-[#78AFA2]/25 hover:bg-[#78AFA2]/18"
                        : isActive
                        ? "bg-[#78AFA2]/10 text-[#F1F4F2] border border-[#78AFA2]/20"
                        : "text-[#9BA6A1] hover:text-[#F1F4F2] hover:bg-[#0D1210]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right side: telemetry status indicator + user profile */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-[8px] bg-[#0D1210] border border-[#26302C] font-mono text-[11px] text-[#9BA6A1]">
            <Radio className="w-3 h-3 text-[#7FAE8D] animate-pulse" />
            <span>NVDEC GPU: <strong className="text-[#F1F4F2]">ONLINE</strong></span>
            <span className="text-[#26302C]">|</span>
            <span>RTK: <strong className="text-[#F1F4F2]">FIXED</strong></span>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 py-1 px-2.5 rounded-[8px] border border-[#26302C] bg-[#0D1210] hover:bg-[#121916] transition-colors duration-200"
              >
                <div className="w-6 h-6 rounded-full bg-[#121916] border border-[#26302C] flex items-center justify-center text-xs font-sans text-[#78AFA2]">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-[11px] text-[#F1F4F2] font-medium leading-none">{user.name}</span>
                  <span className="text-[10px] text-[#9BA6A1] leading-none mt-1">{user.role}</span>
                </div>
              </Link>
              <button
                type="button"
                onClick={logout}
                title="Switch User / Logout"
                className="p-1.5 text-[#9BA6A1] hover:text-[#F1F4F2] hover:bg-[#121916] rounded-[8px] transition-colors duration-200 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-[11px] font-sans tracking-[0.04em] text-[#9BA6A1] hover:text-[#F1F4F2] px-3 py-1.5 rounded-[8px] transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-[11px] font-sans tracking-[0.04em] bg-[#78AFA2] hover:bg-[#8CC2B4] text-[#080B0A] font-semibold px-4 py-1.5 rounded-[8px] transition-colors duration-200"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#9BA6A1] hover:text-[#F1F4F2] rounded-[8px] hover:bg-[#121916] border border-[#26302C] transition-colors duration-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-t border-[#26302C] bg-[#080B0A]/95 space-y-2 font-sans text-[11px] tracking-[0.04em]">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-[8px] transition-colors duration-200 ${
                  isActive ? "bg-[#78AFA2]/12 text-[#78AFA2] font-semibold" : "text-[#9BA6A1] hover:bg-[#121916]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[#26302C] flex items-center justify-between text-[#9BA6A1]">
            <span>{user ? user.name : "Guest Surveyor"}</span>
            {user ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-[#78AFA2] hover:underline cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#78AFA2] hover:underline"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
