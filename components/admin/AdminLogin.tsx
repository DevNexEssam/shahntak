"use client"
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { HiArrowRight, HiEye, HiEyeOff, HiLockClosed, HiSparkles } from 'react-icons/hi';
import { HiEnvelope } from 'react-icons/hi2';
import ErrorMessege from '../ui/ErrorMessege';

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    const res = await signIn("admin-credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res?.error || "Invalid email or password");
      setTimeout(() => setError(""), 3000);
    } else if (res?.ok) {
      router.push("/admin/dashboard");
    }

    setLoading(false);
  };
  return (
    <section className="min-h-screen bg-linear-to-b from-white to-accent-soft/5 flex items-center justify-center px-4 py-12">
      {error && <ErrorMessege message={error} />}
      <div className="w-full max-w-110">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-accent font-bold text-2xl">
            <HiSparkles className="size-7" />
            <span>Shahntak</span>
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold text-heading">
            Admin Sign In
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            Welcome back! Log in to access the control panel
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-[30px] border border-border p-8 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-heading mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <HiEnvelope className="size-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@domain.com"
                  className="w-full rounded-[14px] border border-border bg-surface py-3 pl-11 pr-4 text-heading placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-heading">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <HiLockClosed className="size-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-[14px] border border-border bg-surface py-3 pl-11 pr-11 text-heading placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-heading transition-colors cursor-pointer"
                >
                  {showPassword ? <HiEyeOff className="size-5" /> : <HiEye className="size-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-accent focus:ring-accent/20 focus:ring-2 transition-all"
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-[100px] bg-accent text-accent-foreground font-bold text-base hover:bg-accent/90 hover:shadow-accent transition-all h-14 px-9 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Signing in..." : "Sign In"}</span>
              <HiArrowRight className="size-5" />
            </button>
          </form>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground/60">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Protected by SSL encryption</span>
          </span>
        </div>
      </div>
    </section>
  );
}

export default AdminLogin