"use client"

import type React from "react"

import { useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CreateAdminUser() {
  const [email, setEmail] = useState("nipun@mogomedia.com")
  const [password, setPassword] = useState("nipun123")
  const [displayName, setDisplayName] = useState("Nipun")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create admin document in Firestore
      const now = new Date()
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        displayName,
        role: "admin",
        createdAt: now,
        lastLogin: now,
        permissions: {
          manageUsers: true,
          manageCourses: true,
          viewAnalytics: true,
        },
        activityLogs: [],
      })

      setResult({
        success: true,
        message: `Admin user created successfully with UID: ${user.uid}`,
      })
    } catch (error: any) {
      console.error("Error creating admin user:", error)
      setResult({
        success: false,
        message: error.message || "Failed to create admin user",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Create Admin User</CardTitle>
          <CardDescription>Create a new admin user in Firebase Authentication and Firestore</CardDescription>
        </CardHeader>
        <form onSubmit={handleCreateAdmin}>
          <CardContent className="space-y-4">
            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Admin User"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
