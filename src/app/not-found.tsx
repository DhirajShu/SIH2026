import React from "react";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { TerraReconLogo } from "@/components/layout/TerraReconLogo";

export default function NotFound() {
  return (
    <div className="flex-1 min-h-[75vh] flex items-center justify-center bg-[#080B0A] font-sans text-[#F1F4F2] px-4 select-none">
      <div className="max-w-md w-full p-8 rounded-[14px] bg-[#121916] border border-[#26302C] text-center space-y-5 shadow-2xl">
        <div className="w-12 h-12 rounded-[10px] bg-[#0D1210] border border-[#26302C] flex items-center justify-center text-[#78AFA2] mx-auto">
          <Compass className="w-6 h-6 animate-pulse" />
        </div>

        <div className="space-y-1">
          <div className="text-4xl font-mono font-bold tracking-tight text-[#F1F4F2]">404</div>
          <h1 className="text-lg font-semibold tracking-tight text-[#F1F4F2] uppercase font-mono">
            LOST IN RECONSTRUCTION.
          </h1>
          <p className="text-xs text-[#9BA6A1] font-sans leading-relaxed pt-1">
            There&apos;s no terrain here. The requested spatial dataset or coordinate sector could not be found.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/dashboard"
            className="h-11 px-5 rounded-[8px] bg-[#78AFA2] hover:bg-[#8CC2B4] text-[#080B0A] font-sans text-xs font-semibold tracking-wider inline-flex items-center gap-2 transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            RETURN TO DASHBOARD
          </Link>
        </div>
      </div>
    </div>
  );
}
