import type { UserRole } from "@/contexts/auth-context"

export function hasRequiredRole(userRole: UserRole | undefined, requiredRoles: UserRole[]): boolean {
  if (!userRole) return false
  return requiredRoles.includes(userRole)
}

// Helper function to check if a user has admin privileges
export function isAdmin(userRole: UserRole | undefined): boolean {
  return userRole === "admin"
}

// Helper function to check if a user has lecturer privileges (includes admin)
export function isLecturer(userRole: UserRole | undefined): boolean {
  return userRole === "lecturer" || userRole === "admin"
}

// Helper function to check if a user has student privileges (all roles can access student content)
export function isStudent(userRole: UserRole | undefined): boolean {
  return userRole === "student" || userRole === "lecturer" || userRole === "admin"
}
