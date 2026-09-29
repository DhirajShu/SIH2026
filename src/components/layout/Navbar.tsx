"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Layers,
  FolderGit2,
  PlusCircle,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Radio,
  Boxes
} from "lucide-react";
import { getStoredUser, UserSession, logoutUser } from "@/lib/auth";

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Boxes },
    { href: "/dashboard/projects", label: "Projects", icon: FolderGit2 },
    { href: "/dashboard/new", label: "New Reconstruction", icon: PlusCircle, highlight: true },
    { href: "/dashboard/settings", label: "Sensors & CRS", icon: Settings },
  ];

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800/80 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-amber-400 group-hover:border-amber-500/60 transition-colors">
              <Compass className="w-4 h-4 text-amber-500 group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm tracking-wider font-semibold text-neutral-100 flex items-center gap-1.5">
                TERRARECON
                <span className="text-[10px] px-1 py-0.2 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded font-mono font-normal">
                  v2.4
                </span>
              </span>
              <span className="text-[9px] font-mono text-neutral-400 tracking-tight">
                SINGLE-PASS DRONE PHOTOGRAMMETRY
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {!isAuthPage && (
            <nav className="hidden md:flex items-center gap-1 ml-4 border-l border-neutral-800/80 pl-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                      link.highlight
                        ? isActive
                          ? "bg-amber-500 text-neutral-950 font-medium"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                        : isActive
                        ? "bg-neutral-800/80 text-neutral-100"
                        : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
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
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-900/60 border border-neutral-800 font-mono text-[11px] text-neutral-400">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>NVDEC GPU: <strong className="text-neutral-300">ONLINE</strong></span>
            <span className="text-neutral-600">|</span>
            <span>RTK: <strong className="text-neutral-300">FIXED</strong></span>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 py-1 px-2.5 rounded-lg border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-800/50 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-mono text-neutral-300">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs text-neutral-200 font-medium leading-none">{user.name}</span>
                  <span className="text-[10px] text-neutral-400 leading-none mt-1">{user.role}</span>
                </div>
              </Link>
              <Link
                href="/login"
                onClick={() => logoutUser()}
                title="Switch User / Logout"
                className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-mono text-neutral-300 hover:text-neutral-100 px-3 py-1.5 rounded transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-xs font-mono bg-neutral-200 hover:bg-neutral-100 text-neutral-950 font-semibold px-3 py-1.5 rounded transition-colors"
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
            className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-900 border border-neutral-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-t border-neutral-800 bg-neutral-950/95 space-y-2 font-mono text-xs">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${
                  isActive ? "bg-amber-500/20 text-amber-400 font-semibold" : "text-neutral-300 hover:bg-neutral-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-neutral-400">
            <span>{user ? user.name : "Guest Surveyor"}</span>
            <Link
              href="/login"
              onClick={() => {
                logoutUser();
                setMobileMenuOpen(false);
              }}
              className="text-amber-400 hover:underline"
            >
              {user ? "Sign Out" : "Sign In"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
