"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"

// Mock assignment data
const assignments = [
  {
    id: "1",
    title: "Create a Responsive Landing Page",
    course: "Introduction to Web Development",
    courseId: "1",
    dueDate: "2025-05-01",
    status: "pending",
    description:
      "Design and implement a responsive landing page using HTML, CSS, and JavaScript. The page should adapt to different screen sizes and include a navigation menu, hero section, features section, and contact form.",
  },
  {
    id: "2",
    title: "Design a Mobile App Wireframe",
    course: "UI/UX Design Principles",
    courseId: "3",
    dueDate: "2025-05-05",
    status: "pending",
    description:
      "Create wireframes for a mobile application of your choice. Include at least 5 screens showing the main user flows. Explain your design decisions and how they enhance the user experience.",
  },
  {
    id: "3",
    title: "Build a To-Do List App with React",
    course: "Advanced React Techniques",
    courseId: "2",
    dueDate: "2025-04-15",
    status: "submitted",
    submittedAt: "2025-04-14T10:30:00",
    driveLink: "https://drive.google.com/file/d/example",
    description:
      "Develop a to-do list application using React. The app should allow users to add, edit, delete, and mark tasks as complete. Implement state management using React hooks.",
  },
  {
    id: "4",
    title: "CSS Animation Project",
    course: "Introduction to Web Development",
    courseId: "1",
    dueDate: "2025-04-10",
    status: "graded",
    submittedAt: "2025-04-09T14:20:00",
    driveLink: "https://drive.google.com/file/d/example",
    grade: "A",
    feedback:
      "Excellent work! Your animations are smooth and creative. Consider adding more comments in your CSS for better code readability.",
    description:
      "Create a web page that demonstrates various CSS animations and transitions. Include at least 5 different animation effects and explain how each one works.",
  },
]

