import jwt from "jsonwebtoken"
import { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface AdminPayload {
  adminId: string
  email: string
  name: string
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload
    return decoded
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export function getAdminTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }
  return null
}

export function requireAdminAuth(request: NextRequest): AdminPayload {
  const token = getAdminTokenFromRequest(request)
  if (!token) {
    throw new Error("No authorization token provided")
  }

  const payload = verifyAdminToken(token)
  if (!payload) {
    throw new Error("Invalid or expired token")
  }

  return payload
}
