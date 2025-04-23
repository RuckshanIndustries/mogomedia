"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Loader2 } from "lucide-react"

interface DashboardLayoutProps {
  children: ReactNode
  role: "student" | "lecturer" | "admin"
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { loading, userProfile } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!userProfile || userProfile.role !== role) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">{children}</main>
    </div>
  )
}
