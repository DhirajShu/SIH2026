"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Info
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { TerraReconLogo } from "@/components/layout/TerraReconLogo";

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
      <div className="text-center space-y-2 flex flex-col items-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-2 group transition-opacity hover:opacity-90">
          <TerraReconLogo size={28} subtext="ENTER OPERATIONAL CONSOLE" />
        </Link>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F1F4F2]">
          Welcome back
        </h1>
        <p className="text-xs font-mono text-[#9BA6A1]">
          SIGN IN TO ACCESS YOUR GEOSPATIAL RECONSTRUCTION WORKSPACE
        </p>
      </div>

      {/* Authentication Card */}
      <div className="p-6 sm:p-8 rounded-[14px] bg-[#121916] border border-[#26302C] shadow-2xl space-y-5">
        {/* Error Banner */}
        {errorMsg && (
          <div className="p-3 rounded-[8px] bg-[#B87575]/12 border border-[#B87575]/35 text-[#B87575] font-mono text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google OAuth Notice */}
        {googleNotice && (
          <div className="p-3 rounded-[8px] bg-[#B49B69]/12 border border-[#B49B69]/35 text-[#B49B69] font-mono text-xs flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#B49B69]" />
            <span>
              <strong>Prototype Notice:</strong> Google OAuth is restricted in this offline sandbox. Please use email credentials or the evaluator accounts below.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {/* Email Field */}
          <div>
            <label className="block text-[#F1F4F2] mb-1.5 font-medium">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#68736E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                disabled={isSubmitting}
                className="w-full pl-9 pr-3 py-2.5 bg-[#0D1210] border border-[#26302C] rounded-[8px] text-[#F1F4F2] placeholder:text-[#68736E] focus:outline-none focus:border-[#78AFA2] disabled:opacity-50 transition-colors"
                placeholder="name@organization.gov.in"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[#F1F4F2] font-medium">PASSWORD</label>
              <span className="text-[10px] text-[#68736E]">Min. 6 chars</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#68736E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                disabled={isSubmitting}
                className="w-full pl-9 pr-3 py-2.5 bg-[#0D1210] border border-[#26302C] rounded-[8px] text-[#F1F4F2] placeholder:text-[#68736E] focus:outline-none focus:border-[#78AFA2] disabled:opacity-50 transition-colors"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {/* Primary Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 px-4 bg-[#78AFA2] hover:bg-[#8CC2B4] text-[#080B0A] font-semibold text-xs font-mono rounded-[8px] flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-[#080B0A] border-t-transparent rounded-full animate-spin" />
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
              <div className="w-full border-t border-[#26302C]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-[#121916] px-2 text-[#68736E]">Or continue with</span>
            </div>
          </div>

          {/* Continue with Google Button */}
          <button
            type="button"
            onClick={() => setGoogleNotice(true)}
            className="w-full h-11 px-4 bg-[#0D1210] hover:bg-[#17211d] border border-[#26302C] text-[#F1F4F2] font-mono text-xs rounded-[8px] flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
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
            <span className="text-[9px] px-1 py-0.2 rounded-[4px] bg-[#121916] border border-[#26302C] text-[#9BA6A1] font-mono">
              Prototype
            </span>
          </button>
        </form>

        {/* Quick Evaluator Access */}
        <div className="pt-3 border-t border-[#26302C] space-y-2">
          <div className="text-[10px] font-mono text-[#68736E] uppercase tracking-wider text-center">
            Quick Demo Access for Evaluators:
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => fillDemoAccount("lead.surveyor@terra-recon.io", "surveyor2026")}
              className="p-2 rounded-[8px] bg-[#0D1210] hover:bg-[#17211d] border border-[#26302C] hover:border-[#78AFA2] text-left transition-colors cursor-pointer"
            >
              <div className="text-[#F1F4F2] font-semibold truncate">Lead Surveyor</div>
              <div className="text-[#68736E] text-[10px]">DGCA Certified</div>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("sih.evaluator@nic.in", "evaluator2026")}
              className="p-2 rounded-[8px] bg-[#0D1210] hover:bg-[#17211d] border border-[#26302C] hover:border-[#78AFA2] text-left transition-colors cursor-pointer"
            >
              <div className="text-[#78AFA2] font-semibold truncate">SIH Jury</div>
              <div className="text-[#68736E] text-[10px]">Ministry Access</div>
            </button>
          </div>
        </div>

        {/* Link to Signup */}
        <div className="text-center pt-2 font-mono text-xs text-[#9BA6A1]">
          Need new ground station credentials?{" "}
          <Link href="/signup" className="text-[#78AFA2] hover:text-[#8CC2B4] font-medium hover:underline">
            Register workspace
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#080B0A] font-sans select-none">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 rounded-[14px] bg-[#121916] border border-[#26302C] text-center font-mono text-xs text-[#9BA6A1]">
            INITIALIZING WORKSPACE AUTHENTICATION...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
