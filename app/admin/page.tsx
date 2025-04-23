"use client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, UserPlus } from "lucide-react"
import { useUserCountByRole, useRecentUsers, useCourseCount } from "@/lib/firebase-hooks"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboard() {
  const { counts, loading: countsLoading } = useUserCountByRole()
  const { users: recentUsers, loading: usersLoading } = useRecentUsers(3)
  const { count: totalCourses, loading: coursesLoading } = useCourseCount()

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Invalid date"
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's an overview of the Mogo Media Academy platform.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {countsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{counts.students}</div>
                  <p className="text-xs text-muted-foreground">Students enrolled in the platform</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Lecturers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {countsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{counts.lecturers}</div>
                  <p className="text-xs text-muted-foreground">Lecturers teaching courses</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {coursesLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{totalCourses}</div>
                  <p className="text-xs text-muted-foreground">Active courses on the platform</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">New Users</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {countsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{counts.newUsersThisWeek}</div>
                  <p className="text-xs text-muted-foreground">New users in the last 7 days</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Recently added users to the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {usersLoading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-60" />
                        <div className="flex justify-between">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : recentUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground">No users found</p>
                ) : (
                  recentUsers.map((user) => (
                    <div key={user.id} className="space-y-1">
                      <div className="font-medium">{user.fullName || "Unknown User"}</div>
                      <div className="text-sm text-muted-foreground">{user.email || "No email"}</div>
                      <div className="flex justify-between text-xs">
                        <span className="capitalize text-muted-foreground">Role: {user.role || "Unknown"}</span>
                        <span className="text-muted-foreground">
                          Added on {user.createdAt ? formatDate(user.createdAt) : "Unknown date"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/users">Manage Users</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full" asChild>
                  <Link href="/admin/users/new">Add New User</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/courses/new">Create New Course</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/users">Manage User Roles</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/courses">Manage Courses</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
