'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface OnboardingContextType {
  hasCompletedOnboarding: boolean
  completeOnboarding: () => void
  resetOnboarding: () => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tracceaqua-onboarding-completed') === 'true'
    }
    return false
  })

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true)
    localStorage.setItem('tracceaqua-onboarding-completed', 'true')
  }

  const resetOnboarding = () => {
    setHasCompletedOnboarding(false)
    localStorage.removeItem('tracceaqua-onboarding-completed')
  }

  return (
    <OnboardingContext.Provider value={{
      hasCompletedOnboarding,
      completeOnboarding,
      resetOnboarding,
    }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}