"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRoleGuard } from "@/hooks/use-role-guard"
import { Loader2, Search, Trash2, UserPlus, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { collection, doc, getDocs, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth, type UserRole } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
  uid: string
  email: string
  displayName: string
  role: UserRole
  createdAt: Date
  lastLogin?: Date
  profileImageUrl?: string
  // Role-specific fields will be added dynamically
  [key: string]: any
}

export default function UsersPage() {
  const { isAuthorized, loading: authLoading } = useRoleGuard(["admin"])
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    role: "student" as UserRole,
  })
  const { toast } = useToast()
  const router = useRouter()
  const { createUser, userData } = useAuth()

  useEffect(() => {
    if (!authLoading && !isAuthorized) {
      router.push("/dashboard")
    }
  }, [authLoading, isAuthorized, router])

  useEffect(() => {
    const fetchUsers = async () => {
      if (!userData || userData.role !== "admin") {
        router.push("/dashboard")
        return
      }

      try {
        setLoading(true)
        const usersCollection = collection(db, "users")
        const usersSnapshot = await getDocs(usersCollection)

        const usersData = usersSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            uid: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            lastLogin: data.lastLogin?.toDate ? data.lastLogin.toDate() : data.lastLogin,
          }
        })

        setUsers(usersData)
        setFilteredUsers(usersData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching users:", error)
        // Show a more user-friendly error message
        alert("Error fetching users: " + (error.message || "Unknown error"))
        setLoading(false)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthorized) {
      fetchUsers()
    }
  }, [isAuthorized, toast, userData, router])

  useEffect(() => {
    let result = [...users]

    // Filter by role if not "all"
    if (activeTab !== "all") {
      result = result.filter((user) => user.role === activeTab)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (user) =>
          (user.displayName && user.displayName.toLowerCase().includes(query)) ||
          (user.email && user.email.toLowerCase().includes(query)),
      )
    }

    setFilteredUsers(result)
  }, [users, activeTab, searchQuery])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value as UserRole }))
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Use the enhanced createUser function from auth context
      await createUser(formData.email, formData.password, formData.displayName, formData.role)

      toast({
        title: "Success",
        description: `User ${formData.displayName} created successfully.`,
      })

      // Refresh user list
      const usersCollection = collection(db, "users")
      const usersSnapshot = await getDocs(usersCollection)
      const usersData = usersSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as User[]
      setUsers(usersData)

      // Reset form and close dialog
      setFormData({
        displayName: "",
        email: "",
        password: "",
        role: "student",
      })
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error("Error creating user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async (uid: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        // Delete user from Firestore
        await deleteDoc(doc(db, "users", uid))

        // Update local state
        setUsers((prev) => prev.filter((user) => user.uid !== uid))

        toast({
          title: "Success",
          description: "User deleted successfully.",
        })
      } catch (error) {
        console.error("Error deleting user:", error)
        toast({
          title: "Error",
          description: "Failed to delete user. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const viewUserDetails = (user: User) => {
    setSelectedUser(user)
  }

  const formatDate = (date: any) => {
    if (!date) return "N/A"

    if (date instanceof Date) {
      return date.toLocaleString()
    }

    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleString()
    }

    return new Date(date).toLocaleString()
  }

  if (authLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="flex flex-col gap-6 container mx-auto max-w-7xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage users, assign roles, and control access to the platform.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the platform. They will receive an email with their login credentials.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="displayName">Full Name</Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="lecturer">Lecturer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create User
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage user accounts and their roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="student">Students</TabsTrigger>
              <TabsTrigger value="lecturer">Lecturers</TabsTrigger>
              <TabsTrigger value="admin">Admins</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-0">
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.uid}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                {user.profileImageUrl ? (
                                  <AvatarImage
                                    src={user.profileImageUrl || "/placeholder.svg"}
                                    alt={user.displayName}
                                  />
                                ) : null}
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                  {user.displayName?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{user.displayName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === "admin"
                                  ? "destructive"
                                  : user.role === "lecturer"
                                    ? "outline"
                                    : "secondary"
                              }
                            >
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell>{formatDate(user.lastLogin)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => viewUserDetails(user)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.uid)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
                  <div className="rounded-full bg-primary/10 p-3">
                    <UserPlus className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">No users found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "No users match your search criteria." : "Get started by adding a new user."}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>Detailed information for {selectedUser.displayName}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {selectedUser.profileImageUrl ? (
                    <AvatarImage
                      src={selectedUser.profileImageUrl || "/placeholder.svg"}
                      alt={selectedUser.displayName}
                    />
                  ) : null}
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {selectedUser.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{selectedUser.displayName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <div className="mt-1">
                    <Badge
                      variant={
                        selectedUser.role === "admin"
                          ? "destructive"
                          : selectedUser.role === "lecturer"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">User ID</h4>
                  <p className="text-sm text-muted-foreground">{selectedUser.uid}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Created At</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Last Login</h4>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedUser.lastLogin)}</p>
                </div>
              </div>

              {/* Role-specific information */}
              {selectedUser.role === "student" && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Student Information</h4>
                  <div className="space-y-2">
                    <div>
                      <h5 className="text-xs font-medium">Enrolled Courses</h5>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.enrolledCourses?.length
                          ? `${selectedUser.enrolledCourses.length} courses`
                          : "No enrolled courses"}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium">Completed Lessons</h5>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.completedLessons && Object.keys(selectedUser.completedLessons).length > 0
                          ? `Lessons completed in ${Object.keys(selectedUser.completedLessons).length} courses`
                          : "No completed lessons"}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium">Assignments Submitted</h5>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.assignmentsSubmitted && Object.keys(selectedUser.assignmentsSubmitted).length > 0
                          ? `${Object.keys(selectedUser.assignmentsSubmitted).length} assignments submitted`
                          : "No assignments submitted"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.role === "lecturer" && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Lecturer Information</h4>
                  <div className="space-y-2">
                    <div>
                      <h5 className="text-xs font-medium">Assigned Courses</h5>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.assignedCourses?.length
                          ? `${selectedUser.assignedCourses.length} courses`
                          : "No assigned courses"}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium">Created Assignments</h5>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.createdAssignments?.length
                          ? `${selectedUser.createdAssignments.length} assignments created`
                          : "No assignments created"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.role === "admin" && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Admin Information</h4>
                  <div className="space-y-2">
                    <div>
                      <h5 className="text-xs font-medium">Permissions</h5>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedUser.permissions?.manageUsers && <Badge variant="outline">Manage Users</Badge>}
                        {selectedUser.permissions?.manageCourses && <Badge variant="outline">Manage Courses</Badge>}
                        {selectedUser.permissions?.viewAnalytics && <Badge variant="outline">View Analytics</Badge>}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium">Activity Logs</h5>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.activityLogs?.length
                          ? `${selectedUser.activityLogs.length} activities logged`
                          : "No activity logs"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
