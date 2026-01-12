"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Building2, Shield } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Mock authentication
    setTimeout(() => {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", email);
      router.push("/profile");
      setIsLoading(false);
    }, 1000);
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("User:", user);

      // Optional: save user info in localStorage or context
      if (typeof window !== "undefined") {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userEmail", user.email || "");
        localStorage.setItem("userName", user.displayName || "");
      }

      router.push("/profile");
    } catch (error) {
      console.error("Popup login error:", error);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Bauhaus Geometric Background */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-bauhaus-blue opacity-5"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-bauhaus-red opacity-5 rotate-45"></div>
      <div className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full bg-bauhaus-yellow opacity-5"></div>

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            {/* Logo */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-background flex items-center justify-center shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light)] mr-3">
                <Building2 className="h-7 w-7 text-bauhaus-blue" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  PropChain
                </h1>
                <p className="text-xs text-muted-foreground">
                  Blockchain Real Estate
                </p>
              </div>
            </div>

            {/* Bauhaus accent */}
            <div className="w-16 h-1 mx-auto mb-4 flex">
              <div className="flex-1 bg-bauhaus-red"></div>
              <div className="flex-1 bg-bauhaus-yellow"></div>
              <div className="flex-1 bg-bauhaus-blue"></div>
            </div>

            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "ring-2 ring-destructive" : ""}
                />
                {errors.email && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>{errors.email}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? "ring-2 ring-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>{errors.password}</AlertDescription>
                  </Alert>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isLoading}
                onClick={handleGoogleLogin}
              >
                <Image
                  src="/google-icon.svg"
                  alt="google"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                Sign In with Google
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <div className="flex items-center justify-center mb-2">
                <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center shadow-[2px_2px_4px_var(--neu-shadow-dark),-2px_-2px_4px_var(--neu-shadow-light)] mr-2">
                  <Shield className="h-3 w-3 text-bauhaus-blue" />
                </div>
                <span className="text-muted-foreground">
                  Secured by Blockchain
                </span>
              </div>
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
