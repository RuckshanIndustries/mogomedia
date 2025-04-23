import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { uploadFileToDrive } from "@/lib/google-drive"

// Upload file to Firebase Storage
export async function uploadFileToStorage(file: File, path: string) {
  const storageRef = ref(storage, path)
  const snapshot = await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(snapshot.ref)

  return {
    url: downloadURL,
    path,
    name: file.name,
    type: file.type,
    size: file.size,
  }
}

// Upload file to Google Drive (if configured)
export async function uploadFileToGoogleDrive(file: File, folderId?: string) {
  try {
    // First try Google Drive
    const driveFile = await uploadFileToDrive(file, folderId)
    return {
      url: driveFile.webViewLink,
      downloadUrl: driveFile.webContentLink,
      id: driveFile.id,
      name: driveFile.name,
      type: driveFile.mimeType,
      provider: "google-drive",
    }
  } catch (error) {
    console.error("Error uploading to Google Drive, falling back to Firebase Storage:", error)

    // Fall back to Firebase Storage
    const path = `uploads/${Date.now()}_${file.name}`
    const storageFile = await uploadFileToStorage(file, path)

    return {
      url: storageFile.url,
      downloadUrl: storageFile.url,
      id: path,
      name: storageFile.name,
      type: storageFile.type,
      provider: "firebase-storage",
    }
  }
}

// Upload assignment submission
export async function uploadAssignmentSubmission(file: File, courseId: string, assignmentId: string, userId: string) {
  const path = `submissions/${courseId}/${assignmentId}/${userId}/${Date.now()}_${file.name}`

  try {
    // Try Google Drive first with a folder structure
    const folderId = `${courseId}_${assignmentId}_submissions` // This would be created/managed elsewhere
    return await uploadFileToGoogleDrive(file, folderId)
  } catch (error) {
    console.error("Error uploading to Google Drive, falling back to Firebase Storage:", error)
    return await uploadFileToStorage(file, path)
  }
}

// Upload course material
export async function uploadCourseMaterial(file: File, courseId: string, lessonId?: string) {
  const path = lessonId ? `courses/${courseId}/lessons/${lessonId}/${file.name}` : `courses/${courseId}/${file.name}`

  try {
    // Try Google Drive first
    const folderId = lessonId ? `${courseId}_${lessonId}_materials` : `${courseId}_materials`
    return await uploadFileToGoogleDrive(file, folderId)
  } catch (error) {
    console.error("Error uploading to Google Drive, falling back to Firebase Storage:", error)
    return await uploadFileToStorage(file, path)
  }
}
