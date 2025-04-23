"use client"

import type React from "react"

import { useState, useRef } from "react"
import { FileText, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { uploadFileToGoogleDrive } from "@/lib/services/file-service"

interface FileUploadProps {
  onUploadComplete: (fileData: {
    url: string
    downloadUrl?: string
    id: string
    name: string
    type: string
    provider: string
  }) => void
  onUploadError?: (error: Error) => void
  acceptedFileTypes?: string
  maxSizeMB?: number
  folderId?: string
  buttonText?: string
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  acceptedFileTypes = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt",
  maxSizeMB = 10,
  folderId,
  buttonText = "Upload File",
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Check file size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit`)
      return
    }

    setFile(selectedFile)
    setError(null)
  }

  const handleUpload = async () => {
    if (!file) return

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

      const fileData = await uploadFileToGoogleDrive(file, folderId)

      clearInterval(progressInterval)
      setProgress(100)

      onUploadComplete(fileData)

      // Reset after successful upload
      setTimeout(() => {
        setFile(null)
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
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      {!file ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-6">
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Drag and drop your file here or click to browse</p>
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
            className="hidden"
          />
        </div>
      ) : (
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)}MB</p>
              </div>
            </div>
            {!uploading && (
              <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
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
                Upload
              </Button>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
