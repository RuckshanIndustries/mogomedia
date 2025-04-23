"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, doc, getDoc, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { UserProfile } from "@/lib/auth-context"

// Helper function to safely format dates
function safeFormatDate(dateInput: any): string {
  if (!dateInput) return "N/A"
  try {
    // Handle Firestore timestamps
    if (dateInput && typeof dateInput.toDate === "function") {
      return dateInput.toDate().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    }
    // Handle string dates
    if (typeof dateInput === "string") {
      return new Date(dateInput).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    }
    // Handle Date objects
    if (dateInput instanceof Date) {
      return dateInput.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    }
    return "Invalid date"
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid date"
  }
}

// Hook to get real-time user count by role
export function useUserCountByRole() {
  const [counts, setCounts] = useState({
    students: 0,
    lecturers: 0,
    admins: 0,
    total: 0,
    newUsersThisWeek: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const usersRef = collection(db, "users")

    // Get all users with proper error handling
    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        let studentCount = 0
        let lecturerCount = 0
        let adminCount = 0
        let newUserCount = 0

        snapshot.forEach((doc) => {
          const userData = doc.data()

          // Count by role
          if (userData.role === "student") studentCount++
          else if (userData.role === "lecturer") lecturerCount++
          else if (userData.role === "admin") adminCount++

          // Count new users in the last week
          if (userData.createdAt) {
            const createdDate = new Date(userData.createdAt)
            if (createdDate >= oneWeekAgo) {
              newUserCount++
            }
          }
        })

        setCounts({
          students: studentCount,
          lecturers: lecturerCount,
          admins: adminCount,
          total: studentCount + lecturerCount + adminCount,
          newUsersThisWeek: newUserCount,
        })

        setLoading(false)
        setError(null)
      },
      (error) => {
        console.error("Error fetching user counts:", error)
        setLoading(false)
        setError("Failed to load user counts. Please check your permissions.")
      },
    )

    return () => unsubscribe()
  }, [])

  return { counts, loading, error }
}

// Hook to get real-time recent users
export function useRecentUsers(limit = 5) {
  const [users, setUsers] = useState<Array<UserProfile & { id: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Create a query for users
    const usersRef = collection(db, "users")
    const usersQuery = query(usersRef)

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        try {
          // Sort manually after fetching
          const sortedUsers = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .sort((a, b) => {
              // Sort by createdAt in descending order
              const aDate = a.createdAt
              const bDate = b.createdAt
              if (!aDate) return 1
              if (!bDate) return -1
              // Convert to timestamps if they're not already
              const aTime = aDate instanceof Date ? aDate.getTime() : new Date(aDate).getTime()
              const bTime = bDate instanceof Date ? bDate.getTime() : new Date(bDate).getTime()
              return bTime - aTime
            })
            .slice(0, limit) // Apply limit after sorting

          setUsers(sortedUsers as Array<UserProfile & { id: string }>)
          setLoading(false)
          setError(null)
        } catch (error) {
          console.error("Error processing users:", error)
          setLoading(false)
          setError("Failed to process user data.")
        }
      },
      (error) => {
        console.error("Error fetching recent users:", error)
        setLoading(false)
        setError("Failed to load recent users. Please check your permissions.")
      },
    )

    return () => unsubscribe()
  }, [limit])

  return { users, loading, error }
}

// Hook to get real-time course count
export function useCourseCount() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const coursesRef = collection(db, "courses")

    const unsubscribe = onSnapshot(
      coursesRef,
      (snapshot) => {
        setCount(snapshot.size)
        setLoading(false)
        setError(null)
      },
      (error) => {
        console.error("Error fetching course count:", error)
        setLoading(false)
        setError("Failed to load course count. Please check your permissions.")
      },
    )

    return () => unsubscribe()
  }, [])

  return { count, loading, error }
}

