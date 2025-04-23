import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Course {
  id: string
  title: string
  description: string
  coverImage: string
  category: string
  lecturerId: string
  createdAt: Date
  updatedAt: Date
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  description: string
  content: string
  contentType: "text" | "video" | "file"
  contentUrl?: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Assignment {
  id: string
  courseId: string
  title: string
  instructions: string
  deadline: Date
  createdAt: Date
  updatedAt: Date
}

export interface Quiz {
  id: string
  courseId: string
  lessonId?: string
  title: string
  questions: QuizQuestion[]
  createdAt: Date
  updatedAt: Date
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctOptionIndex: number
}

// Course functions
export async function getCourses() {
  const coursesCollection = collection(db, "courses")
  const coursesSnapshot = await getDocs(coursesCollection)
  return coursesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Course[]
}

export async function getCoursesByLecturer(lecturerId: string) {
  const coursesCollection = collection(db, "courses")
  const q = query(coursesCollection, where("lecturerId", "==", lecturerId))
  const coursesSnapshot = await getDocs(q)
  return coursesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Course[]
}

export async function getCourseById(courseId: string) {
  const courseDoc = await getDoc(doc(db, "courses", courseId))
  if (!courseDoc.exists()) {
    throw new Error("Course not found")
  }
  return { id: courseDoc.id, ...courseDoc.data() } as Course
}

export async function createCourse(courseData: Omit<Course, "id" | "createdAt" | "updatedAt">) {
  const now = new Date()
  const courseRef = await addDoc(collection(db, "courses"), {
    ...courseData,
    createdAt: now,
    updatedAt: now,
  })
  return { id: courseRef.id, ...courseData, createdAt: now, updatedAt: now } as Course
}

export async function updateCourse(
  courseId: string,
  courseData: Partial<Omit<Course, "id" | "createdAt" | "updatedAt">>,
) {
  const courseRef = doc(db, "courses", courseId)
  await updateDoc(courseRef, {
    ...courseData,
    updatedAt: new Date(),
  })
}

export async function deleteCourse(courseId: string) {
  await deleteDoc(doc(db, "courses", courseId))
}

// Lesson functions
export async function getLessonsByCourse(courseId: string) {
  const lessonsCollection = collection(db, "lessons")
  const q = query(lessonsCollection, where("courseId", "==", courseId))
  const lessonsSnapshot = await getDocs(q)
  return lessonsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Lesson[]
}

export async function getLessonById(lessonId: string) {
  const lessonDoc = await getDoc(doc(db, "lessons", lessonId))
  if (!lessonDoc.exists()) {
    throw new Error("Lesson not found")
  }
  return { id: lessonDoc.id, ...lessonDoc.data() } as Lesson
}

export async function createLesson(lessonData: Omit<Lesson, "id" | "createdAt" | "updatedAt">) {
  const now = new Date()
  const lessonRef = await addDoc(collection(db, "lessons"), {
    ...lessonData,
    createdAt: now,
    updatedAt: now,
  })
  return { id: lessonRef.id, ...lessonData, createdAt: now, updatedAt: now } as Lesson
}

export async function updateLesson(
  lessonId: string,
  lessonData: Partial<Omit<Lesson, "id" | "createdAt" | "updatedAt">>,
) {
  const lessonRef = doc(db, "lessons", lessonId)
  await updateDoc(lessonRef, {
    ...lessonData,
    updatedAt: new Date(),
  })
}

export async function deleteLesson(lessonId: string) {
  await deleteDoc(doc(db, "lessons", lessonId))
}

// Assignment functions
export async function getAssignmentsByCourse(courseId: string) {
  const assignmentsCollection = collection(db, "assignments")
  const q = query(assignmentsCollection, where("courseId", "==", courseId))
  const assignmentsSnapshot = await getDocs(q)
  return assignmentsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Assignment[]
}

// Quiz functions
export async function getQuizzesByCourse(courseId: string) {
  const quizzesCollection = collection(db, "quizzes")
  const q = query(quizzesCollection, where("courseId", "==", courseId))
  const quizzesSnapshot = await getDocs(q)
  return quizzesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Quiz[]
}
