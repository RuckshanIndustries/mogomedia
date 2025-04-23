"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/toast"
import { useAuth } from "@/lib/auth-context"
import { enrollInCourse } from "@/lib/course-service"
import { BookOpen, Clock, FileText, Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Types
interface Lesson {
  id: string
  title: string
  duration: string
}

interface Assignment {
  id: string
  title: string
  dueDate: string
}

interface Course {
  id: string
  title: string
  category: string
  description: string
  lessons: Lesson[]
  assignments: Assignment[]
  instructor: string
  duration: string
  students: number
  level: string
  prerequisites: string
}

// Mock course data (should ideally come from an API)
const coursesData: Record<string, Course> = {
  "1": {
    id: "1",
    title: "Introduction to Web Development",
    category: "Web Development",
    description:
      "Learn the fundamentals of HTML, CSS, and JavaScript to build your first website.",
    lessons: [
      { id: "l1", title: "HTML Basics", duration: "45 min" },
      { id: "l2", title: "CSS Styling", duration: "60 min" },
      { id: "l3", title: "CSS Flexbox and Grid", duration: "75 min" },
      { id: "l4", title: "JavaScript Fundamentals", duration: "90 min" },
      { id: "l5", title: "DOM Manipulation", duration: "60 min" },
    ],
    assignments: [
      { id: "a1", title: "Create a Personal Profile Page", dueDate: "Week 2" },
      { id: "a2", title: "Build a Responsive Landing Page", dueDate: "Week 4" },
      { id: "a3", title: "Interactive Form Validation", dueDate: "Week 6" },
    ],
    instructor: "Dr. Sarah Johnson",
    duration: "6 weeks",
    students: 24,
    level: "Beginner",
    prerequisites: "None",
  },
  // ... other courses
}

export default function CourseDetailPage() {
  const { id } = useParams()
  const courseId = Array.isArray(id) ? id[0] : id
  const { user, userProfile, loading } = useAuth()
  const { toast } = useToast()
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)

  const course = coursesData[courseId as keyof typeof coursesData]

  useEffect(() => {
    if (userProfile?.enrolledCourses) {
      setIsEnrolled(userProfile.enrolledCourses.includes(courseId as string))
    }
  }, [userProfile, courseId])

  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to enroll in this course.",
        variant: "destructive",
      })
      return
    }

    if (userProfile?.role !== "student") {
      toast({
        title: "Student Access Only",
        description: "Only students can enroll in courses.",
        variant: "destructive",
      })
      return
    }

    setIsEnrolling(true)

    try {
      await enrollInCourse(user.uid, courseId as string)
      setIsEnrolled(true)
      toast({
        title: "Enrollment Successful",
        description: `You have successfully enrolled in ${course.title}.`,
      })
    } catch (error) {
      console.error("Error enrolling in course:", error)
      toast({
        title: "Enrollment Failed",
        description: "There was an error enrolling in this course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEnrolling(false)
    }
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Course Not Found</h1>
            <p className="text-muted-foreground mt-2">The course you're looking for doesn't exist.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <p className="text-muted-foreground">{course.category}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{course.description}</p>
                </CardContent>
              </Card>

              <Tabs defaultValue="syllabus">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
                  <TabsTrigger value="assignments">Assignments</TabsTrigger>
                  <TabsTrigger value="instructor">Instructor</TabsTrigger>
                </TabsList>
                <TabsContent value="syllabus" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Syllabus</CardTitle>
                      <CardDescription>Lessons and topics covered in this course</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {course.lessons.map((lesson, index) => (
                          <div key={lesson.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                              {index + 1}
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="font-medium">{lesson.title}</p>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="mr-1 h-4 w-4" />
                                {lesson.duration}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="assignments" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Assignments</CardTitle>
                      <CardDescription>Projects and tasks to complete during the course</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {course.assignments.map((assignment) => (
                          <div key={assignment.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="font-medium">{assignment.title}</p>
                              <div className="flex items-center text-sm text-muted-foreground">
                                Due: {assignment.dueDate}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="instructor" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>About the Instructor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
                        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                          {course.instructor
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="space-y-2 text-center sm:text-left">
                          <h3 className="font-bold">{course.instructor}</h3>
                          <p className="text-sm text-muted-foreground">
                            Expert instructor with years of experience in {course.category}.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Duration</span>
                      </div>
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Enrolled</span>
                      </div>
                      <span>{course.students} students</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Level</span>
                      </div>
                      <span>{course.level}</span>
                    </div>
                    <div className="pt-2">
                      <h4 className="text-sm font-medium mb-2">Prerequisites</h4>
                      <p className="text-sm text-muted-foreground">{course.prerequisites}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {loading ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-5 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Enrollment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!user ? (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Please log in to enroll in this course.</p>
                        <Button className="w-full" asChild>
                          <a href="/login">Log In</a>
                        </Button>
                      </div>
                    ) : userProfile?.role !== "student" ? (
                      <p className="text-sm text-muted-foreground">Only students can enroll in courses.</p>
                    ) : isEnrolled ? (
                      <div className="space-y-4">
                        <div className="rounded-md bg-primary/10 p-3 text-center">
                          <p className="text-sm font-medium text-primary">You are enrolled in this course</p>
                        </div>
                        <Button className="w-full" asChild>
                          <a href="/student/courses">Go to My Courses</a>
                        </Button>
                      </div>
                    ) : (
                      <Button className="w-full" onClick={handleEnroll} disabled={isEnrolling}>
                        {isEnrolling ? "Enrolling..." : "Enroll Now"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}