"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/toast"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore"
import { MoreHorizontal, Search, Mail, FileText } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function ManageStudentsPage() {
  const { user, userProfile } = useAuth()
  const { toast } = useToast()
  const [students, setStudents] = useState<any[]>([])
  const [filteredStudents, setFilteredStudents] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("all")

  useEffect(() => {
    if (!user || !userProfile || userProfile.role !== "lecturer") {
      return
    }

    const lecturerId = user.uid

    // First, get the courses taught by this lecturer
    const coursesRef = collection(db, "courses")
    const lecturerCoursesQuery = query(coursesRef, where("instructorId", "==", lecturerId))

    const unsubscribe = onSnapshot(lecturerCoursesQuery, async (snapshot) => {
      try {
        const courseIds = snapshot.docs.map((doc) => doc.id)

        if (courseIds.length === 0) {
          setStudents([])
          setFilteredStudents([])
          setLoading(false)
          return
        }

        // Then get all students
        const usersRef = collection(db, "users")
        const studentsQuery = query(usersRef, where("role", "==", "student"))
        const studentsSnapshot = await getDocs(studentsQuery)

        const studentsData = studentsSnapshot.docs
          .map((doc) => {
            const data = doc.data()
            // Check if student is enrolled in any of the lecturer's courses
            const enrolledInLecturerCourse =
              data.enrolledCourses && data.enrolledCourses.some((courseId: string) => courseIds.includes(courseId))

            return {
              id: doc.id,
              ...data,
              enrolledInLecturerCourse,
            }
          })
          .sort((a, b) => a.fullName?.localeCompare(b.fullName) || 0)

        setStudents(studentsData)
        setFilteredStudents(studentsData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching students:", error)
        toast({
          title: "Error",
          description: "Failed to load students. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [user, userProfile, toast])

  useEffect(() => {
    // Filter students based on search query and selected tab
    let filtered = students

    if (searchQuery) {
      filtered = filtered.filter(
        (student) =>
          student.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedTab === "enrolled") {
      filtered = filtered.filter((student) => student.enrolledInLecturerCourse)
    } else if (selectedTab === "not-enrolled") {
      filtered = filtered.filter((student) => !student.enrolledInLecturerCourse)
    }

    setFilteredStudents(filtered)
  }, [searchQuery, selectedTab, students])

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return "Invalid date"
    }
  }

  const handleSendEmail = (studentId: string, studentEmail: string) => {
    // In a real app, this would open an email composition modal or redirect to an email client
    window.open(`mailto:${studentEmail}`, "_blank")
    toast({
      title: "Email Client Opened",
      description: `You can now send an email to ${studentEmail}`,
    })
  }

  const handleViewAssignments = (studentId: string) => {
    // In a real app, this would navigate to a page showing the student's assignments
    toast({
      title: "View Assignments",
      description: "This feature will be available soon.",
    })
  }

  return (
    <DashboardLayout role="lecturer">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Students</h1>
          <p className="text-muted-foreground mt-2">View and manage students enrolled in your courses.</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">All Students</TabsTrigger>
            <TabsTrigger value="enrolled">Enrolled in My Courses</TabsTrigger>
            <TabsTrigger value="not-enrolled">Not Enrolled</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student List</CardTitle>
                <CardDescription>Manage all students in the system.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No students found.</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.fullName || "N/A"}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{formatDate(student.createdAt)}</TableCell>
                            <TableCell>
                              {student.enrolledInLecturerCourse ? (
                                <Badge className="bg-green-500">Enrolled</Badge>
                              ) : (
                                <Badge variant="outline">Not Enrolled</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
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
                                  <DropdownMenuItem onClick={() => handleSendEmail(student.id, student.email)}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleViewAssignments(student.id)}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Assignments
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enrolled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>Students enrolled in your courses.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No enrolled students found.</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.fullName || "N/A"}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{formatDate(student.createdAt)}</TableCell>
                            <TableCell className="text-right">
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
                                  <DropdownMenuItem onClick={() => handleSendEmail(student.id, student.email)}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleViewAssignments(student.id)}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Assignments
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="not-enrolled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Not Enrolled Students</CardTitle>
                <CardDescription>Students who are not enrolled in your courses.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No students found.</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.fullName || "N/A"}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{formatDate(student.createdAt)}</TableCell>
                            <TableCell className="text-right">
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
                                  <DropdownMenuItem onClick={() => handleSendEmail(student.id, student.email)}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Email
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
