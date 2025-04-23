"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, GraduationCap } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useStudentEnrolledCourses, useStudentAssignments } from "@/lib/firebase-hooks"
import { Skeleton } from "@/components/ui/skeleton"

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

export default function StudentDashboard() {
  const { user } = useAuth()
  const studentId = user?.uid || ""

  const { courses: enrolledCourses, loading: coursesLoading } = useStudentEnrolledCourses(studentId)
  const { assignments, loading: assignmentsLoading } = useStudentAssignments(studentId)

  // Filter for upcoming assignments (due in the future)
  const upcomingAssignments = assignments
    .filter((assignment) => {
      if (assignment.status !== "pending") return false
      const dueDate = new Date(assignment.dueDate)
      return dueDate > new Date()
    })
    .slice(0, 2) // Limit to 2 for display

  // Calculate overall progress
  const overallProgress =
    enrolledCourses.length > 0
      ? Math.round(enrolledCourses.reduce((sum, course) => sum + (course.progress || 0), 0) / enrolledCourses.length)
      : 0

  return (
    <DashboardLayout role="student">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here's an overview of your learning progress.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {coursesLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{enrolledCourses.length}</div>
                  <p className="text-xs text-muted-foreground">Active courses in your learning journey</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {assignmentsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{upcomingAssignments.length}</div>
                  <p className="text-xs text-muted-foreground">Assignments due in the next 7 days</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {coursesLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{overallProgress}%</div>
                  <p className="text-xs text-muted-foreground">Average completion across all courses</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Your Courses</CardTitle>
              <CardDescription>Track your progress in enrolled courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {coursesLoading ? (
                  <>
                    {[1, 2].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-4 w-10" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))}
                  </>
                ) : enrolledCourses.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">You haven't enrolled in any courses yet</p>
                    <Button className="mt-4" asChild>
                      <Link href="/courses">Browse Courses</Link>
                    </Button>
                  </div>
                ) : (
                  enrolledCourses.slice(0, 2).map((course) => (
                    <div key={course.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{course.title}</div>
                        <div className="text-sm text-muted-foreground">{course.progress}%</div>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                      <div className="text-sm text-muted-foreground">
                        Next lesson: {course.nextLesson || "Not started yet"}
                      </div>
                    </div>
                  ))
                )}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/student/courses">View All Courses</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Upcoming Assignments</CardTitle>
              <CardDescription>Assignments due in the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {assignmentsLoading ? (
                  <>
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-start justify-between space-y-2">
                        <div className="space-y-1">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </>
                ) : upcomingAssignments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No upcoming assignments</p>
                ) : (
                  upcomingAssignments.map((assignment) => {
                    let formattedDate = "No due date"
                    try {
                      if (assignment.dueDate) {
                        const dueDate = new Date(assignment.dueDate)
                        if (!isNaN(dueDate.getTime())) {
                          formattedDate = dueDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        }
                      }
                    } catch (error) {
                      console.error("Error formatting assignment date:", error)
                    }

                    return (
                      <div key={assignment.id} className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{assignment.title || "Untitled Assignment"}</div>
                          <div className="text-sm text-muted-foreground">{assignment.course || "Unknown Course"}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">Due: {formattedDate}</div>
                      </div>
                    )
                  })
                )}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/student/assignments">View All Assignments</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
