"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth, type UserRole } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export function useRoleGuard(allowedRoles: UserRole[]) {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User is not logged in, redirect to login page
        toast({
          title: "Authentication required",
          description: "Please log in to access this page.",
          variant: "destructive",
        })
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      } else if (userData && !allowedRoles.includes(userData.role)) {
        // User doesn't have the required role
        toast({
          title: "Access denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        })
        router.push("/dashboard")
        setIsAuthorized(false)
      } else if (userData) {
        setIsAuthorized(true)
      }
    }
  }, [user, userData, loading, router, pathname, allowedRoles, toast])

  return { user, userData, loading, isAuthorized }
}
