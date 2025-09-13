"use client";

import { useState } from "react";
import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { sepolia } from "viem/chains";
import { createConfig, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { http } from "viem";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useUserWallets } from "@dynamic-labs/sdk-react-core";
import { registerUser } from "@/helper/register-user";
import useAuthStore from "@/stores/auth-store";
import { UserData } from "@/lib/types";
import Cookies from "universal-cookie";

const config = createConfig({
  chains: [sepolia],
  multiInjectedProviderDiscovery: false,
  transports: {
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

console.log(process.env.NEXT_DYNAMIC_WALLET_ENVIRONMENTAL_ID);

const cookie = new Cookies()

const DynamicProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const { logout } = useAuth();
  const {
    user: authenticatedUser,
    setUser,
    setWalletAddress,
    setEmail,
    email,
    walletAddress,
    signature
  } = useAuthStore();

  // const { primaryWallet } = useDynamicContext();
  // const userWallets = useUserWallets();

  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_WALLET_ENVIRONMENTAL_ID!,
        walletConnectors: [EthereumWalletConnectors],
        // initialAuthenticationMode: "connect-only",
        siweStatement:
          "Welcome to TracceAqua! This request will not trigger a blockchain transaction...",
        events: {
          onLogout: () => {
            cookie.remove("user-token")
            logout();
          },
          onAuthFailure: () => {
            toast.error("Failed to sign in, please sign in");
          },
          onAuthInit: (args) => {
            if (args.type === "email") {
              setEmail(args.email);
              console.log(args.email)
            }

            if (args.type === "wallet") {
              setWalletAddress(args.address);
              console.log(args.address)
            }
          },
          // onAuthSuccess: async ({ user }) => {
          //   const userData: UserData = {
          //     email: email ? email : "",
          //     address: walletAddress,
          //     signature: signature,
          //     message:
          //       "Welcome to TracceAqua! This request will not trigger a blockchain transaction...",
          //     firstName: "",
          //     lastName: "",
          //   };
          //   console.log(userData)
          // },
        },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
};

export default DynamicProvider;
