"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight, FileText, ListChecks, Loader2, Lock } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { getEnrollmentByCourseAndUser, markLessonAsCompleted } from "@/lib/services/enrollment-service"

interface Lesson {
  id: string
  courseId: string
  title: string
  description: string
  content: string
  contentType: "text" | "video" | "file"
  contentUrl?: string
  order: number
}

export default function LessonPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const lessonId = params.lessonId as string
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [course, setCourse] = useState<any | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null)
  const [prevLesson, setPrevLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) {
          // Check if this is a preview lesson (one of the first 3)
          const lessonsQuery = query(
            collection(db, "lessons"),
            where("courseId", "==", courseId),
            orderBy("order"),
            limit(3),
          )

          const lessonsSnapshot = await getDocs(lessonsQuery)
          const previewLessons = lessonsSnapshot.docs.map((doc) => doc.id)

          if (!previewLessons.includes(lessonId)) {
            toast({
              title: "Authentication required",
              description: "Please log in to view this lesson.",
              variant: "destructive",
            })
            router.push(`/login?redirect=${encodeURIComponent(`/courses/${courseId}/lessons/${lessonId}`)}`)
            return
          }

          setIsPreview(true)
        } else {
          // Check if user is enrolled
          const enrollment = await getEnrollmentByCourseAndUser(courseId, user.uid)

          if (!enrollment) {
            // Check if this is a preview lesson
            const lessonsQuery = query(
              collection(db, "lessons"),
              where("courseId", "==", courseId),
              orderBy("order"),
              limit(3),
            )

            const lessonsSnapshot = await getDocs(lessonsQuery)
            const previewLessons = lessonsSnapshot.docs.map((doc) => doc.id)

            if (!previewLessons.includes(lessonId)) {
              toast({
                title: "Enrollment required",
                description: "Please enroll in this course to access all lessons.",
                variant: "destructive",
              })
              router.push(`/courses/${courseId}`)
              return
            }

            setIsPreview(true)
          } else {
            setIsEnrolled(true)
            setIsCompleted(enrollment.completedLessons.includes(lessonId))
          }
        }

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

        setCourse({ id: courseDoc.id, ...courseDoc.data() })

        // Fetch lesson data
        const lessonDoc = await getDoc(doc(db, "lessons", lessonId))

        if (!lessonDoc.exists()) {
          toast({
            title: "Error",
            description: "Lesson not found.",
            variant: "destructive",
          })
          router.push(`/courses/${courseId}`)
          return
        }

        setLesson({ id: lessonDoc.id, ...lessonDoc.data() } as Lesson)

        // Fetch next and previous lessons
        const allLessonsQuery = query(collection(db, "lessons"), where("courseId", "==", courseId), orderBy("order"))

        const allLessonsSnapshot = await getDocs(allLessonsQuery)
        const allLessons = allLessonsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Lesson)

        const currentIndex = allLessons.findIndex((l) => l.id === lessonId)

        if (currentIndex > 0) {
          setPrevLesson(allLessons[currentIndex - 1])
        }

        if (currentIndex < allLessons.length - 1) {
          setNextLesson(allLessons[currentIndex + 1])
        }
      } catch (error) {
        console.error("Error fetching lesson:", error)
        toast({
          title: "Error",
          description: "Failed to load lesson data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [courseId, lessonId, user, router, toast])

  const handleMarkComplete = async () => {
    if (!user || !isEnrolled) return

    try {
      await markLessonAsCompleted(user.uid, courseId, lessonId)
      setIsCompleted(true)

      toast({
        title: "Success",
        description: "Lesson marked as complete.",
      })
    } catch (error) {
      console.error("Error marking lesson as complete:", error)
      toast({
        title: "Error",
        description: "Failed to mark lesson as complete. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (!lesson || !course) {
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
            <Link href={`/courses/${courseId}`} className="hover:text-primary">
              {course.title}
            </Link>
            <span>/</span>
            <span>Lesson {lesson.order + 1}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Lesson {lesson.order + 1}</span>
            {isPreview && (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">Preview</span>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                {lesson.contentType === "video" && lesson.contentUrl && (
                  <div className="aspect-video w-full bg-muted rounded-md mb-6">
                    <iframe
                      className="w-full h-full rounded-md"
                      src={lesson.contentUrl}
                      title={lesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">{lesson.title}</h2>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }} />

                  <div className="flex items-center justify-between mt-8">
                    {prevLesson ? (
                      <Button variant="outline" asChild>
                        <Link href={`/courses/${courseId}/lessons/${prevLesson.id}`}>
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Previous Lesson
                        </Link>
                      </Button>
                    ) : (
                      <div />
                    )}

                    {nextLesson ? (
                      <Button asChild>
                        <Link href={`/courses/${courseId}/lessons/${nextLesson.id}`}>
                          Next Lesson
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild>
                        <Link href={`/courses/${courseId}`}>
                          Finish Course
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            {isPreview && !isEnrolled && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader>
                  <CardTitle>Preview Mode</CardTitle>
                  <CardDescription>
                    You're viewing this lesson in preview mode. Enroll in the course to access all content.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={`/courses/${courseId}`}>Enroll Now</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {isEnrolled && (
              <Card>
                <CardHeader>
                  <CardTitle>Course Progress</CardTitle>
                  <CardDescription>Track your progress through this course</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Overall Progress</span>
                      <span className="font-medium">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Lesson Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Link href="#" className="text-sm hover:underline">
                      Lesson Notes (PDF)
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Link href="#" className="text-sm hover:underline">
                      Supplementary Reading
                    </Link>
                  </div>
                  {isPreview && !isEnrolled && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <span className="text-sm">Additional resources (Enroll to access)</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {isEnrolled && (
              <Card>
                <CardHeader>
                  <CardTitle>Mark Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="lesson-complete" checked={isCompleted} onCheckedChange={() => handleMarkComplete()} />
                    <label
                      htmlFor="lesson-complete"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Mark lesson as complete
                    </label>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ListChecks className="h-4 w-4 text-muted-foreground" />
                      <Link href={`/courses/${courseId}/quizzes/1`} className="text-sm hover:underline">
                        Take Lesson Quiz
                      </Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <ListChecks className="h-4 w-4 text-muted-foreground" />
                      <Link href={`/courses/${courseId}/assignments/1`} className="text-sm hover:underline">
                        Complete Assignment
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
