// Server Component
import { Navbar } from "@/components/navbar"
import ClientCourseDetailPage from "./ClientCourseDetailPage"

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

// Mock course data (replace with Firestore/API fetch in production)
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
  "2": {
    id: "2",
    title: "Advanced React Techniques",
    category: "Frontend Development",
    description:
      "Master React hooks, context API, and state management for complex applications.",
    lessons: [
      { id: "l1", title: "React Hooks Deep Dive", duration: "60 min" },
      { id: "l2", title: "Context API and State Management", duration: "75 min" },
      { id: "l3", title: "Performance Optimization", duration: "90 min" },
      { id: "l4", title: "Custom Hooks", duration: "60 min" },
      { id: "l5", title: "Testing React Components", duration: "75 min" },
    ],
    assignments: [
      { id: "a1", title: "Convert Class Components to Hooks", dueDate: "Week 2" },
      { id: "a2", title: "Build a State Management Solution", dueDate: "Week 5" },
      { id: "a3", title: "Performance Optimization Project", dueDate: "Week 7" },
    ],
    instructor: "Prof. Michael Chen",
    duration: "8 weeks",
    students: 16,
    level: "Intermediate",
    prerequisites: "Basic React knowledge, JavaScript fundamentals",
  },
  // Add other courses as needed
}

// Generate static parameters for dynamic routes
export async function generateStaticParams() {
  // In a real app, fetch course IDs from Firestore or an API
  const courseIds = Object.keys(coursesData)
  return courseIds.map((id) => ({ id }))
}

// Fetch course data (mocked for now)
async function getCourseData(courseId: string): Promise<Course | null> {
  return coursesData[courseId] || null
}

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const course = await getCourseData(params.id)

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

  return <ClientCourseDetailPage course={course} courseId={params.id} />
}