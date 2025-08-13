// src/components/debug/auth-debug.tsx (for debugging only)
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { useAccount } from "wagmi";

export function AuthDebug() {
  const auth = useAuth();
  const store = useAuthStore();
  const wallet = useAccount();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        background: "black",
        color: "white",
        padding: "10px",
        fontSize: "12px",
        maxWidth: "300px",
        zIndex: 9999,
        fontFamily: "monospace",
      }}
    >
      <h4>Auth Debug</h4>
      <div>Hook User: {auth.user ? "✅" : "❌"}</div>
      <div>Hook Token: {auth.token ? "✅" : "❌"}</div>
      <div>Hook Auth: {auth.isAuthenticated ? "✅" : "❌"}</div>
      <div>Hook Loading: {auth.isLoading ? "⏳" : "✅"}</div>
      <div>Store User: {store.user ? "✅" : "❌"}</div>
      <div>Store Token: {store.token ? "✅" : "❌"}</div>
      <div>Wallet Connected: {wallet.isConnected ? "✅" : "❌"}</div>
      <div>Wallet Address: {wallet.address?.slice(0, 6)}...</div>
      <div>
        LocalStorage:{" "}
        {typeof window !== "undefined" &&
        localStorage.getItem("tracceaqua-auth")
          ? "✅"
          : "❌"}
      </div>
    </div>
  );
}
