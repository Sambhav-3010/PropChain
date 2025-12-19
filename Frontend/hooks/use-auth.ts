"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthState {
  isAuthenticated: boolean;
  userName: string | null;
  userEmail: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userName: null,
    userEmail: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Only run on client side
    const checkAuth = () => {
      const isAuth = localStorage.getItem("isAuthenticated") === "true";
      const name = localStorage.getItem("userName");
      const email = localStorage.getItem("userEmail");

      setAuthState({
        isAuthenticated: isAuth,
        userName: name,
        userEmail: email
      });
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    setAuthState({
      isAuthenticated: false,
      userName: null,
      userEmail: null
    });
    router.push("/");
  };

  return {
    ...authState,
    isLoading,
    logout
  };
}
