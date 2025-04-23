"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, Loader2, Upload, CheckSquare } from "lucide-react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LecturerDashboardPage() {
  const { user, userData } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalLessons: 0,
    totalAssignments: 0,
    totalQuizzes: 0,
    pendingSubmissions: 0,
  })
  const [myCourses, setMyCourses] = useState<any[]>([])

  useEffect(() => {
    const fetchLecturerData = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Fetch courses assigned to this lecturer
        const coursesQuery = query(collection(db, "courses"), where("lecturerId", "==", user.uid))
        const coursesSnapshot = await getDocs(coursesQuery)
        const courses = coursesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setMyCourses(courses)

        // Get course IDs for further queries
        const courseIds = courses.map((course) => course.id)

        // If no courses, set default stats and return
        if (courseIds.length === 0) {
          setStats({
            totalCourses: 0,
            totalLessons: 0,
            totalAssignments: 0,
            totalQuizzes: 0,
            pendingSubmissions: 0,
          })
          setLoading(false)
          return
        }

        // Fetch lessons for these courses
        const lessonsQuery = query(collection(db, "lessons"), where("courseId", "in", courseIds))
        const lessonsSnapshot = await getDocs(lessonsQuery)

        // Fetch assignments for these courses
        const assignmentsQuery = query(collection(db, "assignments"), where("courseId", "in", courseIds))
        const assignmentsSnapshot = await getDocs(assignmentsQuery)

        // Fetch quizzes for these courses
        const quizzesQuery = query(collection(db, "quizzes"), where("courseId", "in", courseIds))
        const quizzesSnapshot = await getDocs(quizzesQuery)

        // Fetch pending submissions
        const submissionsQuery = query(
          collection(db, "assignmentSubmissions"),
          where("courseId", "in", courseIds),
          where("graded", "==", false),
        )
        const submissionsSnapshot = await getDocs(submissionsQuery)

        // Set statistics
        setStats({
          totalCourses: courses.length,
          totalLessons: lessonsSnapshot.docs.length,
          totalAssignments: assignmentsSnapshot.docs.length,
          totalQuizzes: quizzesSnapshot.docs.length,
          pendingSubmissions: submissionsSnapshot.docs.length,
        })

        setLoading(false)
      } catch (error) {
        console.error("Error fetching lecturer data:", error)
        setLoading(false)
      }
    }

    fetchLecturerData()
  }, [user])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg">Loading lecturer dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Lecturer Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, {userData?.displayName || "Lecturer"}! Here&apos;s an overview of your courses and teaching
          activities.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Courses you are teaching</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lessons</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLessons}</div>
            <p className="text-xs text-muted-foreground">Across all your courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">Created for your courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quizzes</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
            <p className="text-xs text-muted-foreground">Created for your courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
            <p className="text-xs text-muted-foreground">Submissions to grade</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="courses">
        <TabsList>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="uploads">Recent Uploads</TabsTrigger>
        </TabsList>
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>Courses you are currently teaching</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myCourses.map((course) => (
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
                      <Link href={`/lecturer/courses/${course.id}`}>Manage</Link>
                    </Button>
                  </div>
                ))}

                {myCourses.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BookOpen className="h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No courses assigned</h3>
                    <p className="text-sm text-muted-foreground">You don&apos;t have any courses assigned to you yet</p>
                    <Button className="mt-4" asChild>
                      <Link href="/lecturer/courses/new">Request New Course</Link>
                    </Button>
                  </div>
                )}
              </div>

              {myCourses.length > 0 && (
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" asChild>
                    <Link href="/lecturer/courses">View All Courses</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="uploads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Uploads</CardTitle>
              <CardDescription>Content you&apos;ve recently uploaded</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <Upload className="h-16 w-16 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">Upload New Content</h3>
              <p className="text-center text-sm text-muted-foreground">
                Upload lessons, assignments, or quizzes for your courses
              </p>
              <Button className="mt-4" asChild>
                <Link href="/lecturer/uploads">Upload Content</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
