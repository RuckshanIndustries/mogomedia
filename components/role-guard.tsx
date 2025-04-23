"use client"

import { type ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type UserRole } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: UserRole[]
  redirectTo?: string
}

export function RoleGuard({ children, allowedRoles, redirectTo = "/dashboard" }: RoleGuardProps) {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      } else if (userData && !allowedRoles.includes(userData.role)) {
        router.push(redirectTo)
      }
    }
  }, [user, userData, loading, router, allowedRoles, redirectTo])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !userData) {
    return null // Will redirect in useEffect
  }

  if (!allowedRoles.includes(userData.role)) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}