// Hook to get real-time courses for a lecturer
export function useLecturerCourses(lecturerId: string) {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!lecturerId) {
      setCourses([])
      setLoading(false)
      return
    }

    // Use a try-catch block to handle potential errors
    try {
      const coursesRef = collection(db, "courses")
      const lecturerCoursesQuery = query(coursesRef, where("instructorId", "==", lecturerId))

      const unsubscribe = onSnapshot(
        lecturerCoursesQuery,
        (snapshot) => {
          const lecturerCourses = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))

          setCourses(lecturerCourses)
          setLoading(false)
          setError(null)
        },
        (error) => {
          console.error("Error in lecturer courses snapshot:", error)
          setLoading(false)
          setError("Failed to load courses. Please check your permissions.")
          // Provide fallback data
          setCourses([])
        },
      )

      return () => unsubscribe()
    } catch (error) {
      console.error("Error setting up lecturer courses listener:", error)
      setLoading(false)
      setError("Failed to set up courses listener. Please check your permissions.")
      setCourses([])
      return () => {}
    }
  }, [lecturerId])

  return { courses, loading, error }
}

// Hook to get real-time student count for a lecturer's courses
export function useLecturerStudentCount(lecturerId: string) {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!lecturerId) {
      setCount(0)
      setLoading(false)
      return
    }

    // Use a try-catch block to handle potential errors
    try {
      // First get the lecturer's courses
      const coursesRef = collection(db, "courses")
      const lecturerCoursesQuery = query(coursesRef, where("instructorId", "==", lecturerId))

      const unsubscribe = onSnapshot(
        lecturerCoursesQuery,
        async (snapshot) => {
          try {
            const courseIds = snapshot.docs.map((doc) => doc.id)

            if (courseIds.length === 0) {
              setCount(0)
              setLoading(false)
              setError(null)
              return
            }

            // Then count students enrolled in these courses
            const usersRef = collection(db, "users")
            const usersSnapshot = await getDocs(usersRef).catch((error) => {
              console.error("Error fetching users for student count:", error)
              throw new Error("Failed to fetch users for student count")
            })

            let studentCount = 0
            usersSnapshot.forEach((doc) => {
              const userData = doc.data()
              if (userData.role === "student" && userData.enrolledCourses) {
                // Check if student is enrolled in any of the lecturer's courses
                const isEnrolled = userData.enrolledCourses.some((courseId: string) => courseIds.includes(courseId))
                if (isEnrolled) studentCount++
              }
            })

            setCount(studentCount)
            setLoading(false)
            setError(null)
          } catch (error) {
            console.error("Error processing student count:", error)
            setLoading(false)
            setError("Failed to process student count data.")
            setCount(0)
          }
        },
        (error) => {
          console.error("Error in lecturer courses snapshot for student count:", error)
          setLoading(false)
          setError("Failed to load student count. Please check your permissions.")
          setCount(0)
        },
      )

      return () => unsubscribe()
    } catch (error) {
      console.error("Error setting up lecturer student count listener:", error)
      setLoading(false)
      setError("Failed to set up student count listener. Please check your permissions.")
      setCount(0)
      return () => {}
    }
  }, [lecturerId])

  return { count, loading, error }
}

// Hook to get real-time pending assignments for a lecturer
export function useLecturerPendingAssignments(lecturerId: string) {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!lecturerId) {
      setCount(0)
      setLoading(false)
      return
    }

    // Use a try-catch block to handle potential errors
    try {
      const assignmentsRef = collection(db, "assignments")

      // Simplified query to avoid potential issues
      const pendingAssignmentsQuery = query(assignmentsRef, where("instructorId", "==", lecturerId))

      const unsubscribe = onSnapshot(
        pendingAssignmentsQuery,
        (snapshot) => {
          // Filter for submitted assignments client-side
          const submittedAssignments = snapshot.docs.filter((doc) => doc.data().status === "submitted")
          setCount(submittedAssignments.length)
          setLoading(false)
          setError(null)
        },
        (error) => {
          console.error("Error in pending assignments snapshot:", error)
          setLoading(false)
          setError("Failed to load pending assignments. Please check your permissions.")
          setCount(0)
        },
      )

      return () => unsubscribe()
    } catch (error) {
      console.error("Error setting up pending assignments listener:", error)
      setLoading(false)
      setError("Failed to set up pending assignments listener. Please check your permissions.")
      setCount(0)
      return () => {}
    }
  }, [lecturerId])

  return { count, loading, error }
}

