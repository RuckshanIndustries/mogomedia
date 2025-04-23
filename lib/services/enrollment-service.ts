import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  enrolledAt: Date
  completedLessons: string[] // Array of lesson IDs
  completedQuizzes: string[] // Array of quiz IDs
  completedAssignments: string[] // Array of assignment IDs
  progress: number // Percentage of course completed
}

export interface LessonProgress {
  userId: string
  lessonId: string
  courseId: string
  completed: boolean
  lastAccessedAt: Date
}

export interface QuizAttempt {
  id: string
  userId: string
  quizId: string
  courseId: string
  answers: { questionId: string; selectedOptionIndex: number }[]
  score: number
  completedAt: Date
}

export interface AssignmentSubmission {
  id: string
  userId: string
  assignmentId: string
  courseId: string
  fileUrl: string
  fileName: string
  submittedAt: Date
  grade?: number
  feedback?: string
  gradedAt?: Date
}

// Enrollment functions
export async function getEnrollmentsByUser(userId: string) {
  try {
    const enrollmentsCollection = collection(db, "enrollments")
    const q = query(enrollmentsCollection, where("userId", "==", userId))
    const enrollmentsSnapshot = await getDocs(q)
    return enrollmentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Enrollment[]
  } catch (error) {
    console.error("Error fetching enrollments:", error)
    // If there's a permission error, return an empty array instead of throwing
    if (error.code === "permission-denied") {
      console.warn("Permission denied when fetching enrollments. Returning empty array.")
      return []
    }
    throw error
  }
}

export async function getEnrollmentByCourseAndUser(courseId: string, userId: string) {
  try {
    const enrollmentsCollection = collection(db, "enrollments")
    const q = query(enrollmentsCollection, where("courseId", "==", courseId), where("userId", "==", userId))
    const enrollmentsSnapshot = await getDocs(q)

    if (enrollmentsSnapshot.empty) {
      return null
    }

    const enrollmentDoc = enrollmentsSnapshot.docs[0]
    return { id: enrollmentDoc.id, ...enrollmentDoc.data() } as Enrollment
  } catch (error) {
    console.error("Error fetching enrollment:", error)
    // If there's a permission error, return null instead of throwing
    if (error.code === "permission-denied") {
      console.warn("Permission denied when fetching enrollment. Returning null.")
      return null
    }
    throw error
  }
}

export async function enrollUserInCourse(userId: string, courseId: string) {
  // Check if already enrolled
  const existingEnrollment = await getEnrollmentByCourseAndUser(courseId, userId)
  if (existingEnrollment) {
    return existingEnrollment
  }

  const now = new Date()
  const enrollmentData: Omit<Enrollment, "id"> = {
    userId,
    courseId,
    enrolledAt: now,
    completedLessons: [],
    completedQuizzes: [],
    completedAssignments: [],
    progress: 0,
  }

  const enrollmentRef = await addDoc(collection(db, "enrollments"), enrollmentData)
  return { id: enrollmentRef.id, ...enrollmentData } as Enrollment
}

export async function updateEnrollmentProgress(enrollmentId: string, progress: Partial<Enrollment>) {
  const enrollmentRef = doc(db, "enrollments", enrollmentId)
  await updateDoc(enrollmentRef, progress)
}

// Lesson progress functions
export async function markLessonAsCompleted(userId: string, courseId: string, lessonId: string) {
  const enrollment = await getEnrollmentByCourseAndUser(courseId, userId)

  if (!enrollment) {
    throw new Error("User is not enrolled in this course")
  }

  // Update lesson progress
  const lessonProgressRef = doc(db, "lessonProgress", `${userId}_${lessonId}`)
  await setDoc(lessonProgressRef, {
    userId,
    lessonId,
    courseId,
    completed: true,
    lastAccessedAt: new Date(),
  })

  // Update enrollment
  if (!enrollment.completedLessons.includes(lessonId)) {
    const updatedCompletedLessons = [...enrollment.completedLessons, lessonId]

    // Get total lessons for this course to calculate progress
    const lessonsCollection = collection(db, "lessons")
    const q = query(lessonsCollection, where("courseId", "==", courseId))
    const lessonsSnapshot = await getDocs(q)
    const totalLessons = lessonsSnapshot.size

    const progress = totalLessons > 0 ? Math.round((updatedCompletedLessons.length / totalLessons) * 100) : 0

    await updateEnrollmentProgress(enrollment.id, {
      completedLessons: updatedCompletedLessons,
      progress,
    })
  }
}

// Quiz attempt functions
export async function submitQuizAttempt(
  userId: string,
  courseId: string,
  quizId: string,
  answers: { questionId: string; selectedOptionIndex: number }[],
) {
  // Get the quiz to calculate score
  const quizDoc = await getDoc(doc(db, "quizzes", quizId))

  if (!quizDoc.exists()) {
    throw new Error("Quiz not found")
  }

  const quiz = quizDoc.data() as any
  const questions = quiz.questions || []

  // Calculate score
  let correctAnswers = 0
  answers.forEach((answer) => {
    const question = questions.find((q: any) => q.id === answer.questionId)
    if (question && question.correctOptionIndex === answer.selectedOptionIndex) {
      correctAnswers++
    }
  })

  const score = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0

  // Save the attempt
  const now = new Date()
  const attemptData = {
    userId,
    quizId,
    courseId,
    answers,
    score,
    completedAt: now,
  }

  const attemptRef = await addDoc(collection(db, "quizAttempts"), attemptData)

  // Update enrollment progress
  const enrollment = await getEnrollmentByCourseAndUser(courseId, userId)

  if (enrollment && !enrollment.completedQuizzes.includes(quizId)) {
    const updatedCompletedQuizzes = [...enrollment.completedQuizzes, quizId]
    await updateEnrollmentProgress(enrollment.id, {
      completedQuizzes: updatedCompletedQuizzes,
    })
  }

  return { id: attemptRef.id, ...attemptData } as QuizAttempt
}

// Assignment submission functions
export async function submitAssignment(
  userId: string,
  courseId: string,
  assignmentId: string,
  fileUrl: string,
  fileName: string,
) {
  const now = new Date()
  const submissionData = {
    userId,
    assignmentId,
    courseId,
    fileUrl,
    fileName,
    submittedAt: now,
  }

  const submissionRef = await addDoc(collection(db, "assignmentSubmissions"), submissionData)

  // Update enrollment progress
  const enrollment = await getEnrollmentByCourseAndUser(courseId, userId)

  if (enrollment && !enrollment.completedAssignments.includes(assignmentId)) {
    const updatedCompletedAssignments = [...enrollment.completedAssignments, assignmentId]
    await updateEnrollmentProgress(enrollment.id, {
      completedAssignments: updatedCompletedAssignments,
    })
  }

  return { id: submissionRef.id, ...submissionData } as AssignmentSubmission
}

export async function gradeAssignment(submissionId: string, grade: number, feedback: string) {
  const submissionRef = doc(db, "assignmentSubmissions", submissionId)
  await updateDoc(submissionRef, {
    grade,
    feedback,
    gradedAt: new Date(),
  })
}
