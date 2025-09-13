'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { BrowserProvider, Eip1193Provider } from 'ethers'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Wallet, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WalletConnectButtonProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'tracce'
  size?: 'sm' | 'md' | 'lg'
  showStatus?: boolean
}

export function WalletConnectButton({ 
  onSuccess, 
  onError,
  className,
  variant = 'default',
  size = 'md',
  showStatus = false
}: WalletConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  
  const { open, close } = useAppKit()
  const { address, isConnected, caipAddress, status } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155')
  const { loginWithWallet } = useAuth()
//   const { toast } = useToast()

  // Update connection status based on AppKit state
  useEffect(() => {
    if (status === 'connecting') {
      setConnectionStatus('connecting')
    } else if (isConnected && address) {
      setConnectionStatus('connected')
    } else {
      setConnectionStatus('disconnected')
    }
  }, [status, isConnected, address])

  // Handle wallet connection and authentication
  const handleConnect = async () => {
    try {
      setIsLoading(true)
      setConnectionStatus('connecting')

      // If already connected, proceed to authentication
      if (isConnected && address) {
        await authenticateWithWallet(address)
        return
      }

      // Open WalletConnect modal
      await open()
      
    } catch (error) {
      console.error('Wallet connection error:', error)
      setConnectionStatus('error')
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet'
      onError?.(errorMessage)
    //   toast({
    //     title: "Connection Failed",
    //     description: errorMessage,
    //     variant: "destructive",
    //   })

    toast.error("Connection Failed")
    } finally {
      setIsLoading(false)
    }
  }

  // Authenticate with backend after wallet connection
  const authenticateWithWallet = async (walletAddress: string) => {
    try {
      if (!walletProvider) {
        throw new Error('Wallet provider not available')
      }

      // Create ethers provider
      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider)
      const signer = await ethersProvider.getSigner()

      // Create sign-in message
      const nonce = Math.floor(Math.random() * 1000000)
      const message = `Welcome to TracceAqua!
        Please sign this message to authenticate with your wallet.

        Wallet: ${walletAddress}
        Nonce: ${nonce}
        Timestamp: ${new Date().toISOString()}`

      // Request signature
      const signature = await signer.signMessage(message)

      // Authenticate with backend
      await loginWithWallet(walletAddress, signature, message)

      setConnectionStatus('connected')
    //   toast({
    //     title: "Connected Successfully",
    //     description: "Your wallet has been connected and authenticated.",
    //   })
    
    toast.success("Connected Successfully")
      
      onSuccess?.()

    } catch (error) {
      console.error('Authentication error:', error)
      setConnectionStatus('error')
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
      onError?.(errorMessage)
    //   toast({
    //     title: "Authentication Failed",
    //     description: errorMessage,
    //     variant: "destructive",
    //   })

    toast.error("Authentication Failed")
    }
  }

  // Monitor wallet connection changes
  useEffect(() => {
    if (isConnected && address && connectionStatus === 'connecting') {
      authenticateWithWallet(address)
    }
  }, [isConnected, address, connectionStatus])

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-9 px-3 text-sm'
      case 'lg': return 'h-12 px-8 text-lg'
      default: return 'h-10 px-6'
    }
  }

  const getButtonText = () => {
    if (isLoading || connectionStatus === 'connecting') {
      return 'Connecting...'
    }
    
    if (connectionStatus === 'connected') {
      return showStatus ? `Connected (${address?.slice(0, 6)}...${address?.slice(-4)})` : 'Connected'
    }
    
    if (connectionStatus === 'error') {
      return 'Connection Failed'
    }
    
    return 'Connect Wallet'
  }

  const getButtonIcon = () => {
    if (isLoading || connectionStatus === 'connecting') {
      return <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    }
    
    if (connectionStatus === 'connected') {
      return <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
    }
    
    if (connectionStatus === 'error') {
      return <AlertCircle className="mr-2 h-4 w-4 text-red-600" />
    }
    
    return <Wallet className="mr-2 h-4 w-4" />
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading || connectionStatus === 'connected'}
    //   variant={variant}
      className={cn(getSizeClasses(), className)}
    >
      {getButtonIcon()}
      {getButtonText()}
    </Button>
  )
}