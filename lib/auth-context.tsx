"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { useRouter, usePathname } from "next/navigation"
import { auth, db } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"

export type UserRole = "student" | "lecturer" | "admin"

export interface UserProfile {
  uid: string
  email: string
  fullName: string
  role: UserRole
  profileImageUrl: string
  createdAt: string
  enrolledCourses: string[]
  completedLessons: Record<string, boolean>
  assignmentsSubmitted: Record<string, Record<string, { driveLink: string; submittedAt: string }>>
  quizScores: Record<string, { score: number; submittedAt: string }>
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile)
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Handle redirects based on auth state and user role
  useEffect(() => {
    if (loading) return

    const publicRoutes = ["/", "/login"]
    const studentRoutes = ["/student"]
    const lecturerRoutes = ["/lecturer"]
    const adminRoutes = ["/admin"]

    if (!user && !publicRoutes.some((route) => pathname.startsWith(route))) {
      router.push("/login")
      return
    }

    if (user && userProfile) {
      // Redirect to appropriate dashboard if on login page
      if (pathname === "/login") {
        router.push(`/${userProfile.role}`)
        return
      }

      // Check if user is accessing a route they shouldn't
      if (
        userProfile.role === "student" &&
        !studentRoutes.some((route) => pathname.startsWith(route)) &&
        !publicRoutes.some((route) => pathname.startsWith(route))
      ) {
        router.push("/student")
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        })
        return
      }

      if (
        userProfile.role === "lecturer" &&
        !lecturerRoutes.some((route) => pathname.startsWith(route)) &&
        !publicRoutes.some((route) => pathname.startsWith(route))
      ) {
        router.push("/lecturer")
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        })
        return
      }

      if (
        userProfile.role === "admin" &&
        !adminRoutes.some((route) => pathname.startsWith(route)) &&
        !publicRoutes.some((route) => pathname.startsWith(route))
      ) {
        router.push("/admin")
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        })
        return
      }
    }
  }, [loading, user, userProfile, pathname, router, toast])

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      console.error("Error signing in:", error)
      throw new Error(error.message)
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return <AuthContext.Provider value={{ user, userProfile, loading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
