"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, FileText, Loader2, Lock, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { enrollUserInCourse, getEnrollmentByCourseAndUser } from "@/lib/services/enrollment-service"

interface Course {
  id: string
  title: string
  description: string
  coverImage: string
  category: string
  lecturerId: string
  lecturerName?: string
  isPublic: boolean
}

interface Lesson {
  id: string
  courseId: string
  title: string
  description: string
  contentType: string
  order: number
}

export default function CoursePage() {
  const params = useParams()
  const courseId = params.courseId as string
  const router = useRouter()
  const { user, userData } = useAuth()
  const { toast } = useToast()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Fetch course data
        const courseDoc = await getDoc(doc(db, "courses", courseId))

        if (!courseDoc.exists()) {
          toast({
            title: "Error",
            description: "Course not found.",
            variant: "destructive",
          })
          router.push("/courses")
          return
        }

        const courseData = { id: courseDoc.id, ...courseDoc.data() } as Course

        // If course is not public and user is not authenticated, redirect
        if (!courseData.isPublic && !user) {
          toast({
            title: "Authentication required",
            description: "Please log in to view this course.",
            variant: "destructive",
          })
          router.push(`/login?redirect=${encodeURIComponent(`/courses/${courseId}`)}`)
          return
        }

        // Fetch lecturer name
        if (courseData.lecturerId) {
          const lecturerDoc = await getDoc(doc(db, "users", courseData.lecturerId))
          if (lecturerDoc.exists()) {
            courseData.lecturerName = lecturerDoc.data().displayName || "Unknown Instructor"
          }
        }

        setCourse(courseData)

        // Fetch lessons (limited for non-enrolled users)
        const lessonsQuery = query(
          collection(db, "lessons"),
          where("courseId", "==", courseId),
          ...(user && isEnrolled ? [] : [limit(3)]), // Limit to 3 lessons for non-enrolled users
          where("order", ">=", 0),
        )

        const lessonsSnapshot = await getDocs(lessonsQuery)
        const lessonsData = lessonsSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as Lesson)
          .sort((a, b) => a.order - b.order)

        setLessons(lessonsData)

        // Check if user is enrolled
        if (user) {
          const enrollment = await getEnrollmentByCourseAndUser(courseId, user.uid)
          setIsEnrolled(!!enrollment)
        }
      } catch (error) {
        console.error("Error fetching course:", error)
        toast({
          title: "Error",
          description: "Failed to load course data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId, user, router, toast, isEnrolled])

  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to enroll in this course.",
        variant: "destructive",
      })
      router.push(`/login?redirect=${encodeURIComponent(`/courses/${courseId}`)}`)
      return
    }

    setEnrolling(true)

    try {
      await enrollUserInCourse(user.uid, courseId)
      setIsEnrolled(true)
      toast({
        title: "Success",
        description: "You have successfully enrolled in this course.",
      })
    } catch (error) {
      console.error("Error enrolling in course:", error)
      toast({
        title: "Error",
        description: "Failed to enroll in course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/courses" className="hover:text-primary">
              Courses
            </Link>
            <span>/</span>
            <span>{course.title}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
          <p className="text-muted-foreground">{course.description}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <div className="relative aspect-video w-full">
                <Image
                  src={course.coverImage || "/placeholder.svg?height=720&width=1280"}
                  alt="Course cover"
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
                <CardDescription>
                  {isEnrolled ? "Continue your learning journey" : "Preview this course"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>{course.description}</p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">12 hours of content</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{lessons.length} lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">5 quizzes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Instructor: {course.lecturerName || "Unknown Instructor"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{isEnrolled ? "You're Enrolled" : "Enroll Now"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isEnrolled ? (
                    <Button asChild className="w-full">
                      <Link href={`/courses/${courseId}/lessons/1`}>Continue Learning</Link>
                    </Button>
                  ) : (
                    <Button onClick={handleEnroll} disabled={enrolling || !user} className="w-full">
                      {enrolling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        "Enroll in Course"
                      )}
                    </Button>
                  )}
                  {!user && (
                    <p className="text-center text-sm text-muted-foreground">
                      <Link
                        href={`/login?redirect=${encodeURIComponent(`/courses/${courseId}`)}`}
                        className="text-primary hover:underline"
                      >
                        Sign in
                      </Link>{" "}
                      to enroll in this course
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Understand core concepts and principles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Apply techniques to real-world problems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Build practical projects for your portfolio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Master advanced skills and techniques</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="lessons">
          <TabsList>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          </TabsList>
          <TabsContent value="lessons" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {lessons.map((lesson, index) => (
                    <div key={lesson.id} className="flex items-center gap-4 border-b pb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {index + 1}
                      </div>
                      <div className="flex flex-1 items-center justify-between">
                        <div>
                          <div className="font-medium">{lesson.title}</div>
                          <div className="text-sm text-muted-foreground">{lesson.description}</div>
                        </div>
                        {isEnrolled ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/courses/${courseId}/lessons/${lesson.id}`}>View</Link>
                          </Button>
                        ) : index < 3 ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/courses/${courseId}/lessons/${lesson.id}`}>Preview</Link>
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Lock className="h-4 w-4" />
                            <span>Enroll to access</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {!isEnrolled && lessons.length > 3 && (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
                      <Lock className="h-8 w-8 text-muted-foreground" />
                      <h3 className="text-lg font-medium">Enroll to Access All Lessons</h3>
                      <p className="text-sm text-muted-foreground">
                        Unlock all {lessons.length} lessons by enrolling in this course.
                      </p>
                      <Button onClick={handleEnroll} className="mt-2">
                        Enroll Now
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                {isEnrolled ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 border-b pb-4">
                      <div className="flex-1">
                        <div className="font-medium">Assignment 1: Project Setup</div>
                        <div className="text-sm text-muted-foreground">Set up your development environment</div>
                        <div className="mt-1 text-xs text-muted-foreground">Due date: In 7 days</div>
                      </div>
                      <Button size="sm">View Assignment</Button>
                    </div>
                    <div className="flex items-center gap-4 border-b pb-4">
                      <div className="flex-1">
                        <div className="font-medium">Assignment 2: Implementation</div>
                        <div className="text-sm text-muted-foreground">Implement the core functionality</div>
                        <div className="mt-1 text-xs text-muted-foreground">Due date: In 14 days</div>
                      </div>
                      <Button size="sm">View Assignment</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Enroll to Access Assignments</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete assignments and receive feedback by enrolling in this course.
                    </p>
                    <Button onClick={handleEnroll} className="mt-2">
                      Enroll Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="quizzes" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                {isEnrolled ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 border-b pb-4">
                      <div className="flex-1">
                        <div className="font-medium">Quiz 1: Fundamentals</div>
                        <div className="text-sm text-muted-foreground">Test your knowledge of the core concepts</div>
                      </div>
                      <Button size="sm">Take Quiz</Button>
                    </div>
                    <div className="flex items-center gap-4 border-b pb-4">
                      <div className="flex-1">
                        <div className="font-medium">Quiz 2: Advanced Topics</div>
                        <div className="text-sm text-muted-foreground">
                          Test your understanding of advanced concepts
                        </div>
                      </div>
                      <Button size="sm">Take Quiz</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Enroll to Access Quizzes</h3>
                    <p className="text-sm text-muted-foreground">
                      Test your knowledge and track your progress by enrolling in this course.
                    </p>
                    <Button onClick={handleEnroll} className="mt-2">
                      Enroll Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
