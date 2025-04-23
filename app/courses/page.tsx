import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"


export async function generateStaticParams() {
  // You can hardcode or fetch from somewhere
  const courseIds = ["1", "2", "3", "4", "5"]

  return courseIds.map((id) => ({ id }))
}


// Mock course data
const courses = [
  {
    id: "1",
    title: "Introduction to Web Development",
    category: "Web Development",
    description: "Learn the fundamentals of HTML, CSS, and JavaScript to build your first website.",
    lessons: 12,
    duration: "6 weeks",
  },
  {
    id: "2",
    title: "Advanced React Techniques",
    category: "Frontend Development",
    description: "Master React hooks, context API, and state management for complex applications.",
    lessons: 15,
    duration: "8 weeks",
  },
  {
    id: "3",
    title: "UI/UX Design Principles",
    category: "Design",
    description: "Learn the fundamentals of user interface and user experience design for digital products.",
    lessons: 10,
    duration: "5 weeks",
  },
  {
    id: "4",
    title: "Mobile App Development with React Native",
    category: "Mobile Development",
    description: "Build cross-platform mobile applications using React Native and JavaScript.",
    lessons: 14,
    duration: "7 weeks",
  },
  {
    id: "5",
    title: "Backend Development with Node.js",
    category: "Backend Development",
    description: "Create scalable server-side applications with Node.js, Express, and MongoDB.",
    lessons: 16,
    duration: "8 weeks",
  },
]

export default function CoursesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Available Courses</h1>
            <p className="text-muted-foreground">
              Browse our selection of courses designed to help you advance your skills and career.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.category}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground">{course.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium">Lessons:</span>
                      <span className="ml-1">{course.lessons}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">Duration:</span>
                      <span className="ml-1">{course.duration}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/courses/${course.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
