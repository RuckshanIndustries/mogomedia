import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function enrollInCourse(userId: string, courseId: string) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      enrolledCourses: arrayUnion(courseId),
    });
  } catch (error) {
    throw new Error("Failed to enroll in course");
  }
}
