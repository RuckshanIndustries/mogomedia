"use client"

import type React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { MainNav } from "@/components/main-nav"
import { SidebarInset } from "@/components/ui/sidebar"
import { RoleGuard } from "@/components/role-guard"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userData, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={["admin", "lecturer", "student"]}>
      <div className="flex min-h-screen">
        <AppSidebar role={userData?.role} userName={userData?.displayName || "User"} />
        <SidebarInset className="flex flex-col">
          <div className="flex min-h-screen flex-col">
            <MainNav userName={userData?.displayName || "User"} />
            <main className="flex-1 p-4 md:p-6 container mx-auto max-w-7xl">{children}</main>
          </div>
        </SidebarInset>
      </div>
    </RoleGuard>
  )
}
