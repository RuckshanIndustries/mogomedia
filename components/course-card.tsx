import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

interface CourseCardProps {
  id: string
  title: string
  description: string
  coverImage: string
  progress?: number
  lessonCount?: number
  quizCount?: number
  assignmentCount?: number
  isCompleted?: boolean
  buttonText?: string
  buttonVariant?: "default" | "outline" | "secondary"
}

export function CourseCard({
  id,
  title,
  description,
  coverImage,
  progress = 0,
  lessonCount,
  quizCount,
  assignmentCount,
  isCompleted = false,
  buttonText = "Continue Learning",
  buttonVariant = "default",
}: CourseCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-40">
        <Image src={coverImage || "/placeholder.svg?height=400&width=600"} alt={title} fill className="object-cover" />
      </div>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="mt-2 text-xs text-muted-foreground">
            {lessonCount !== undefined && `${lessonCount} lessons`}
            {quizCount !== undefined && lessonCount !== undefined && " • "}
            {quizCount !== undefined && `${quizCount} quizzes`}
            {assignmentCount !== undefined && (lessonCount !== undefined || quizCount !== undefined) && " • "}
            {assignmentCount !== undefined && `${assignmentCount} assignments`}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant={buttonVariant} className="w-full">
          <Link href={`/courses/${id}`}>{isCompleted ? "View Course" : buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
