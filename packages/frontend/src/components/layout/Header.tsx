"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThemeToggle } from "../ThemeToggle";
import { ConnectWalletModal } from "../auth/ConnectWalletModal";
import { UserDropdown } from "./UserDropdown";
import { MobileMenu } from "./MobileMenu";
import { Menu, QrCode, Scan } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
// import { formatAddress } from '@/lib/utils'

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const { toggleMobileMenu } = useUIStore();
  const [showConnectModal, setShowConnectModal] = useState(false);

  const isLoggedIn = useIsLoggedIn();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left side - Logo and Mobile Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full tracce-gradient flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="hidden font-bold sm:inline-block text-xl">
              TracceAqua
            </span>
          </Link>
        </div>

        {/* Center - Navigation (hidden on mobile) */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/scan"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            <Button variant="ghost" size="sm">
              <QrCode className="h-4 w-4 mr-2" />
              Scan QR
            </Button>
          </Link>

          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right side - Theme toggle, Auth */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />

          {/* QR Scanner for mobile */}
          <Link href="/scan" className="md:hidden">
            <Button variant="ghost" size="icon">
              <Scan className="h-5 w-5" />
            </Button>
          </Link>

          {/* {isLoggedIn && user ? (
            <UserDropdown user={user} />
          ) : (
            // <Button
            //   onClick={() => setShowConnectModal(true)}
            //   variant="default"
            //   size="sm"
            // >
            //   Connect
            // </Button>
            <DynamicWidget
              // innerButtonComponent={<>Connect Wallet</>}
            />
          )} */}
          <DynamicWidget
          // innerButtonComponent={<>Connect Wallet</>}
          />
        </div>
      </div>

      {/* Connect Wallet Modal */}
      <ConnectWalletModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />

      {/* Mobile Menu */}
      <MobileMenu />
    </header>
  );
}
