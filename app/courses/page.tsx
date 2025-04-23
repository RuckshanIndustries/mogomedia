"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface Course {
  id: string
  title: string
  description: string
  coverImage: string
  category: string
  lecturerId: string
  lecturerName?: string
  lessonCount?: number
  quizCount?: number
  assignmentCount?: number
  isPublic: boolean
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesCollection = collection(db, "courses")
        // Only fetch public courses for non-authenticated users
        const coursesQuery = user ? query(coursesCollection) : query(coursesCollection, where("isPublic", "==", true))

        const coursesSnapshot = await getDocs(coursesQuery)
        const coursesData = coursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[]

        // Fetch lecturer names
        const coursesWithLecturers = await Promise.all(
          coursesData.map(async (course) => {
            if (course.lecturerId) {
              try {
                const lecturerDoc = await getDocs(query(collection(db, "users"), where("uid", "==", course.lecturerId)))
                if (!lecturerDoc.empty) {
                  const lecturerData = lecturerDoc.docs[0].data()
                  return {
                    ...course,
                    lecturerName: lecturerData.displayName || "Unknown Instructor",
                  }
                }
              } catch (error) {
                console.error(`Error fetching lecturer for course ${course.id}:`, error)
              }
            }
            return {
              ...course,
              lecturerName: "Unknown Instructor",
            }
          }),
        )

        setCourses(coursesWithLecturers)
        setFilteredCourses(coursesWithLecturers)
      } catch (error) {
        console.error("Error fetching courses:", error)
        toast({
          title: "Error",
          description: "Failed to load courses. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [user, toast])

  useEffect(() => {
    let result = [...courses]

    // Filter by category if not "all"
    if (activeCategory !== "all") {
      result = result.filter((course) => course.category === activeCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          (course.lecturerName && course.lecturerName.toLowerCase().includes(query)),
      )
    }

    setFilteredCourses(result)
  }, [courses, activeCategory, searchQuery])

  // Extract unique categories for the filter tabs
  const categories = ["all", ...new Set(courses.map((course) => course.category))]

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">Browse our available courses</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Tabs
              defaultValue="all"
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="w-full sm:w-auto"
            >
              <TabsList>
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {category === "all" ? "All" : category.charAt(0).toUpperCase() + category.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <div className="relative h-40">
                  <Image
                    src={course.coverImage || "/placeholder.svg?height=400&width=600"}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>Instructor: {course.lecturerName || "Unknown"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{course.description}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/courses/${course.id}`}>{user ? "View Course" : "Enroll Now"}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-lg font-medium">No courses found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No courses match your search criteria." : "Check back later for new courses."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
