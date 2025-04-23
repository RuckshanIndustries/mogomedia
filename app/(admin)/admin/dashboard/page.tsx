"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, GraduationCap, FileText, Loader2, BarChart } from "lucide-react"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminDashboardPage() {
  const { userData } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalLecturers: 0,
    totalAdmins: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalEnrollments: 0,
    totalAssignments: 0,
    totalQuizzes: 0,
  })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [recentCourses, setRecentCourses] = useState<any[]>([])

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true)

        // Fetch user statistics
        const usersCollection = collection(db, "users")
        const usersSnapshot = await getDocs(usersCollection)
        const users = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        const students = users.filter((user) => user.role === "student")
        const lecturers = users.filter((user) => user.role === "lecturer")
        const admins = users.filter((user) => user.role === "admin")

        // Fetch course statistics
        const coursesCollection = collection(db, "courses")
        const coursesSnapshot = await getDocs(coursesCollection)
        const courses = coursesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        const activeCourses = courses.filter((course) => course.isActive === true)

        // Fetch enrollment statistics
        const enrollmentsCollection = collection(db, "enrollments")
        const enrollmentsSnapshot = await getDocs(enrollmentsCollection)

        // Fetch assignment statistics
        const assignmentsCollection = collection(db, "assignments")
        const assignmentsSnapshot = await getDocs(assignmentsCollection)

        // Fetch quiz statistics
        const quizzesCollection = collection(db, "quizzes")
        const quizzesSnapshot = await getDocs(quizzesCollection)

        // Set statistics
        setStats({
          totalUsers: users.length,
          totalStudents: students.length,
          totalLecturers: lecturers.length,
          totalAdmins: admins.length,
          totalCourses: courses.length,
          activeCourses: activeCourses.length,
          totalEnrollments: enrollmentsSnapshot.docs.length,
          totalAssignments: assignmentsSnapshot.docs.length,
          totalQuizzes: quizzesSnapshot.docs.length,
        })

        // Fetch recent users
        const recentUsersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(5))
        const recentUsersSnapshot = await getDocs(recentUsersQuery)
        setRecentUsers(recentUsersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))

        // Fetch recent courses
        const recentCoursesQuery = query(collection(db, "courses"), orderBy("createdAt", "desc"), limit(5))
        const recentCoursesSnapshot = await getDocs(recentCoursesQuery)
        setRecentCourses(recentCoursesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))

        setLoading(false)
      } catch (error) {
        console.error("Error fetching admin data:", error)
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, {userData?.displayName || "Admin"}! Here&apos;s an overview of your learning management system.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalStudents} students, {stats.totalLecturers} lecturers, {stats.totalAdmins} admins
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCourses} active courses, {stats.totalEnrollments} enrollments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quizzes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Recent Users</TabsTrigger>
          <TabsTrigger value="courses">Recent Courses</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recently Added Users</CardTitle>
              <CardDescription>The most recently created user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{user.displayName || user.email}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="mt-1">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/users/${user.id}`}>View Details</Link>
                    </Button>
                  </div>
                ))}

                {recentUsers.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No users found</h3>
                    <p className="text-sm text-muted-foreground">Start by adding users to your platform</p>
                    <Button className="mt-4" asChild>
                      <Link href="/admin/users/new">Add User</Link>
                    </Button>
                  </div>
                )}
              </div>

              {recentUsers.length > 0 && (
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" asChild>
                    <Link href="/admin/users">View All Users</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recently Added Courses</CardTitle>
              <CardDescription>The most recently created courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCourses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-sm text-muted-foreground">{course.description}</p>
                      <div className="mt-1">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {course.category || "Uncategorized"}
                        </span>
                        {course.isPublic && (
                          <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            Public
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/courses/${course.id}`}>View Details</Link>
                    </Button>
                  </div>
                ))}

                {recentCourses.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BookOpen className="h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No courses found</h3>
                    <p className="text-sm text-muted-foreground">Start by adding courses to your platform</p>
                    <Button className="mt-4" asChild>
                      <Link href="/admin/courses/new">Add Course</Link>
                    </Button>
                  </div>
                )}
              </div>

              {recentCourses.length > 0 && (
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" asChild>
                    <Link href="/admin/courses">View All Courses</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>System Analytics</CardTitle>
          <CardDescription>Overview of system usage and performance</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <BarChart className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">Analytics Dashboard</h3>
          <p className="text-center text-sm text-muted-foreground">
            Detailed analytics are available in the Analytics section
          </p>
          <Button className="mt-4" asChild>
            <Link href="/admin/analytics">View Analytics</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
