"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle, BookOpen, FileText, Users } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import {
  useLecturerCourses,
  useLecturerStudentCount,
  useLecturerPendingAssignments,
  useRecentSubmissions,
} from "@/lib/firebase-hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LecturerDashboard() {
  const { user } = useAuth()
  const lecturerId = user?.uid || ""

  const { courses, loading: coursesLoading, error: coursesError } = useLecturerCourses(lecturerId)
  const { count: studentCount, loading: studentsLoading, error: studentsError } = useLecturerStudentCount(lecturerId)
  const {
    count: pendingAssignments,
    loading: assignmentsLoading,
    error: assignmentsError,
  } = useLecturerPendingAssignments(lecturerId)
  const {
    submissions: recentSubmissions,
    loading: submissionsLoading,
    error: submissionsError,
  } = useRecentSubmissions(lecturerId, 3)

  // Check if there are any permission errors
  const hasPermissionError = coursesError || studentsError || assignmentsError || submissionsError

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Invalid date"
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error formatting time:", error)
      return ""
    }
  }

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lecturer Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's an overview of your courses and student activities.
          </p>
        </div>

        {hasPermissionError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Permission Error</AlertTitle>
            <AlertDescription>
              There was an error accessing some data. This may be due to insufficient permissions. Please contact an
              administrator for assistance.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Assigned Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {coursesLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : coursesError ? (
                <div className="text-sm text-muted-foreground">Unable to load courses</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{courses.length}</div>
                  <p className="text-xs text-muted-foreground">Active courses you're teaching</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : studentsError ? (
                <div className="text-sm text-muted-foreground">Unable to load student count</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{studentCount}</div>
                  <p className="text-xs text-muted-foreground">Students enrolled in your courses</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {assignmentsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : assignmentsError ? (
                <div className="text-sm text-muted-foreground">Unable to load pending reviews</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{pendingAssignments}</div>
                  <p className="text-xs text-muted-foreground">Assignments waiting for your review</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Your Courses</CardTitle>
              <CardDescription>Courses you're currently teaching</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {coursesLoading ? (
                  <>
                    {[1, 2].map((i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <div className="grid grid-cols-2 gap-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : coursesError ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Unable to load courses</p>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No courses assigned yet</p>
                  </div>
                ) : (
                  courses.map((course) => (
                    <div key={course.id} className="space-y-2">
                      <div className="font-medium">{course.title}</div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>Students: {course.enrolledCount || 0}</div>
                        <div>Pending Reviews: {course.pendingAssignments || 0}</div>
                      </div>
                    </div>
                  ))
                )}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/lecturer/courses">Manage Courses</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Latest assignments submitted by students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {submissionsLoading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-60" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    ))}
                  </>
                ) : submissionsError ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Unable to load recent submissions</p>
                  </div>
                ) : recentSubmissions.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No recent submissions</p>
                  </div>
                ) : (
                  recentSubmissions.map((submission) => (
                    <div key={submission.id} className="space-y-1">
                      <div className="font-medium">{submission.title || "Untitled Submission"}</div>
                      <div className="text-sm text-muted-foreground">
                        {submission.courseName || "Unknown Course"} • {submission.studentName || "Unknown Student"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Submitted on {submission.submittedAt ? formatDate(submission.submittedAt) : "Unknown date"}
                        {submission.submittedAt ? ` at ${formatTime(submission.submittedAt)}` : ""}
                      </div>
                    </div>
                  ))
                )}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/lecturer/assignments">View All Submissions</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
