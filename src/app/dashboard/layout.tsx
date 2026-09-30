"use client";

import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex-1 min-h-[calc(100vh-3.5rem)] flex flex-col md:flex-row bg-neutral-950 font-sans text-neutral-100">
        <DashboardSidebar />
        <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
