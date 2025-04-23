"use client"

import { useState } from "react"
import { useAuth, type UserRole } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface UserRoleManagerProps {
  userId: string
  currentRole: UserRole
  userName: string
}

export function UserRoleManager({ userId, currentRole, userName }: UserRoleManagerProps) {
  const [role, setRole] = useState<UserRole>(currentRole)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const { updateUserRole } = useAuth()

  const handleRoleChange = async () => {
    if (role === currentRole) {
      setResult({
        success: false,
        message: "No change in role detected",
      })
      return
    }

    setIsSubmitting(true)
    setResult(null)

    try {
      await updateUserRole(userId, role)
      setResult({
        success: true,
        message: `Role updated successfully for ${userName}`,
      })
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Failed to update user role",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update User Role</CardTitle>
        <CardDescription>Change the role for user: {userName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="lecturer">Lecturer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {role === "admin"
              ? "Admins have full access to all features and can manage users and courses."
              : role === "lecturer"
                ? "Lecturers can create and manage courses, assignments, and quizzes."
                : "Students can enroll in courses and access learning materials."}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleRoleChange} disabled={isSubmitting || role === currentRole} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Role
        </Button>
      </CardFooter>
    </Card>
  )
}
