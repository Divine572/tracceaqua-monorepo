"use client";

import { User } from "@/lib/types";
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { UserData } from "@/lib/types";
import { toast } from "sonner";

import { useEffect } from "react";
// import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import useAuthStore from "@/stores/auth-store";

export function useAuth() {
  const { user, setUser, logout } = useAuthStore();

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
        });

        if (!response.ok) throw new Error();

        const data = await response.json();
        setUser(data.data.data)
      } catch (error) {
        console.error(error);
      }
    };

    // getUserData();
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    logout
  };
}
