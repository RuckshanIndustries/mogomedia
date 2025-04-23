"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Redirect to login page with a message
    toast({
      title: "Registration restricted",
      description: "Please contact an administrator to create an account.",
      variant: "destructive",
    })
    router.push("/login")
  }, [router, toast])

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-lg">Redirecting...</p>
    </div>
  )
}
