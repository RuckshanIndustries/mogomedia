"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth, type UserRole } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function Navbar() {
  const { user, userProfile, signOut } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const role: UserRole | null = userProfile?.role || null

  const navItems = [
    { name: "Home", href: "/", public: true },
    { name: "Courses", href: "/courses", public: true },
    { name: "Dashboard", href: role ? `/${role}` : "/login", public: false },
    { name: "My Courses", href: "/student/courses", roles: ["student"] },
    { name: "Assignments", href: "/student/assignments", roles: ["student"] },
    { name: "My Courses", href: "/lecturer/courses", roles: ["lecturer"] },
    { name: "Manage Students", href: "/lecturer/students", roles: ["lecturer"] },
    { name: "Users", href: "/admin/users", roles: ["admin"] },
    { name: "All Courses", href: "/admin/courses", roles: ["admin"] },
  ]

  const filteredNavItems = navItems.filter((item) => {
    if (item.public) return true
    if (!user) return false
    if (!item.roles) return true
    return item.roles.includes(role as UserRole)
  })

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">Mogo</span>
            <span className="text-xl font-bold">Media Academy</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground",
              )}
            >
              {item.name}
            </Link>
          ))}

          {user ? (
            <Button variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="default" asChild>
                <Link href="/admin-login">Admin Login</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-4 mt-8">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary p-2",
                    pathname === item.href ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {item.name}
                </Link>
              ))}

              {user ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    signOut()
                    setIsOpen(false)
                  }}
                >
                  Sign Out
                </Button>
              ) : (
                <div className="flex flex-col gap-4 mt-4">
                  <Button variant="outline" asChild onClick={() => setIsOpen(false)}>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button variant="default" asChild onClick={() => setIsOpen(false)}>
                    <Link href="/admin-login">Admin Login</Link>
                  </Button>
                </div>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
