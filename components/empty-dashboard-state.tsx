import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import Link from "next/link"

interface EmptyDashboardStateProps {
  title?: string
  description?: string
  actionText?: string
  actionLink?: string
  showAction?: boolean
}

export function EmptyDashboardState({
  title = "No courses yet",
  description = "You haven't enrolled in any courses yet. Browse our catalog to get started.",
  actionText = "Browse Courses",
  actionLink = "/courses",
  showAction = true,
}: EmptyDashboardStateProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Dashboard</CardTitle>
        <CardDescription>Welcome to Mogo Media Academy</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <BookOpen className="mb-2 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          {showAction && (
            <Button asChild className="mt-4">
              <Link href={actionLink}>{actionText}</Link>
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Need help getting started? Check out our{" "}
          <Link href="/help" className="text-primary hover:underline">
            help center
          </Link>
          .
        </p>
      </CardFooter>
    </Card>
  )
}
