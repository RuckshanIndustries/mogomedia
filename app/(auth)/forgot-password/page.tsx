"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { toast } = useToast()
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await resetPassword(email)
      setEmailSent(true)
      toast({
        title: "Email sent",
        description: "Check your email for the password reset link.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reset email. Please check your email address.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      {emailSent ? (
        <div className="flex flex-col gap-4 text-center">
          <div className="text-lg font-medium">Check your email</div>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent you a password reset link. Please check your email.
          </p>
          <Button asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </div>
        </form>
      )}
      <div className="text-center text-sm">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-primary">
          Sign in
        </Link>
      </div>
    </div>
  )
}
