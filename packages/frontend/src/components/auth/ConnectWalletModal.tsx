import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Wallet, Mail } from "lucide-react";

import { WalletConnectButton } from "./WalletConnectButton";
import { GoogleSignInButton } from "./GoogleSignInButton";

interface ConnectWalletModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ConnectWalletModal({ isOpen, onClose, onSuccess }: ConnectWalletModalProps) {
  const handleSuccess = () => {
    onSuccess?.()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold tracce-gradient bg-clip-text text-transparent">
            Connect Your Wallet
          </DialogTitle>
          <DialogDescription>
            Connect your wallet, use Google, or sign in with email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="h-5 w-5 text-primary" />
                Crypto Wallet
              </CardTitle>
              <CardDescription>
                Connect with MetaMask, Phantom, or other wallets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WalletConnectButton 
                onSuccess={handleSuccess}
                className="w-full"
                variant="tracce"
              />
            </CardContent>
          </Card>

          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div> */}

          {/* <Card className="border-secondary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5 text-secondary" />
                Email & Social
              </CardTitle>
              <CardDescription>
                Continue with Google or create an account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleSignInButton 
                onSuccess={handleSuccess}
                className="w-full"
                variant="outline"
              />
            </CardContent>
          </Card> */}

          <div className="text-center text-sm text-muted-foreground">
            <p>Multiple authentication options</p>
            <p>Perfect for all users - crypto native or traditional</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}