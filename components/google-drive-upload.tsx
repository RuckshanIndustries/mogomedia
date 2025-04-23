"use client"

import type React from "react"

import { useState, useRef } from "react"
import { FileText, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { uploadFile } from "@/lib/services/google-drive-service"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface GoogleDriveUploadProps {
  onUploadComplete: (fileData: any) => void
  onUploadError?: (error: Error) => void
  acceptedFileTypes?: string
  maxSizeMB?: number
  courseId?: string
  lessonId?: string
  assignmentId?: string
  folderPath?: string
  buttonText?: string
  multiple?: boolean
}

export function GoogleDriveUpload({
  onUploadComplete,
  onUploadError,
  acceptedFileTypes = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt",
  maxSizeMB = 10,
  courseId,
  lessonId,
  assignmentId,
  folderPath,
  buttonText = "Upload File",
  multiple = false,
}: GoogleDriveUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : []

    if (selectedFiles.length === 0) return

    // Check file sizes
    const oversizedFiles = selectedFiles.filter((file) => file.size > maxSizeMB * 1024 * 1024)

    if (oversizedFiles.length > 0) {
      setError(`One or more files exceed the ${maxSizeMB}MB limit`)
      return
    }

    if (multiple) {
      setFiles(selectedFiles)
    } else {
      setFiles([selectedFiles[0]])
    }

    setError(null)
  }

  const handleUpload = async () => {
    if (files.length === 0 || !user) return

    setUploading(true)
    setProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 5
        })
      }, 200)

      // Upload each file
      const uploadPromises = files.map((file) =>
        uploadFile(file, user.uid, {
          courseId,
          lessonId,
          assignmentId,
          folderPath,
        }),
      )

      const uploadedFiles = await Promise.all(uploadPromises)

      clearInterval(progressInterval)
      setProgress(100)

      if (multiple) {
        onUploadComplete(uploadedFiles)
      } else {
        onUploadComplete(uploadedFiles[0])
      }

      toast({
        title: "Upload successful",
        description: multiple ? `${uploadedFiles.length} files uploaded successfully` : "File uploaded successfully",
      })

      // Reset after successful upload
      setTimeout(() => {
        setFiles([])
        setProgress(0)
        setUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }, 1000)
    } catch (error) {
      setError("Upload failed. Please try again.")
      setUploading(false)
      if (onUploadError && error instanceof Error) {
        onUploadError(error)
      }

      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))

    if (files.length === 1) {
      setError(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="space-y-4">
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-6">
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Drag and drop your file{multiple ? "s" : ""} here or click to browse</p>
            <p className="text-xs text-muted-foreground">
              Supported file types: {acceptedFileTypes.replace(/\./g, "").replace(/,/g, ", ")}
            </p>
            <p className="text-xs text-muted-foreground">Maximum file size: {maxSizeMB}MB</p>
          </div>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {buttonText}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={acceptedFileTypes}
            multiple={multiple}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {files.map((file, index) => (
            <div key={index} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)}MB</p>
                  </div>
                </div>
                {!uploading && (
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(index)} className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {uploading && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {!uploading && (
            <div className="mt-4">
              <Button onClick={handleUpload} className="w-full">
                Upload {files.length > 1 ? `${files.length} Files` : "File"}
              </Button>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
