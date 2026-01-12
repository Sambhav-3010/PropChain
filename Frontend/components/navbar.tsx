"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X, Building2 } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [userName, setUserName] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAuth(localStorage.getItem("isAuthenticated") === "true");
      setUserName(localStorage.getItem("userName") || "User");
    }
  }, []);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Profile", href: "/profile" },
    { name: "Feedback", href: "/feedback" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-background shadow-[0_4px_12px_var(--neu-shadow-dark)]">
      {/* Bauhaus accent stripe */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-bauhaus-red"></div>
        <div className="flex-1 bg-bauhaus-yellow"></div>
        <div className="flex-1 bg-bauhaus-blue"></div>
      </div>

      <div className="relative flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-[4px_4px_8px_var(--neu-shadow-dark),-4px_-4px_8px_var(--neu-shadow-light)] group-hover:shadow-[5px_5px_10px_var(--neu-shadow-dark),-5px_-5px_10px_var(--neu-shadow-light)] transition-shadow duration-300">
            <Building2 className="h-5 w-5 text-bauhaus-blue" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            PropChain
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${pathname === item.href
                  ? "bg-background shadow-[inset_3px_3px_6px_var(--neu-shadow-dark),inset_-3px_-3px_6px_var(--neu-shadow-light)] text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-background hover:shadow-[3px_3px_6px_var(--neu-shadow-dark),-3px_-3px_6px_var(--neu-shadow-light)]"
                }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />

          <div className="hidden md:flex items-center space-x-3">
            {isAuth ? (
              <div className="relative">
                <Button
                  variant="default"
                  onClick={() => setIsOpen((prev) => !prev)}
                  className="font-medium"
                >
                  {userName}
                </Button>
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-40 rounded-xl bg-background shadow-[6px_6px_12px_var(--neu-shadow-dark),-6px_-6px_12px_var(--neu-shadow-light)] z-50">
                    <button
                      className="w-full text-left px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors"
                      onClick={() => {
                        localStorage.removeItem("isAuthenticated");
                        localStorage.removeItem("userName");
                        localStorage.removeItem("userEmail");
                        window.location.href = "/";
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button variant="primary" asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${pathname === item.href
                    ? "bg-background shadow-[inset_3px_3px_6px_var(--neu-shadow-dark),inset_-3px_-3px_6px_var(--neu-shadow-light)] text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex flex-col space-y-2 pt-4 border-t border-border">
              {isAuth ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    localStorage.removeItem("isAuthenticated");
                    localStorage.removeItem("userName");
                    localStorage.removeItem("userEmail");
                    window.location.href = "/";
                  }}
                >
                  Logout
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild className="w-full">
                    <Link href="/auth/login">Login</Link>
                  </Button>
                  <Button variant="primary" asChild className="w-full">
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
