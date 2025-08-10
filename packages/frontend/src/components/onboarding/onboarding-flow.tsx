// src/components/onboarding/onboarding-flow.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Users, QrCode, Shield, Heart, ChevronRight, ChevronLeft } from 'lucide-react'
import { WalletConnectButton } from '@/components/auth/wallet-connect-button'
import { useAuth } from '@/hooks/use-auth'

interface OnboardingScreen {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  gradient: string
  showConnectButton?: boolean
}

const screens: OnboardingScreen[] = [
  {
    id: 1,
    title: "For All Stakeholders",
    description: "Whether you're a harvester, processor, transporter, inspector, or consumer, TracceAqua empowers you with transparency.",
    icon: <Users className="w-16 h-16 text-white/90" />,
    gradient: "from-blue-600 via-blue-700 to-blue-800",
  },
  {
    id: 2,
    title: "Trace With Ease", 
    description: "Consumers can simply scan a QR code to get the full history and origin of their shellfish product.",
    icon: <QrCode className="w-16 h-16 text-white/90" />,
    gradient: "from-cyan-500 via-blue-600 to-blue-700",
  },
  {
    id: 3,
    title: "How It Works",
    description: "We use blockchain technology to record every step of the shellfish journey, from harvest to your plate.",
    icon: <Shield className="w-16 h-16 text-white/90" />,
    gradient: "from-teal-500 via-cyan-600 to-blue-600",
  },
  {
    id: 4,
    title: "Welcome to TracceAqua!",
    description: "Your trusted partner for traceability and conservation in the Nigerian shellfish supply chain.",
    icon: <Heart className="w-16 h-16 text-white/90" />,
    gradient: "from-emerald-500 via-teal-600 to-cyan-600",
    showConnectButton: true,
  },
]

export function OnboardingFlow() {
  const [currentScreen, setCurrentScreen] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const nextScreen = () => {
    if (currentScreen < screens.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentScreen(currentScreen + 1)
        setIsTransitioning(false)
      }, 150)
    }
  }

  const prevScreen = () => {
    if (currentScreen > 0) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentScreen(currentScreen - 1)
        setIsTransitioning(false)
      }, 150)
    }
  }

  const handleWalletSuccess = () => {
    // Will be redirected by the useEffect above
  }

  const currentScreenData = screens[currentScreen]

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Background with gradient */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${currentScreenData.gradient} transition-all duration-700 ease-in-out`}
      />
      
      {/* Animated background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-8 left-8 w-20 h-20 bg-white rounded-full animate-pulse" />
        <div className="absolute top-32 right-16 w-12 h-12 bg-white rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-32 left-16 w-10 h-10 bg-white rounded-full animate-pulse delay-700" />
        <div className="absolute bottom-16 right-8 w-16 h-16 bg-white rounded-full animate-pulse delay-500" />
      </div>

      {/* Progress indicators */}
      <div className="relative z-10 flex justify-center pt-12 pb-4">
        <div className="flex space-x-2">
          {screens.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentScreen 
                  ? 'w-6 bg-white' 
                  : index < currentScreen 
                    ? 'w-1.5 bg-white/70' 
                    : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main content - Using flex-1 to take remaining space */}
      <div className="flex-1 flex flex-col justify-center px-6 relative z-10 min-h-0">
        <div 
          className={`text-center transition-all duration-500 transform ${
            isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-4 border border-white/20">
                {currentScreenData.icon}
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-4 leading-tight px-4">
            {currentScreenData.title}
          </h1>

          {/* Description */}
          <p className="text-lg text-white/90 leading-relaxed max-w-sm mx-auto mb-8 px-4">
            {currentScreenData.description}
          </p>

          {/* Wallet connect button for last screen */}
          {currentScreenData.showConnectButton && (
            <div className="max-w-sm mx-auto">
              <WalletConnectButton 
                onSuccess={handleWalletSuccess}
                className="bg-white/95 backdrop-blur-sm border-white/20"
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation - Fixed at bottom */}
      <div className="relative z-10 p-6 flex-shrink-0">
        <div className="flex justify-between items-center">
          {/* Back button */}
          <Button
            onClick={prevScreen}
            disabled={currentScreen === 0}
            variant="ghost"
            size="sm"
            className={`text-white hover:bg-white/20 transition-opacity duration-300 ${
              currentScreen === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          {/* Skip button for non-final screens */}
          {!currentScreenData.showConnectButton && (
            <Button
              onClick={() => setCurrentScreen(screens.length - 1)}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/20"
            >
              Skip
            </Button>
          )}

          {/* Next button */}
          {!currentScreenData.showConnectButton && (
            <Button
              onClick={nextScreen}
              size="sm"
              className="bg-white/90 hover:bg-white text-blue-600 hover:text-blue-700 px-6"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}