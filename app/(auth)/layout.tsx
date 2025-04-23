import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { GraduationCap } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="hidden bg-muted md:block">
        <div className="flex h-full w-full items-center justify-center">
          <div className="relative h-full w-full">
            <Image
              src="/placeholder.svg?height=1080&width=1080"
              alt="Authentication background"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-primary/20" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="mx-auto flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-semibold tracking-tight">Mogo Media Academy</h1>
            </div>
            <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
          </div>
          {children}
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
