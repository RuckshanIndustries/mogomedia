"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  type FirebaseError,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useRouter, usePathname } from "next/navigation"

export type UserRole = "admin" | "lecturer" | "student"

export interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  role: UserRole
  createdAt: any
  lastLogin?: any
  profileImageUrl?: string
}

// Role-specific interfaces
export interface StudentData extends UserData {
  enrolledCourses?: string[]
  completedLessons?: Record<string, string[]>
  assignmentsSubmitted?: Record<string, string>
  quizScores?: Record<string, number>
}

export interface LecturerData extends UserData {
  assignedCourses?: string[]
  uploadedLessons?: Array<{ lessonId: string; courseId: string }>
  createdAssignments?: string[]
  receivedSubmissions?: Record<string, string[]>
}

export interface AdminData extends UserData {
  permissions?: {
    manageUsers: boolean
    manageCourses: boolean
    viewAnalytics: boolean
  }
  activityLogs?: Array<{
    action: string
    courseId?: string
    userId?: string
    timestamp: any
  }>
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<UserData | null>
  signIn: (email: string, password: string) => Promise<UserData | null>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  createUser: (email: string, password: string, displayName: string, role: UserRole) => Promise<UserData | null>
  updateUserRole: (userId: string, role: UserRole) => Promise<void>
  checkAccess: (allowedRoles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to get a user-friendly error message from Firebase error codes
const getAuthErrorMessage = (error: FirebaseError) => {
  switch (error.code) {
    case "auth/invalid-credential":
      return "Invalid email or password. Please check your credentials and try again."
    case "auth/user-not-found":
      return "No account found with this email address."
    case "auth/wrong-password":
      return "Incorrect password. Please try again."
    case "auth/email-already-in-use":
      return "An account with this email already exists."
    case "auth/weak-password":
      return "Password is too weak. Please use a stronger password."
    case "auth/invalid-email":
      return "Invalid email address format."
    case "auth/user-disabled":
      return "This account has been disabled. Please contact an administrator."
    case "auth/too-many-requests":
      return "Too many unsuccessful login attempts. Please try again later."
    default:
      return error.message || "An error occurred during authentication. Please try again."
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // This function fetches user data from Firestore based on the authenticated user
  const fetchUserData = async (user: User) => {
    try {
      const userDocRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        // Convert Firestore timestamp to Date if needed
        const data = userDoc.data()
        const userData = {
          ...data,
          createdAt: data.createdAt,
          lastLogin: data.lastLogin,
        } as UserData

        setUserData(userData)

        // Update last login time
        await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true })
        return userData
      } else {
        console.error("No user data found in Firestore")
        // Create a basic user document if it doesn't exist
        const basicUserData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split("@")[0] || "User",
          role: "student" as UserRole, // Default role
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        }
        await setDoc(userDocRef, basicUserData)

        // Fetch the user data again to get the server timestamp
        const newUserDoc = await getDoc(userDocRef)
        const newUserData = newUserDoc.data() as UserData

        setUserData(newUserData)
        return newUserData
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      return null
    }
  }

