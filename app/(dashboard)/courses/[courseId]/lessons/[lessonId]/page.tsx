import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight, FileText, ListChecks } from "lucide-react"
import Link from "next/link"

export default function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string }
}) {
  const courseId = params.courseId
  const lessonId = params.lessonId

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/courses" className="hover:text-primary">
            Courses
          </Link>
          <span>/</span>
          <Link href={`/courses/${courseId}`} className="hover:text-primary">
            Web Development Fundamentals
          </Link>
          <span>/</span>
          <span>Lesson {lessonId}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">JavaScript DOM Manipulation</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Lesson {lessonId} of 12</span>
          <span>•</span>
          <span>20 minutes</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video w-full bg-muted rounded-md mb-6">
                <iframe
                  className="w-full h-full rounded-md"
                  src="about:blank"
                  title="Lesson Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Introduction to DOM Manipulation</h2>
                <p>
                  The Document Object Model (DOM) is a programming interface for web documents. It represents the page
                  so that programs can change the document structure, style, and content. The DOM represents the
                  document as nodes and objects; that way, programming languages can interact with the page.
                </p>
                <h3 className="text-xl font-bold mt-6">Selecting Elements</h3>
                <p>JavaScript provides several methods to select elements from the DOM:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <code className="bg-muted px-1 rounded">document.getElementById()</code> - Selects an element by its
                    ID
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">document.getElementsByClassName()</code> - Selects elements
                    by their class name
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">document.getElementsByTagName()</code> - Selects elements by
                    their tag name
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">document.querySelector()</code> - Selects the first element
                    that matches a CSS selector
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">document.querySelectorAll()</code> - Selects all elements
                    that match a CSS selector
                  </li>
                </ul>

                <h3 className="text-xl font-bold mt-6">Modifying Elements</h3>
                <p>Once you've selected an element, you can modify its content, attributes, and styles:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <code className="bg-muted px-1 rounded">element.innerHTML</code> - Gets or sets the HTML content of
                    an element
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">element.textContent</code> - Gets or sets the text content
                    of an element
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">element.setAttribute()</code> - Sets an attribute on an
                    element
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">element.style.property</code> - Sets a CSS property on an
                    element
                  </li>
                </ul>

                <h3 className="text-xl font-bold mt-6">Creating and Removing Elements</h3>
                <p>You can also create new elements and add them to the DOM:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <code className="bg-muted px-1 rounded">document.createElement()</code> - Creates a new element
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">parent.appendChild()</code> - Adds a child element to a
                    parent element
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">parent.removeChild()</code> - Removes a child element from a
                    parent element
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">element.remove()</code> - Removes an element from the DOM
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-between mt-8">
                <Button variant="outline" asChild>
                  <Link href={`/courses/${courseId}/lessons/${Number.parseInt(lessonId) - 1}`}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous Lesson
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/courses/${courseId}/lessons/${Number.parseInt(lessonId) + 1}`}>
                    Next Lesson
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
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

          <Card>
            <CardHeader>
              <CardTitle>Lesson Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <Link href="#" className="text-sm hover:underline">
                    DOM Manipulation Cheat Sheet (PDF)
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <Link href="#" className="text-sm hover:underline">
                    Lesson Slides (PDF)
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <Link href="#" className="text-sm hover:underline">
                    Code Examples (ZIP)
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mark Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox id="lesson-complete" />
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
                  <Link href={`/courses/${courseId}/quizzes/4`} className="text-sm hover:underline">
                    Take DOM Manipulation Quiz
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-muted-foreground" />
                  <Link href={`/courses/${courseId}/assignments/3`} className="text-sm hover:underline">
                    Complete Assignment 3
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
