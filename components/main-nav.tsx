"use client"

import { Bell, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"

interface MainNavProps {
  userName?: string
}

export function MainNav({ userName = "User" }: MainNavProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const { userData, logout } = useAuth()

  const displayName = userName || userData?.displayName || "User"
  const userRole = userData?.role || "student"

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex flex-1 items-center justify-end gap-4 md:gap-6">
        <div className="flex items-center gap-2">
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  3
                </span>
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between border-b px-4 py-2">
                <div className="font-medium">Notifications</div>
                <Button variant="ghost" size="sm" className="h-auto text-xs">
                  Mark all as read
                </Button>
              </div>
              <div className="flex flex-col divide-y">
                <DropdownMenuItem className="flex cursor-pointer flex-col items-start gap-1 p-4">
                  <div className="text-sm font-medium">New assignment posted</div>
                  <div className="text-xs text-muted-foreground">Web Development - Assignment 3 is now available</div>
                  <div className="mt-1 text-xs text-muted-foreground">2 hours ago</div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex cursor-pointer flex-col items-start gap-1 p-4">
                  <div className="text-sm font-medium">Quiz results available</div>
                  <div className="text-xs text-muted-foreground">
                    Your results for JavaScript Basics Quiz are now available
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Yesterday</div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex cursor-pointer flex-col items-start gap-1 p-4">
                  <div className="text-sm font-medium">New course content</div>
                  <div className="text-xs text-muted-foreground">New lessons added to React Fundamentals course</div>
                  <div className="mt-1 text-xs text-muted-foreground">2 days ago</div>
                </DropdownMenuItem>
              </div>
              <div className="border-t p-2">
                <Button variant="ghost" size="sm" className="w-full justify-center" asChild>
                  <Link href="/notifications">View all notifications</Link>
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt={displayName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start md:flex">
                  <span className="text-sm font-medium">{displayName}</span>
                  <Badge
                    variant={userRole === "admin" ? "destructive" : userRole === "lecturer" ? "outline" : "secondary"}
                    className="text-[10px] py-0 h-4"
                  >
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </Badge>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              {userRole === "admin" && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard">Admin Dashboard</Link>
                </DropdownMenuItem>
              )}
              {userRole === "lecturer" && (
                <DropdownMenuItem asChild>
                  <Link href="/lecturer/dashboard">Lecturer Dashboard</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
