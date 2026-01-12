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
import { ThemeToggle } from "@/components/theme-toggle";
import { Eye, EyeOff, Building2, Shield } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import Image from "next/image";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();



  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("userName", formData.name);
      router.push("/profile");
      setIsLoading(false);
    }, 1000);
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("User:", user);

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
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-bauhaus-red opacity-5"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-bauhaus-blue opacity-5 rotate-45"></div>
      <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-bauhaus-yellow opacity-5"></div>

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

            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>
              Join the future of real estate transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={errors.name ? "ring-2 ring-destructive" : ""}
                />
                {errors.name && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>{errors.name}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
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
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className={errors.confirmPassword ? "ring-2 ring-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription>
                      {errors.confirmPassword}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
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
                Sign Up with Google
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
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
