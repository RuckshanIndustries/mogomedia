"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  addDoc,
  getDocs,
  where,
} from "firebase/firestore"
import { MoreHorizontal, Search, Edit, Trash, Plus, Users, BookOpen, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AdminCoursesPage() {
  const { user, userProfile } = useAuth()
  const { toast } = useToast()
  const [courses, setCourses] = useState<any[]>([])
  const [filteredCourses, setFilteredCourses] = useState<any[]>([])
  const [lecturers, setLecturers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    duration: "",
    instructorId: "",
  })

  useEffect(() => {
    if (!user || !userProfile || userProfile.role !== "admin") {
      return
    }

    // Get all courses
    const coursesRef = collection(db, "courses")

    const unsubscribe = onSnapshot(
      coursesRef,
      (snapshot) => {
        try {
          const coursesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setCourses(coursesData)
          setFilteredCourses(coursesData)
          setLoading(false)
          setPermissionError(null)
        } catch (error) {
          console.error("Error fetching courses:", error)
          toast({
            title: "Error",
            description: "Failed to load courses. Please try again.",
            variant: "destructive",
          })
          setLoading(false)
        }
      },
      (error) => {
        console.error("Error in courses snapshot:", error)
        setPermissionError("You don't have permission to access courses. Please contact an administrator.")
        setLoading(false)
      },
    )

    // Get all lecturers for the dropdown
    const fetchLecturers = async () => {
      try {
        const usersRef = collection(db, "users")
        const lecturersQuery = query(usersRef, where("role", "==", "lecturer"))
        const snapshot = await getDocs(lecturersQuery)

        const lecturersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setLecturers(lecturersData)
      } catch (error) {
        console.error("Error fetching lecturers:", error)
        toast({
          title: "Error",
          description: "Failed to load lecturers. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchLecturers()

    return () => unsubscribe()
  }, [user, userProfile, toast])

  useEffect(() => {
    // Filter courses based on search query
    if (searchQuery) {
      const filtered = courses.filter(
        (course) =>
          course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredCourses(filtered)
    } else {
      setFilteredCourses(courses)
    }
  }, [searchQuery, courses])

  const handleAddCourse = async () => {
    if (!formData.title || !formData.description || !formData.instructorId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      // Get instructor details
      const selectedLecturer = lecturers.find((lecturer) => lecturer.id === formData.instructorId)

      const newCourse = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        duration: formData.duration,
        instructorId: formData.instructorId,
        instructorName: selectedLecturer?.fullName || "Unknown Instructor",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lessons: [],
        enrolledCount: 0,
      }

      await addDoc(collection(db, "courses"), newCourse)

      toast({
        title: "Success",
        description: "Course added successfully!",
      })

      // Reset form and close dialog
      setFormData({
        title: "",
        category: "",
        description: "",
        duration: "",
        instructorId: "",
      })
      setIsAddDialogOpen(false)
    } catch (error: any) {
      console.error("Error adding course:", error)

      // Check if it's a permission error
      if (error.message && error.message.includes("permission")) {
        setPermissionError("You don't have permission to add courses. Please contact an administrator.")
        toast({
          title: "Permission Denied",
          description: "You don't have permission to add courses. Please contact an administrator.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to add course. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleEditCourse = async () => {
    if (!selectedCourse || !formData.title || !formData.description || !formData.instructorId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      // Get instructor details
      const selectedLecturer = lecturers.find((lecturer) => lecturer.id === formData.instructorId)

      const courseRef = doc(db, "courses", selectedCourse.id)
      await updateDoc(courseRef, {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        duration: formData.duration,
        instructorId: formData.instructorId,
        instructorName: selectedLecturer?.fullName || "Unknown Instructor",
        updatedAt: serverTimestamp(),
      })

      toast({
        title: "Success",
        description: "Course updated successfully!",
      })

      // Reset form and close dialog
      setSelectedCourse(null)
      setFormData({
        title: "",
        category: "",
        description: "",
        duration: "",
        instructorId: "",
      })
      setIsEditDialogOpen(false)
    } catch (error: any) {
      console.error("Error updating course:", error)

      // Check if it's a permission error
      if (error.message && error.message.includes("permission")) {
        setPermissionError("You don't have permission to edit courses. Please contact an administrator.")
        toast({
          title: "Permission Denied",
          description: "You don't have permission to edit courses. Please contact an administrator.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update course. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return

    try {
      await deleteDoc(doc(db, "courses", selectedCourse.id))

      toast({
        title: "Success",
        description: "Course deleted successfully!",
      })

      // Reset and close dialog
      setSelectedCourse(null)
      setIsDeleteDialogOpen(false)
    } catch (error: any) {
      console.error("Error deleting course:", error)

      // Check if it's a permission error
      if (error.message && error.message.includes("permission")) {
        setPermissionError("You don't have permission to delete courses. Please contact an administrator.")
        toast({
          title: "Permission Denied",
          description: "You don't have permission to delete courses. Please contact an administrator.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete course. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const openEditDialog = (course: any) => {
    setSelectedCourse(course)
    setFormData({
      title: course.title || "",
      category: course.category || "",
      description: course.description || "",
      duration: course.duration || "",
      instructorId: course.instructorId || "",
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (course: any) => {
    setSelectedCourse(course)
    setIsDeleteDialogOpen(true)
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return "Invalid date"
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Courses</h1>
            <p className="text-muted-foreground mt-2">Create and manage all courses in the system.</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Course</DialogTitle>
                <DialogDescription>Create a new course and assign it to a lecturer.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Introduction to Web Development"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Web Development"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what students will learn in this course"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 6 weeks"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="instructor">Instructor</Label>
                  <Select
                    value={formData.instructorId}
                    onValueChange={(value) => setFormData({ ...formData, instructorId: value })}
                  >
                    <SelectTrigger id="instructor">
                      <SelectValue placeholder="Select an instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {lecturers.map((lecturer) => (
                        <SelectItem key={lecturer.id} value={lecturer.id}>
                          {lecturer.fullName || lecturer.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCourse}
                  disabled={!formData.title || !formData.description || !formData.instructorId}
                >
                  Create Course
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {permissionError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Permission Error</AlertTitle>
            <AlertDescription>{permissionError}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
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
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full mb-2" />
                  <div className="flex justify-between mt-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : permissionError && filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Permission Error</h3>
            <p className="text-muted-foreground mt-1">
              You don't have permission to access courses. Please contact an administrator.
            </p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No courses found</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery
                ? "No courses match your search criteria."
                : "There are no courses in the system yet. Click 'Add Course' to create one."}
            </p>
            {!searchQuery && !permissionError && (
              <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Course
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>{course.category}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditDialog(course)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Course
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(course)}>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>
                  <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {course.enrolledCount || 0} students
                    </div>
                    <div>{course.duration}</div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <span className="font-medium">Instructor:</span> {course.instructorName || "Not assigned"}
                  </div>
                </CardContent>
                <CardFooter className="pt-1">
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`/admin/courses/${course.id}`}>View Details</a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Course Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>Update the details of this course.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Course Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-duration">Duration</Label>
                <Input
                  id="edit-duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-instructor">Instructor</Label>
                <Select
                  value={formData.instructorId}
                  onValueChange={(value) => setFormData({ ...formData, instructorId: value })}
                >
                  <SelectTrigger id="edit-instructor">
                    <SelectValue placeholder="Select an instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {lecturers.map((lecturer) => (
                      <SelectItem key={lecturer.id} value={lecturer.id}>
                        {lecturer.fullName || lecturer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleEditCourse}
                disabled={!formData.title || !formData.description || !formData.instructorId}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Course Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Course</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this course? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="font-medium">{selectedCourse?.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{selectedCourse?.description}</p>
              <p className="text-sm text-muted-foreground mt-1">Instructor: {selectedCourse?.instructorName}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteCourse}>
                Delete Course
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
