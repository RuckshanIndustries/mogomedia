import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Mogo Media Academy</span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
            Features
          </Link>
          <Link href="#courses" className="text-sm font-medium hover:underline underline-offset-4">
            Courses
          </Link>
          <Link href="#about" className="text-sm font-medium hover:underline underline-offset-4">
            About
          </Link>
        </nav>
        <div className="ml-4 flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/admin-login">Admin Login</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Learn at Your Own Pace
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Mogo Media Academy offers high-quality courses in web development, design, and more. Learn from
                    industry experts and advance your career.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/register">Get Started</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/courses">Browse Courses</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/placeholder.svg?height=550&width=550"
                  width={550}
                  height={550}
                  alt="Hero Image"
                  className="rounded-lg object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform offers everything you need to learn effectively
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Interactive Learning</h3>
                  <p className="text-muted-foreground">
                    Engage with interactive lessons, quizzes, and assignments to reinforce your learning.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Expert Instructors</h3>
                  <p className="text-muted-foreground">
                    Learn from industry professionals with years of experience in their fields.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Progress Tracking</h3>
                  <p className="text-muted-foreground">
                    Track your progress and see how far you've come with detailed analytics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="courses" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Popular Courses</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Explore our most popular courses and start learning today
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="relative h-48">
                  <Image
                    src="/placeholder.svg?height=400&width=600"
                    alt="Web Development"
                    fill
                    className="rounded-t-lg object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold">Web Development</h3>
                  <p className="text-muted-foreground">Learn HTML, CSS, and JavaScript to build modern websites.</p>
                  <div className="mt-4">
                    <Button asChild>
                      <Link href="/register">Enroll Now</Link>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="relative h-48">
                  <Image
                    src="/placeholder.svg?height=400&width=600"
                    alt="UX Design"
                    fill
                    className="rounded-t-lg object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold">UX Design</h3>
                  <p className="text-muted-foreground">Master the principles of user experience design.</p>
                  <div className="mt-4">
                    <Button asChild>
                      <Link href="/register">Enroll Now</Link>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="relative h-48">
                  <Image
                    src="/placeholder.svg?height=400&width=600"
                    alt="Mobile Development"
                    fill
                    className="rounded-t-lg object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold">Mobile Development</h3>
                  <p className="text-muted-foreground">Build iOS and Android apps with React Native.</p>
                  <div className="mt-4">
                    <Button asChild>
                      <Link href="/register">Enroll Now</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex items-center justify-center">
                <Image
                  src="/placeholder.svg?height=550&width=550"
                  width={550}
                  height={550}
                  alt="About Us"
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">About Mogo Media Academy</h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                    Mogo Media Academy was founded with a simple mission: to provide high-quality education that's
                    accessible to everyone. Our team of expert instructors is passionate about teaching and committed to
                    helping you achieve your goals.
                  </p>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                    Whether you're looking to start a new career, advance in your current role, or simply learn
                    something new, we have courses that will help you succeed.
                  </p>
                </div>
                <div>
                  <Button size="lg" asChild>
                    <Link href="/register">Join Our Community</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ready to Get Started?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of students who are already learning with Mogo Media Academy
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="/register">Sign Up Now</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Mogo Media Academy. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy Policy
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Contact Us
          </Link>
        </nav>
      </footer>
    </div>
  )
}