// Hook to get real-time recent submissions for a lecturer
export function useRecentSubmissions(lecturerId: string, limitCount = 5) {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!lecturerId) {
      setSubmissions([])
      setLoading(false)
      return
    }

    // Use a try-catch block to handle potential errors
    try {
      const assignmentsRef = collection(db, "assignments")

      // Simplified query to avoid potential issues
      const submissionsQuery = query(assignmentsRef, where("instructorId", "==", lecturerId))

      const unsubscribe = onSnapshot(
        submissionsQuery,
        async (snapshot) => {
          try {
            // Filter for submitted assignments client-side
            const submittedDocs = snapshot.docs.filter((doc) => doc.data().status === "submitted")

            // Sort manually by submittedAt date
            const sortedDocs = submittedDocs.sort((a, b) => {
              const aDate = a.data().submittedAt
              const bDate = b.data().submittedAt
              if (!aDate) return 1
              if (!bDate) return -1

              // Handle different date formats
              const aTime =
                aDate instanceof Date
                  ? aDate.getTime()
                  : typeof aDate.toDate === "function"
                    ? aDate.toDate().getTime()
                    : new Date(aDate).getTime()
              const bTime =
                bDate instanceof Date
                  ? bDate.getTime()
                  : typeof bDate.toDate === "function"
                    ? bDate.toDate().getTime()
                    : new Date(bDate).getTime()

              return bTime - aTime // descending order
            })

            // Apply limit
            const limitedDocs = sortedDocs.slice(0, limitCount)

            // Process the submissions with additional details
            const submissionsWithDetails = await Promise.all(
              limitedDocs.map(async (doc) => {
                const submissionData = doc.data()
                let studentName = "Unknown Student"
                let courseName = "Unknown Course"

                try {
                  // Get student details if possible
                  if (submissionData.studentId) {
                    const studentDoc = await getDoc(doc(db, "users", submissionData.studentId)).catch(() => null)
                    if (studentDoc && studentDoc.exists()) {
                      const studentData = studentDoc.data()
                      studentName = studentData.fullName || studentData.email || "Unknown Student"
                    }
                  }
                } catch (error) {
                  console.error("Error fetching student details:", error)
                }

                try {
                  // Get course details if possible
                  if (submissionData.courseId) {
                    const courseDoc = await getDoc(doc(db, "courses", submissionData.courseId)).catch(() => null)
                    if (courseDoc && courseDoc.exists()) {
                      const courseData = courseDoc.data()
                      courseName = courseData.title || "Unknown Course"
                    }
                  }
                } catch (error) {
                  console.error("Error fetching course details:", error)
                }

                return {
                  id: doc.id,
                  ...submissionData,
                  studentName,
                  courseName,
                }
              }),
            )

            setSubmissions(submissionsWithDetails)
            setLoading(false)
            setError(null)
          } catch (error) {
            console.error("Error processing submissions:", error)
            setLoading(false)
            setError("Failed to process submissions data.")
            setSubmissions([])
          }
        },
        (error) => {
          console.error("Error fetching recent submissions:", error)
          setLoading(false)
          setError("Failed to load recent submissions. Please check your permissions.")
          setSubmissions([])
        },
      )

      return () => unsubscribe()
    } catch (error) {
      console.error("Error setting up recent submissions listener:", error)
      setLoading(false)
      setError("Failed to set up submissions listener. Please check your permissions.")
      setSubmissions([])
      return () => {}
    }
  }, [lecturerId, limitCount])

  return { submissions, loading, error }
}

