"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Calendar, Clock, GraduationCap, ListChecks, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getEnrollmentsByUser } from "@/lib/services/enrollment-service"
import { getCourseById } from "@/lib/services/course-service"
import { CourseCard } from "@/components/course-card"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/firebase"
import { toast } from "@/components/ui/use-toast"
import { EmptyDashboardState } from "@/components/empty-dashboard-state"

export default function DashboardPage() {
  const { user, userData } = useAuth()
  const [loading, setLoading] = useState(true)
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalCourses: 0,
    inProgressCourses: 0,
    completedCourses: 0,
    totalAssignments: 0,
    pendingAssignments: 0,
    completedAssignments: 0,
    totalQuizzes: 0,
    averageScore: 0,
    learningTime: 0,
  })

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) return

      try {
        setLoading(true)

        // First check if the user document exists in Firestore
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (!userDoc.exists()) {
          console.error("User document not found in Firestore")
          toast({
            title: "Error",
            description: "User profile not found. Please contact an administrator.",
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        // Now fetch enrollments with proper error handling
        try {
          const enrollments = await getEnrollmentsByUser(user.uid)

          // Fetch course details for each enrollment
          const coursesWithDetails = await Promise.all(
            enrollments.map(async (enrollment) => {
              try {
                const course = await getCourseById(enrollment.courseId)
                return {
                  ...course,
                  progress: enrollment.progress,
                  completedLessons: enrollment.completedLessons,
                  completedQuizzes: enrollment.completedQuizzes,
                  completedAssignments: enrollment.completedAssignments,
                }
              } catch (error) {
                console.error(`Error fetching course ${enrollment.courseId}:`, error)
                return null
              }
            }),
          )

          const validCourses = coursesWithDetails.filter(Boolean)
          setEnrolledCourses(validCourses)

          // Calculate stats
          const inProgress = validCourses.filter((course) => course.progress < 100).length
          const completed = validCourses.filter((course) => course.progress === 100).length

          // For demo purposes, we'll set some placeholder stats
          setStats({
            totalCourses: validCourses.length,
            inProgressCourses: inProgress,
            completedCourses: completed,
            totalAssignments: 7,
            pendingAssignments: 2,
            completedAssignments: 5,
            totalQuizzes: 12,
            averageScore: 85,
            learningTime: 24,
          })
        } catch (error) {
          console.error("Error fetching enrollments:", error)
          // Show a more user-friendly error message
          toast({
            title: "Access Error",
            description: "Unable to load your courses. This may be due to permission settings.",
            variant: "destructive",
          })

          // Set empty enrollments instead of failing completely
          setEnrolledCourses([])
        }
      } catch (error) {
        console.error("Error in dashboard setup:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEnrollments()
  }, [user])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {userData?.displayName || "Student"}! Here&apos;s an overview of your learning progress.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.inProgressCourses} in progress, {stats.completedCourses} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingAssignments} pending, {stats.completedAssignments} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quizzes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
            <p className="text-xs text-muted-foreground">Average score: {stats.averageScore}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Learning Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.learningTime}h</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="courses">
        <TabsList>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>
        <TabsContent value="courses" className="space-y-4">
          {enrolledCourses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  coverImage={course.coverImage || "/placeholder.svg?height=400&width=600"}
                  progress={course.progress}
                  lessonCount={12} // This would come from the course data
                  quizCount={5}
                  assignmentCount={3}
                  isCompleted={course.progress === 100}
                />
              ))}
            </div>
          ) : (
            <EmptyDashboardState />
          )}
          {enrolledCourses.length > 0 && (
            <div className="flex justify-center">
              <Link href="/courses" className="text-sm font-medium text-primary hover:underline">
                View all courses
              </Link>
            </div>
          )}
        </TabsContent>
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Your upcoming assignments and quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <ListChecks className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">JavaScript Assignment #3</p>
                      <div className="flex items-center gap-1 text-xs text-red-500">
                        <Calendar className="h-3 w-3" />
                        <span>Due in 2 days</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Web Development Fundamentals</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">React Components Quiz</p>
                      <div className="flex items-center gap-1 text-xs text-amber-500">
                        <Calendar className="h-3 w-3" />
                        <span>Due in 5 days</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">React Fundamentals</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <ListChecks className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Final Project Submission</p>
                      <div className="flex items-center gap-1 text-xs text-green-500">
                        <Calendar className="h-3 w-3" />
                        <span>Due in 14 days</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Web Development Fundamentals</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
