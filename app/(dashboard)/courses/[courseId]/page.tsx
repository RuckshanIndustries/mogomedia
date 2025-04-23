import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, CheckCircle, Clock, FileText, Play, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function CoursePage({ params }: { params: { courseId: string } }) {
  // This would normally fetch course data based on the courseId
  const courseId = params.courseId

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/courses" className="hover:text-primary">
            Courses
          </Link>
          <span>/</span>
          <span>Web Development Fundamentals</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Web Development Fundamentals</h1>
        <p className="text-muted-foreground">
          Learn the core technologies of web development: HTML, CSS, and JavaScript
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <div className="relative aspect-video w-full">
              <Image src="/placeholder.svg?height=720&width=1280" alt="Course cover" fill className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button size="icon" className="h-16 w-16 rounded-full">
                  <Play className="h-8 w-8" />
                </Button>
              </div>
            </div>
            <CardHeader>
              <CardTitle>Course Overview</CardTitle>
              <CardDescription>Start your journey into web development</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  This comprehensive course will teach you everything you need to know about web development.
                  You&apos;ll learn HTML for structure, CSS for styling, and JavaScript for interactivity.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">12 hours of content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">12 lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">5 quizzes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Instructor: Jane Smith</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="font-medium">75%</span>
                </div>
                <Progress value={75} className="h-2" />
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Lessons Completed</span>
                    <span>9/12</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Quizzes Completed</span>
                    <span>3/5</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Assignments Completed</span>
                    <span>2/3</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button asChild className="w-full">
                  <Link href={`/courses/${courseId}/lessons/10`}>Continue to Lesson 10</Link>
                </Button>
                <div className="text-center text-sm text-muted-foreground">Next: JavaScript DOM Manipulation</div>
              </div>
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
                <div className="flex items-center gap-4 border-b pb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    1
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <div className="font-medium">Introduction to HTML</div>
                      <div className="text-sm text-muted-foreground">Learn the basics of HTML structure</div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-4 border-b pb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    2
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <div className="font-medium">HTML Elements and Attributes</div>
                      <div className="text-sm text-muted-foreground">Explore common HTML elements</div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-4 border-b pb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    3
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <div className="font-medium">Introduction to CSS</div>
                      <div className="text-sm text-muted-foreground">Learn how to style HTML elements</div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-4 border-b pb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    10
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <div className="font-medium">JavaScript DOM Manipulation</div>
                      <div className="text-sm text-muted-foreground">Learn how to interact with the DOM</div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/courses/${courseId}/lessons/10`}>Continue</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 border-b pb-4">
                  <div className="flex-1">
                    <div className="font-medium">Assignment 1: HTML Portfolio</div>
                    <div className="text-sm text-muted-foreground">Create a simple portfolio using HTML</div>
                    <div className="mt-1 text-xs text-muted-foreground">Due date: Completed</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-green-500">Completed</div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center gap-4 border-b pb-4">
                  <div className="flex-1">
                    <div className="font-medium">Assignment 2: CSS Styling</div>
                    <div className="text-sm text-muted-foreground">Style your portfolio with CSS</div>
                    <div className="mt-1 text-xs text-muted-foreground">Due date: Completed</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-green-500">Completed</div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="font-medium">Assignment 3: JavaScript Interactivity</div>
                    <div className="text-sm text-muted-foreground">Add interactive elements to your portfolio</div>
                    <div className="mt-1 text-xs text-red-500">Due in 2 days</div>
                  </div>
                  <Button size="sm">Submit Assignment</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="quizzes" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 border-b pb-4">
                  <div className="flex-1">
                    <div className="font-medium">Quiz 1: HTML Basics</div>
                    <div className="text-sm text-muted-foreground">Test your knowledge of HTML fundamentals</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">Score: 90%</div>
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-4 border-b pb-4">
                  <div className="flex-1">
                    <div className="font-medium">Quiz 2: CSS Fundamentals</div>
                    <div className="text-sm text-muted-foreground">Test your knowledge of CSS properties</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">Score: 85%</div>
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-4 border-b pb-4">
                  <div className="flex-1">
                    <div className="font-medium">Quiz 3: JavaScript Basics</div>
                    <div className="text-sm text-muted-foreground">Test your knowledge of JavaScript syntax</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">Score: 80%</div>
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="font-medium">Quiz 4: DOM Manipulation</div>
                    <div className="text-sm text-muted-foreground">Test your knowledge of DOM manipulation</div>
                  </div>
                  <Button size="sm">Take Quiz</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
