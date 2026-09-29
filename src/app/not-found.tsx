import React from "react";
import Link from "next/link";
import { Compass, AlertTriangle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 min-h-[70vh] flex items-center justify-center bg-neutral-950 font-sans text-neutral-100 px-4">
      <div className="max-w-md w-full p-8 rounded-xl bg-neutral-900/80 border border-neutral-800 text-center space-y-4 font-mono shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <div className="text-3xl font-bold text-neutral-100">404</div>
          <div className="text-xs text-neutral-400 mt-1 uppercase tracking-wider">
            COORDINATE OUT OF SURVEY BOUNDS
          </div>
        </div>
        <p className="text-xs text-neutral-400 font-sans leading-relaxed">
          The requested terrain sector or mission dataset could not be located in the current geospatial spatial database.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Mission Console
          </Link>
        </div>
      </div>
    </div>
  );
}
