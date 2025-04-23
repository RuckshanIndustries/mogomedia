import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Navbar } from "@/components/navbar"
import Link from "next/link"

// Types
interface Course {
  id: string
  title: string
  category: string
  description: string
  instructor: string
  duration: string
  students: number
  level: string
  prerequisites: string
}

// Fetch courses from Firestore
async function getCourses(): Promise<Course[]> {
  try {
    const coursesRef = collection(db, "courses")
    const snapshot = await getDocs(coursesRef)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Course[]
  } catch (error) {
    console.error("Error fetching courses:", error)
    return [] // Return empty array to avoid build failure
  }
}

export default async function CoursesPage() {
  const courses = await getCourses()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Available Courses</h1>
        {courses.length === 0 ? (
          <p className="text-muted-foreground">No courses available.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h2 className="text-xl font-semibold">{course.title}</h2>
                  <p className="text-muted-foreground mt-2">{course.category}</p>
                  <p className="text-sm mt-2">{course.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{course.instructor}</span>
                    <span className="text-sm text-muted-foreground">{course.students} students</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}