  // Handle routing based on user role and authentication status
  useEffect(() => {
    if (loading) return

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/login", "/admin-login", "/forgot-password"]
    const isPublicRoute =
      publicRoutes.includes(pathname) || (pathname.startsWith("/courses") && !pathname.includes("/lessons/"))

    if (!user && !isPublicRoute) {
      // Redirect to login if not authenticated and trying to access protected route
      router.push("/login")
      return
    }

    if (user && userData) {
      // Role-based routing for authenticated users
      const adminRoutes = ["/admin", "/admin-setup"]
      const lecturerRoutes = ["/lecturer"]

      if (pathname.startsWith("/admin") && userData.role !== "admin") {
        router.push("/dashboard")
        return
      }

      if (pathname.startsWith("/lecturer") && !["admin", "lecturer"].includes(userData.role)) {
        router.push("/dashboard")
        return
      }

      // Redirect from login/register pages if already authenticated
      if (["/login", "/admin-login", "/register"].includes(pathname)) {
        if (userData.role === "admin") {
          router.push("/admin/dashboard")
        } else {
          router.push("/dashboard")
        }
        return
      }
    }
  }, [user, userData, loading, pathname, router])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        await fetchUserData(user)
      } else {
        setUserData(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // This function is now restricted to admin use only
  const signUp = async (email: string, password: string, displayName: string, role: UserRole) => {
    if (!userData || userData.role !== "admin") {
      throw new Error("Only administrators can create new users")
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create user document in Firestore with role-specific structure
      const newUserData = await createUserDocument(user.uid, email, displayName, role)
      return newUserData
    } catch (error) {
      console.error("Error signing up:", error)
      if ((error as FirebaseError).code) {
        throw new Error(getAuthErrorMessage(error as FirebaseError))
      }
      throw error
    }
  }

  // Admin function to create users
  const createUser = async (email: string, password: string, displayName: string, role: UserRole) => {
    if (!userData || userData.role !== "admin") {
      throw new Error("Only administrators can create new users")
    }

    try {
      // First create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Then create the user document in Firestore
      const newUserData = await createUserDocument(user.uid, email, displayName, role)
      return newUserData
    } catch (error) {
      console.error("Error creating user:", error)
      if ((error as FirebaseError).code) {
        throw new Error(getAuthErrorMessage(error as FirebaseError))
      }
      throw error
    }
  }

  // Helper function to create user document with role-specific structure
  const createUserDocument = async (uid: string, email: string, displayName: string, role: UserRole) => {
    // Base user data
    const baseUserData = {
      uid,
      email,
      displayName,
      role,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    }

    let userData: UserData | StudentData | LecturerData | AdminData = baseUserData

    // Add role-specific fields
    if (role === "student") {
      userData = {
        ...baseUserData,
        enrolledCourses: [],
        completedLessons: {},
        assignmentsSubmitted: {},
        quizScores: {},
      } as StudentData
    } else if (role === "lecturer") {
      userData = {
        ...baseUserData,
        assignedCourses: [],
        uploadedLessons: [],
        createdAssignments: [],
        receivedSubmissions: {},
      } as LecturerData
    } else if (role === "admin") {
      userData = {
        ...baseUserData,
        permissions: {
          manageUsers: true,
          manageCourses: true,
          viewAnalytics: true,
        },
        activityLogs: [],
      } as AdminData
    }

    // Save to Firestore - NEVER store passwords in Firestore
    await setDoc(doc(db, "users", uid), userData)

    // Fetch the user data again to get the server timestamp
    const userDoc = await getDoc(doc(db, "users", uid))
    return userDoc.data() as UserData
  }

  // Function to update a user's role
  const updateUserRole = async (userId: string, role: UserRole) => {
    if (!userData || userData.role !== "admin") {
      throw new Error("Only administrators can update user roles")
    }

    try {
      const userDocRef = doc(db, "users", userId)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        throw new Error("User not found")
      }

      // Update the role
      await setDoc(userDocRef, { role }, { merge: true })

      return
    } catch (error) {
      console.error("Error updating user role:", error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      // Fetch user data immediately after sign in
      const userDataResult = await fetchUserData(userCredential.user)
      return userDataResult
    } catch (error) {
      console.error("Error signing in:", error)
      // Provide more specific error messages based on Firebase error codes
      if ((error as FirebaseError).code) {
        throw new Error(getAuthErrorMessage(error as FirebaseError))
      }
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error("Error resetting password:", error)
      if ((error as FirebaseError).code) {
        throw new Error(getAuthErrorMessage(error as FirebaseError))
      }
      throw error
    }
  }

  // Helper function to check if user has access to a specific role
  const checkAccess = (allowedRoles: UserRole[]): boolean => {
    if (!userData) return false
    return allowedRoles.includes(userData.role)
  }

  const value = {
    user,
    userData,
    loading,
    signUp,
    signIn,
    logout,
    resetPassword,
    createUser,
    updateUserRole,
    checkAccess,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
