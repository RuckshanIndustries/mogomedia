import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function CoursesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
        <p className="text-muted-foreground">Browse and manage your enrolled courses</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search courses..." className="w-full pl-8" />
        </div>
        <div className="flex items-center gap-2">
          <Tabs defaultValue="all" className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="overflow-hidden">
          <div className="relative h-40">
            <Image src="/placeholder.svg?height=400&width=600" alt="Web Development" fill className="object-cover" />
          </div>
          <CardHeader>
            <CardTitle>Web Development Fundamentals</CardTitle>
            <CardDescription>Learn HTML, CSS, and JavaScript</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">75%</span>
              </div>
              <Progress value={75} className="h-2" />
              <div className="mt-2 text-xs text-muted-foreground">12 lessons • 5 quizzes • 3 assignments</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/courses/web-development">Continue Learning</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden">
          <div className="relative h-40">
            <Image src="/placeholder.svg?height=400&width=600" alt="React Fundamentals" fill className="object-cover" />
          </div>
          <CardHeader>
            <CardTitle>React Fundamentals</CardTitle>
            <CardDescription>Build modern web applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">45%</span>
              </div>
              <Progress value={45} className="h-2" />
              <div className="mt-2 text-xs text-muted-foreground">10 lessons • 4 quizzes • 2 assignments</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/courses/react-fundamentals">Continue Learning</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden">
          <div className="relative h-40">
            <Image src="/placeholder.svg?height=400&width=600" alt="UX Design" fill className="object-cover" />
          </div>
          <CardHeader>
            <CardTitle>UX Design Principles</CardTitle>
            <CardDescription>Create user-centered designs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">100%</span>
              </div>
              <Progress value={100} className="h-2" />
              <div className="mt-2 text-xs text-muted-foreground">8 lessons • 3 quizzes • 1 assignment</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/courses/ux-design">View Course</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden">
          <div className="relative h-40">
            <Image
              src="/placeholder.svg?height=400&width=600"
              alt="Mobile App Development"
              fill
              className="object-cover"
            />
          </div>
          <CardHeader>
            <CardTitle>Mobile App Development</CardTitle>
            <CardDescription>Build iOS and Android apps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">100%</span>
              </div>
              <Progress value={100} className="h-2" />
              <div className="mt-2 text-xs text-muted-foreground">15 lessons • 6 quizzes • 4 assignments</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/courses/mobile-app-development">View Course</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
