"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth, type UserData } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft } from "lucide-react"
import { UserRoleManager } from "@/components/user-role-manager"
import { hasRequiredRole } from "@/lib/utils/role-checker"
import { NewUserForm } from "@/components/new-user-form"

export default function UserDetailPage() {
  const { userId } = useParams()
  const router = useRouter()
  const { userData: currentUser } = useAuth()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      if (!currentUser || !hasRequiredRole(currentUser.role, ["admin"])) {
        router.push("/dashboard")
        return
      }

      // Special case for the "new" route - don't try to fetch a user
      if (userId === "new") {
        setLoading(false)
        return
      }

      try {
        const userDocRef = doc(db, "users", userId as string)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const data = userDoc.data()
          setUser({
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            lastLogin: data.lastLogin?.toDate ? data.lastLogin.toDate() : data.lastLogin,
          } as UserData)
        } else {
          router.push("/admin/users")
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        // Show a more user-friendly error message
        alert("Error fetching user: " + (error.message || "Unknown error"))
        router.push("/admin/users")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId, router, currentUser])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg">Loading user details...</p>
        </div>
      </div>
    )
  }

  if (userId === "new") {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
            <CardDescription>Add a new user to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <NewUserForm />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const formatDate = (date: any) => {
    if (!date) return "N/A"

    if (date instanceof Date) {
      return date.toLocaleString()
    }

    return "N/A"
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Users
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>View and manage user information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {user.profileImageUrl ? (
                  <AvatarImage src={user.profileImageUrl || "/placeholder.svg"} alt={user.displayName || ""} />
                ) : null}
                <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                  {user.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{user.displayName}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="mt-1">
                  <Badge
                    variant={user.role === "admin" ? "destructive" : user.role === "lecturer" ? "outline" : "secondary"}
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium">User ID</h4>
                <p className="text-sm text-muted-foreground">{user.uid}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Created At</h4>
                <p className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Last Login</h4>
                <p className="text-sm text-muted-foreground">{formatDate(user.lastLogin)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <UserRoleManager
          userId={user.uid}
          currentRole={user.role}
          userName={user.displayName || user.email || "User"}
        />
      </div>
    </div>
  )
}
