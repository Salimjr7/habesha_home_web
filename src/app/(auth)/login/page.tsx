"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Home, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn.email({
        email,
        password,
      });

      if (res.error) {
        toast.error(res.error.message || "Invalid credentials.");
      } else {
        toast.success("Welcome back to Habesha Home!");
        router.push(redirectUrl);
        router.refresh();
      }
    } catch {
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Demo shortcut login helper
  const handleQuickDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-8 sm:p-10 shadow-2xl space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Home className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-400 dark:to-yellow-300 bg-clip-text text-transparent">
            Habesha Home
          </span>
        </Link>
        <h1 className="text-2xl font-black text-foreground">Sign In to Your Account</h1>
        <p className="text-xs text-muted-foreground">
          Manage your Ethiopian stays, bookings, and host earnings
        </p>
      </div>

      {/* Demo Fast Fill Buttons */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs">
        <span className="font-bold text-amber-600 dark:text-amber-400 block">
          ⚡ Quick Demo Sign-in:
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin("renter@habeshahome.et")}
            className="flex-1 py-1.5 px-2.5 rounded-lg bg-background text-[11px] font-semibold text-foreground hover:bg-secondary border border-border/60 transition-colors"
          >
            Renter Demo
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin("dawit@habeshahome.et")}
            className="flex-1 py-1.5 px-2.5 rounded-lg bg-background text-[11px] font-semibold text-foreground hover:bg-secondary border border-border/60 transition-colors"
          >
            Host / Owner Demo
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin("admin@habeshahome.et")}
            className="flex-1 py-1.5 px-2.5 rounded-lg bg-background text-[11px] font-semibold text-foreground hover:bg-secondary border border-border/60 transition-colors"
          >
            Admin Demo
          </button>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 text-xs">
        <div className="space-y-1.5">
          <label className="font-bold text-foreground block">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="abebe@example.com"
              required
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background/60 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="font-bold text-foreground block">Password</label>
            <Link href="/forgot-password" className="text-primary hover:underline text-[11px]">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background/60 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 text-sm font-bold bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:opacity-95 mt-2"
        >
          {isLoading ? "Authenticating..." : "Sign In"}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-bold text-primary hover:underline">
          Register for free
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
