"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Compass,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Info
} from "lucide-react";
import { useAuth } from "@/lib/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("surveyor@terra-recon.io");
  const [password, setPassword] = useState("password123");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleNotice, setGoogleNotice] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, redirectUrl, router]);

  const validateForm = () => {
    if (!email.trim()) {
      setErrorMsg("Email address is required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return false;
    }
    if (!password) {
      setErrorMsg("Password is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setGoogleNotice(false);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        router.push(redirectUrl);
      } else {
        setErrorMsg(res.error || "Authentication failed. Please check your credentials.");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected system error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
          <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-500 group-hover:border-amber-500/50 transition-colors">
            <Compass className="w-5 h-5" />
          </div>
          <span className="font-mono text-sm tracking-wider font-semibold text-neutral-100">
            TERRARECON
          </span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-100">
          Welcome back
        </h1>
        <p className="text-xs font-mono text-neutral-400">
          SIGN IN TO ACCESS YOUR GEOSPATIAL RECONSTRUCTION WORKSPACE
        </p>
      </div>

      {/* Authentication Card */}
      <div className="p-6 sm:p-8 rounded-xl bg-neutral-900/80 border border-neutral-800 shadow-2xl backdrop-blur space-y-5">
        {/* Error Banner */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google OAuth Notice (Transparent about prototype state) */}
        {googleNotice && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs flex items-start gap-2 animate-in fade-in">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span>
              <strong>Prototype Notice:</strong> Google OAuth client ID is not configured in this local environment. Please use the email sign-in or demo accounts below.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {/* Email Field */}
          <div>
            <label className="block text-neutral-300 mb-1.5 font-medium">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                disabled={isSubmitting}
                className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 disabled:opacity-50 transition-colors"
                placeholder="name@organization.gov.in"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-neutral-300 font-medium">PASSWORD</label>
              <span className="text-[10px] text-neutral-500">Min. 6 chars</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                disabled={isSubmitting}
                className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 disabled:opacity-50 transition-colors"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {/* Primary Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs font-mono rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                <span>Verifying Credentials...</span>
              </div>
            ) : (
              <>
                Sign in <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-neutral-900 px-2 text-neutral-500">Or continue with</span>
            </div>
          </div>

          {/* Continue with Google Button (clearly labeled as Prototype-only) */}
          <button
            type="button"
            onClick={() => setGoogleNotice(true)}
            className="w-full py-2.5 px-4 bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 text-neutral-300 font-mono text-xs rounded-lg flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.57 0 2.98.54 4.09 1.6l3.07-3.07C17.3 1.72 14.84 1 12 1 7.42 1 3.5 3.59 1.63 7.37l3.77 2.92C6.31 7.23 8.92 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.72 2.89c2.18-2.01 3.7-4.98 3.7-8.71z"
              />
              <path
                fill="#FBBC05"
                d="M5.4 14.71c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28L1.63 7.37C.59 9.44 0 11.66 0 14s.59 4.56 1.63 6.63l3.77-2.92z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.72-2.89c-1.04.7-2.37 1.11-4.21 1.11-3.08 0-5.69-2.23-6.6-5.29L1.63 16.63C3.5 20.41 7.42 23 12 23z"
              />
            </svg>
            <span>Continue with Google</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-400 font-mono">
              Prototype
            </span>
          </button>
        </form>

        {/* Quick Evaluator Access (SIH Prototype Helper) */}
        <div className="pt-3 border-t border-neutral-800/80 space-y-2">
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider text-center">
            Quick Demo Access for Evaluators:
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => fillDemoAccount("surveyor@terra-recon.io", "password123")}
              className="p-2 rounded bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 text-neutral-300 text-left transition-colors cursor-pointer"
            >
              <div className="text-amber-400 font-semibold truncate">Dr. Dhiraj Sharma</div>
              <div className="text-neutral-500 text-[10px]">Lead Specialist</div>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("evaluator@sih.gov.in", "password123")}
              className="p-2 rounded bg-neutral-950 border border-neutral-800 hover:border-emerald-500/50 text-neutral-300 text-left transition-colors cursor-pointer"
            >
              <div className="text-emerald-400 font-semibold truncate">SIH Jury</div>
              <div className="text-neutral-500 text-[10px]">Technical Evaluator</div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="text-center font-mono text-xs text-neutral-500 space-y-1">
        <div>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-amber-400 hover:underline">
            Create your workspace
          </Link>
        </div>
        <div>Session is stored securely in your local browser sandbox.</div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 min-h-[85vh] flex items-center justify-center px-4 py-12 bg-neutral-950 font-sans select-none">
      <Suspense
        fallback={
          <div className="p-8 text-center font-mono text-xs text-neutral-400">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading authentication portal...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
