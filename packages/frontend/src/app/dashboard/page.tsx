"use client"

import { DashboardHome } from "@/components/dashboard/DashboardHome"
import { AuthGuard } from "@/components/auth/AuthGuard"
// import useAuthStore from "@/stores/auth-store"
// import { useAuth } from "@/hooks/use-auth"

export default function DashboardPage() {
  // const {user} = useAuth()
  // console.log(user)
  return (
    <AuthGuard redirectTo="/" requireAuth={true}>
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <DashboardHome />
      </div>
    </AuthGuard>
  )
}