// Hook to get real-time enrolled courses for a student
export function useStudentEnrolledCourses(studentId: string) {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!studentId) {
      setCourses([])
      setLoading(false)
      return
    }

    // Use a try-catch block to handle potential errors
    try {
      // First get the student's enrolled course IDs
      const userRef = doc(db, "users", studentId)

      const unsubscribe = onSnapshot(
        userRef,
        async (docSnapshot) => {
          try {
            if (!docSnapshot.exists()) {
              setCourses([])
              setLoading(false)
              setError(null)
              return
            }

            const userData = docSnapshot.data()
            const enrolledCourseIds = userData.enrolledCourses || []

            if (enrolledCourseIds.length === 0) {
              setCourses([])
              setLoading(false)
              setError(null)
              return
            }

            // Then get the details of each course
            const coursesData = await Promise.all(
              enrolledCourseIds.map(async (courseId: string) => {
                try {
                  const courseDoc = await getDoc(doc(db, "courses", courseId))
                  if (courseDoc.exists()) {
                    // Calculate progress based on completed lessons
                    const courseData = courseDoc.data()
                    const totalLessons = courseData.lessons?.length || 0
                    const completedLessons = userData.completedLessons?.[courseId]
                      ? Object.values(userData.completedLessons[courseId]).filter(Boolean).length
                      : 0
                    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

                    return {
                      id: courseDoc.id,
                      ...courseData,
                      progress,
                      completedLessons,
                      totalLessons,
                    }
                  }
                  return null
                } catch (error) {
                  console.error(`Error fetching course ${courseId}:`, error)
                  return null
                }
              }),
            )

            setCourses(coursesData.filter(Boolean))
            setLoading(false)
            setError(null)
          } catch (error) {
            console.error("Error processing enrolled courses:", error)
            setLoading(false)
            setError("Failed to process enrolled courses data.")
            setCourses([])
          }
        },
        (error) => {
          console.error("Error in student profile snapshot:", error)
          setLoading(false)
          setError("Failed to load enrolled courses. Please check your permissions.")
          setCourses([])
        },
      )

      return () => unsubscribe()
    } catch (error) {
      console.error("Error setting up enrolled courses listener:", error)
      setLoading(false)
      setError("Failed to set up enrolled courses listener. Please check your permissions.")
      setCourses([])
      return () => {}
    }
  }, [studentId])

  return { courses, loading, error }
}

// Hook to get real-time assignments for a student
export function useStudentAssignments(studentId: string) {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!studentId) {
      setAssignments([])
      setLoading(false)
      return
    }

    // Use a try-catch block to handle potential errors
    try {
      const assignmentsRef = collection(db, "assignments")
      const studentAssignmentsQuery = query(assignmentsRef, where("studentId", "==", studentId))

      const unsubscribe = onSnapshot(
        studentAssignmentsQuery,
        async (snapshot) => {
          try {
            const assignmentsWithDetails = await Promise.all(
              snapshot.docs.map(async (doc) => {
                const assignmentData = doc.data()
                let courseName = "Unknown Course"

                try {
                  // Get course details if possible
                  if (assignmentData.courseId) {
                    const courseDoc = await getDoc(doc(db, "courses", assignmentData.courseId)).catch(() => null)
                    if (courseDoc && courseDoc.exists()) {
                      const courseData = courseDoc.data()
                      courseName = courseData.title || "Unknown Course"
                    }
                  }
                } catch (error) {
                  console.error("Error fetching course details for assignment:", error)
                }

                return {
                  id: doc.id,
                  ...assignmentData,
                  course: courseName,
                }
              }),
            )

            setAssignments(assignmentsWithDetails)
            setLoading(false)
            setError(null)
          } catch (error) {
            console.error("Error processing student assignments:", error)
            setLoading(false)
            setError("Failed to process assignments data.")
            setAssignments([])
          }
        },
        (error) => {
          console.error("Error in student assignments snapshot:", error)
          setLoading(false)
          setError("Failed to load assignments. Please check your permissions.")
          setAssignments([])
        },
      )

      return () => unsubscribe()
    } catch (error) {
      console.error("Error setting up student assignments listener:", error)
      setLoading(false)
      setError("Failed to set up assignments listener. Please check your permissions.")
      setAssignments([])
      return () => {}
    }
  }, [studentId])

  return { assignments, loading, error }
}
