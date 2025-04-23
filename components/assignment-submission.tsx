"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"
import { submitAssignment } from "@/lib/services/enrollment-service"
import { useToast } from "@/hooks/use-toast"

interface AssignmentSubmissionProps {
  assignmentId: string
  courseId: string
  userId: string
  title: string
  instructions: string
  deadline: Date
  onSubmissionComplete?: () => void
}

export function AssignmentSubmission({
  assignmentId,
  courseId,
  userId,
  title,
  instructions,
  deadline,
  onSubmissionComplete,
}: AssignmentSubmissionProps) {
  const [comment, setComment] = useState("")
  const [fileData, setFileData] = useState<any | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const handleUploadComplete = (data: any) => {
    setFileData(data)
  }

  const handleSubmit = async () => {
    if (!fileData) {
      toast({
        title: "Error",
        description: "Please upload a file before submitting",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      await submitAssignment(userId, courseId, assignmentId, fileData.url, fileData.name)

      toast({
        title: "Success",
        description: "Assignment submitted successfully",
      })

      if (onSubmissionComplete) {
        onSubmissionComplete()
      }
    } catch (error) {
      console.error("Error submitting assignment:", error)
      toast({
        title: "Error",
        description: "Failed to submit assignment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const isDeadlinePassed = new Date() > deadline

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Due: {deadline.toLocaleDateString()} at {deadline.toLocaleTimeString()}
          {isDeadlinePassed && <span className="ml-2 text-destructive">(Deadline passed)</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-muted p-4">
          <p className="whitespace-pre-wrap text-sm">{instructions}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Your Submission</h3>
          <FileUpload
            onUploadComplete={handleUploadComplete}
            folderId={`${courseId}_${assignmentId}_submissions`}
            buttonText="Upload Assignment"
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Comments (Optional)</h3>
          <Textarea
            placeholder="Add any comments about your submission..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={!fileData || submitting || isDeadlinePassed} className="w-full">
          {submitting ? "Submitting..." : "Submit Assignment"}
        </Button>
      </CardFooter>
    </Card>
  )
}
