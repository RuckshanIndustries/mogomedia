"use client"

import type React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { MainNav } from "@/components/main-nav"
import { SidebarInset } from "@/components/ui/sidebar"
import { RoleGuard } from "@/components/role-guard"

export default function LecturerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuard allowedRoles={["admin", "lecturer"]} redirectTo="/dashboard">
      <div className="flex min-h-screen">
        <AppSidebar role="lecturer" />
        <SidebarInset className="flex flex-col">
          <div className="flex min-h-screen flex-col">
            <MainNav />
            <main className="flex-1 p-4 md:p-6 container mx-auto max-w-7xl">{children}</main>
          </div>
        </SidebarInset>
      </div>
    </RoleGuard>
  )
}
