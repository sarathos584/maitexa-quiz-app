import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export interface AdminTokenPayload {
  adminId: string
  email: string
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload
    return decoded
  } catch (error) {
    return null
  }
}

export function generateAdminToken(adminId: string, email: string): string {
  return jwt.sign({ adminId, email }, JWT_SECRET, { expiresIn: "24h" })
}
