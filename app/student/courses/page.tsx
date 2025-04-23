"use client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useStudentEnrolledCourses } from "@/lib/firebase-hooks"

export default function StudentCoursesPage() {
  const { user } = useAuth()
  const studentId = user?.uid || ""
  const { courses: enrolledCourses, loading } = useStudentEnrolledCourses(studentId)

  return (
    <DashboardLayout role="student">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground mt-2">Manage and track your enrolled courses</p>
        </div>

        <Tabs defaultValue="in-progress" className="space-y-6">
          <TabsList>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All Courses</TabsTrigger>
          </TabsList>

          <TabsContent value="in-progress" className="space-y-6">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="flex flex-col">
                    <CardHeader>
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="flex-1">
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-4 w-3/4" />
                      <div className="mt-4">
                        <Skeleton className="h-2 w-full mb-2" />
                        <div className="flex justify-between">
                          <Skeleton className="h-3 w-10" />
                          <Skeleton className="h-3 w-10" />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : enrolledCourses.filter((course) => course.progress > 0 && course.progress < 100).length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No courses in progress</h3>
                <p className="text-muted-foreground mt-1">Enroll in a course to get started</p>
                <Button className="mt-4" asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses
                  .filter((course) => course.progress > 0 && course.progress < 100)
                  .map((course) => (
                    <Card key={course.id} className="flex flex-col">
                      <CardHeader>
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription>{course.category}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span className="font-medium">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              {course.completedLessons}/{course.totalLessons} lessons
                            </span>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {course.duration}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" asChild>
                          <Link href={`/student/courses/${course.id}`}>Continue Learning</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2].map((i) => (
                  <Card key={i} className="flex flex-col">
                    <CardHeader>
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="flex-1">
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : enrolledCourses.filter((course) => course.progress === 100).length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No completed courses</h3>
                <p className="text-muted-foreground mt-1">Complete your in-progress courses to see them here</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses
                  .filter((course) => course.progress === 100)
                  .map((course) => (
                    <Card key={course.id} className="flex flex-col">
                      <CardHeader>
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription>{course.category}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                        <div className="rounded-md bg-primary/10 p-3 text-center">
                          <p className="text-sm font-medium text-primary">Course Completed</p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/student/courses/${course.id}`}>Review Course</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="flex flex-col">
                    <CardHeader>
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="flex-1">
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No enrolled courses</h3>
                <p className="text-muted-foreground mt-1">Enroll in a course to get started</p>
                <Button className="mt-4" asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses.map((course) => (
                  <Card key={course.id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>{course.category}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {course.completedLessons}/{course.totalLessons} lessons
                          </span>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {course.duration}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" variant={course.progress === 0 ? "default" : "outline"} asChild>
                        <Link href={`/student/courses/${course.id}`}>
                          {course.progress === 0
                            ? "Start Course"
                            : course.progress === 100
                              ? "Review Course"
                              : "Continue Learning"}
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