export default function StudentAssignmentsPage() {
  const { toast } = useToast()
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [driveLink, setDriveLink] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSubmit = (assignmentId: string) => {
    setIsSubmitting(true)

    // Simulate API call to submit assignment
    setTimeout(() => {
      setIsSubmitting(false)
      setDialogOpen(false)

      toast({
        title: "Assignment Submitted",
        description: "Your assignment has been successfully submitted.",
      })

      // In a real app, you would update Firestore here
    }, 1500)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "submitted":
        return <Badge variant="secondary">Submitted</Badge>
      case "graded":
        return <Badge variant="default">Graded</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground mt-2">View and submit your course assignments</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="graded">Graded</TabsTrigger>
            <TabsTrigger value="all">All Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {assignments
                .filter((assignment) => assignment.status === "pending")
                .map((assignment) => (
                  <Card key={assignment.id} className="flex flex-col">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div>
                        <CardTitle>{assignment.title}</CardTitle>
                        <CardDescription>{assignment.course}</CardDescription>
                      </div>
                      {getStatusBadge(assignment.status)}
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">{assignment.description}</p>
                        <div className="text-sm">
                          <span className="font-medium">Due Date:</span>{" "}
                          <span className="text-muted-foreground">{formatDate(assignment.dueDate)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Dialog
                        open={dialogOpen && selectedAssignment?.id === assignment.id}
                        onOpenChange={(open) => {
                          setDialogOpen(open)
                          if (!open) setSelectedAssignment(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button className="w-full" onClick={() => setSelectedAssignment(assignment)}>
                            <Upload className="mr-2 h-4 w-4" />
                            Submit Assignment
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Submit Assignment</DialogTitle>
                            <DialogDescription>Upload your assignment for {assignment.title}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="drive-link">Google Drive Link</Label>
                              <Input
                                id="drive-link"
                                placeholder="https://drive.google.com/file/d/..."
                                value={driveLink}
                                onChange={(e) => setDriveLink(e.target.value)}
                              />
                              <p className="text-xs text-muted-foreground">
                                Upload your file to Google Drive and paste the shareable link here
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="submit"
                              disabled={!driveLink || isSubmitting}
                              onClick={() => handleSubmit(assignment.id)}
                            >
                              {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                ))}
            </div>
            {assignments.filter((assignment) => assignment.status === "pending").length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No pending assignments</h3>
                <p className="text-muted-foreground mt-1">You don't have any pending assignments at the moment</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="submitted" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {assignments
                .filter((assignment) => assignment.status === "submitted")
                .map((assignment) => (
                  <Card key={assignment.id} className="flex flex-col">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div>
                        <CardTitle>{assignment.title}</CardTitle>
                        <CardDescription>{assignment.course}</CardDescription>
                      </div>
                      {getStatusBadge(assignment.status)}
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">{assignment.description}</p>
                        <div className="text-sm">
                          <div>
                            <span className="font-medium">Due Date:</span>{" "}
                            <span className="text-muted-foreground">{formatDate(assignment.dueDate)}</span>
                          </div>
                          <div>
                            <span className="font-medium">Submitted:</span>{" "}
                            <span className="text-muted-foreground">
                              {assignment.submittedAt && formatDate(assignment.submittedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <a href={assignment.driveLink} target="_blank" rel="noopener noreferrer">
                          View Submission
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
            {assignments.filter((assignment) => assignment.status === "submitted").length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No submitted assignments</h3>
                <p className="text-muted-foreground mt-1">You haven't submitted any assignments yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="graded" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {assignments
                .filter((assignment) => assignment.status === "graded")
                .map((assignment) => (
                  <Card key={assignment.id} className="flex flex-col">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div>
                        <CardTitle>{assignment.title}</CardTitle>
                        <CardDescription>{assignment.course}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(assignment.status)}
                        {assignment.grade && (
                          <Badge variant="default" className="bg-primary">
                            Grade: {assignment.grade}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">{assignment.description}</p>
                        <div className="text-sm">
                          <div>
                            <span className="font-medium">Due Date:</span>{" "}
                            <span className="text-muted-foreground">{formatDate(assignment.dueDate)}</span>
                          </div>
                          <div>
                            <span className="font-medium">Submitted:</span>{" "}
                            <span className="text-muted-foreground">
                              {assignment.submittedAt && formatDate(assignment.submittedAt)}
                            </span>
                          </div>
                        </div>
                        {assignment.feedback && (
                          <div className="rounded-md bg-muted p-3">
                            <h4 className="text-sm font-medium mb-1">Feedback:</h4>
                            <p className="text-sm text-muted-foreground">{assignment.feedback}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <a href={assignment.driveLink} target="_blank" rel="noopener noreferrer">
                          View Submission
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
            {assignments.filter((assignment) => assignment.status === "graded").length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No graded assignments</h3>
                <p className="text-muted-foreground mt-1">None of your assignments have been graded yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="flex flex-col">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>{assignment.title}</CardTitle>
                      <CardDescription>{assignment.course}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(assignment.status)}
                      {assignment.grade && (
                        <Badge variant="default" className="bg-primary">
                          Grade: {assignment.grade}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">{assignment.description}</p>
                      <div className="text-sm">
                        <div>
                          <span className="font-medium">Due Date:</span>{" "}
                          <span className="text-muted-foreground">{formatDate(assignment.dueDate)}</span>
                        </div>
                        {assignment.submittedAt && (
                          <div>
                            <span className="font-medium">Submitted:</span>{" "}
                            <span className="text-muted-foreground">{formatDate(assignment.submittedAt)}</span>
                          </div>
                        )}
                      </div>
                      {assignment.feedback && (
                        <div className="rounded-md bg-muted p-3">
                          <h4 className="text-sm font-medium mb-1">Feedback:</h4>
                          <p className="text-sm text-muted-foreground">{assignment.feedback}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {assignment.status === "pending" ? (
                      <Dialog
                        open={dialogOpen && selectedAssignment?.id === assignment.id}
                        onOpenChange={(open) => {
                          setDialogOpen(open)
                          if (!open) setSelectedAssignment(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button className="w-full" onClick={() => setSelectedAssignment(assignment)}>
                            <Upload className="mr-2 h-4 w-4" />
                            Submit Assignment
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Submit Assignment</DialogTitle>
                            <DialogDescription>Upload your assignment for {assignment.title}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="drive-link">Google Drive Link</Label>
                              <Input
                                id="drive-link"
                                placeholder="https://drive.google.com/file/d/..."
                                value={driveLink}
                                onChange={(e) => setDriveLink(e.target.value)}
                              />
                              <p className="text-xs text-muted-foreground">
                                Upload your file to Google Drive and paste the shareable link here
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="submit"
                              disabled={!driveLink || isSubmitting}
                              onClick={() => handleSubmit(assignment.id)}
                            >
                              {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button variant="outline" className="w-full" asChild>
                        <a href={assignment.driveLink} target="_blank" rel="noopener noreferrer">
                          View Submission
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
