"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Key, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { saveUserSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("surveyor@terra-recon.io");
  const [password, setPassword] = useState("••••••••••••");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      saveUserSession({
        email,
        name: "Dr. Dhiraj Sharma",
        organization: "National Geospatial Laboratory",
        role: "Chief Photogrammetry Specialist",
      });
      router.push("/dashboard");
    }, 600);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      saveUserSession({
        email: "sih.evaluator@hackathon.gov.in",
        name: "SIH Jury Evaluator",
        organization: "Smart India Hackathon 2026",
        role: "Technical Evaluator",
      });
      router.push("/dashboard");
    }, 400);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-neutral-950 font-sans select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-amber-500 mb-2">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-100">
            TerraRecon Console
          </h1>
          <p className="text-xs font-mono text-neutral-400">
            SECURE GEOSPATIAL PHOTOGRAMMETRY ACCESS
          </p>
        </div>

        {/* Card */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                SURVEYOR EMAIL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="name@agency.gov.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                ACCESS TOKEN / PASSWORD
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium text-xs font-mono rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="animate-pulse">Authenticating Session...</span>
              ) : (
                <>
                  Enter Mission Console <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access for Hackathon Jury */}
          <div className="pt-4 border-t border-neutral-800 space-y-2">
            <div className="text-[11px] font-mono text-neutral-400 text-center">
              DEMONSTRATION ACCESS (SIH EVALUATION)
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2 px-3 bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/80 text-neutral-200 text-xs font-mono rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Instant SIH Jury Access (1-Click)
            </button>
          </div>
        </div>

        {/* Footer text */}
        <div className="text-center text-xs font-mono text-neutral-500 space-y-1">
          <div>
            Need access credentials?{" "}
            <Link href="/signup" className="text-amber-400 hover:underline">
              Request Station Account
            </Link>
          </div>
          <div>CRS Standards: EPSG:4326 • WGS 84 • RTK Synchronized</div>
        </div>
      </div>
    </div>
  );
}
