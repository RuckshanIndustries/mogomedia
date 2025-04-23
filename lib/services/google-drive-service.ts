import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Interface for file metadata
export interface FileMetadata {
  id: string
  name: string
  type: string
  size: number
  url: string
  downloadUrl: string
  path: string
  uploadedBy: string
  uploadedAt: any
  courseId?: string
  lessonId?: string
  assignmentId?: string
}

/**
 * Upload a file to Google Drive (or Firebase Storage as fallback)
 * and store metadata in Firestore
 */
export async function uploadFile(
  file: File,
  userId: string,
  options: {
    courseId?: string
    lessonId?: string
    assignmentId?: string
    folderPath?: string
  } = {},
): Promise<FileMetadata> {
  try {
    // First try to upload to Google Drive using the Google Drive API
    // This is a placeholder for the actual Google Drive API implementation
    // In a real implementation, you would use the Google Drive API client

    // For now, we'll use Firebase Storage as a fallback
    const storage = getStorage()

    // Create a path for the file
    const { courseId, lessonId, assignmentId, folderPath } = options
    let path = folderPath || "uploads"

    if (courseId) {
      path += `/courses/${courseId}`
    }

    if (lessonId) {
      path += `/lessons/${lessonId}`
    }

    if (assignmentId) {
      path += `/assignments/${assignmentId}`
    }

    path += `/${Date.now()}_${file.name}`

    // Upload the file to Firebase Storage
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    const url = await getDownloadURL(snapshot.ref)

    // Create metadata document in Firestore
    const fileMetadata: Omit<FileMetadata, "id"> = {
      name: file.name,
      type: file.type,
      size: file.size,
      url,
      downloadUrl: url,
      path,
      uploadedBy: userId,
      uploadedAt: serverTimestamp(),
      ...(courseId && { courseId }),
      ...(lessonId && { lessonId }),
      ...(assignmentId && { assignmentId }),
    }

    const docRef = await addDoc(collection(db, "files"), fileMetadata)

    return {
      id: docRef.id,
      ...fileMetadata,
    } as FileMetadata
  } catch (error) {
    console.error("Error uploading file:", error)
    throw new Error("Failed to upload file. Please try again.")
  }
}

/**
 * Get file metadata from Firestore
 */
export async function getFileMetadata(fileId: string): Promise<FileMetadata | null> {
  try {
    const docRef = await db.collection("files").doc(fileId).get()

    if (!docRef.exists) {
      return null
    }

    return {
      id: docRef.id,
      ...docRef.data(),
    } as FileMetadata
  } catch (error) {
    console.error("Error getting file metadata:", error)
    return null
  }
}

/**
 * Delete a file from Google Drive (or Firebase Storage) and remove metadata from Firestore
 */
export async function deleteFile(fileId: string, userId: string): Promise<boolean> {
  try {
    const fileMetadata = await getFileMetadata(fileId)

    if (!fileMetadata) {
      throw new Error("File not found")
    }

    // Check if the user has permission to delete the file
    if (fileMetadata.uploadedBy !== userId) {
      throw new Error("You don't have permission to delete this file")
    }

    // Delete the file from Firebase Storage
    const storage = getStorage()
    const fileRef = ref(storage, fileMetadata.path)
    await fileRef.delete()

    // Delete the metadata from Firestore
    await db.collection("files").doc(fileId).delete()

    return true
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}
