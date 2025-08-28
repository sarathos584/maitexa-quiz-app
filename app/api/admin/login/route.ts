import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getCollection } from "@/lib/mongodb"
import type { Admin } from "@/lib/models"
import { jsonErrorResponse, jsonSuccess } from "@/lib/api"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return jsonErrorResponse(null, 400, "Email and password are required")
    }

    const adminCollection = await getCollection("admins")

    // Find admin by email
    const admin = await adminCollection.findOne({ email: email.toLowerCase() })

    if (!admin) {
      return jsonErrorResponse(null, 401, "Invalid credentials")
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password)

    if (!isPasswordValid) {
      return jsonErrorResponse(null, 401, "Invalid credentials")
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        adminId: admin._id.toString(),
        email: admin.email,
        name: admin.name,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    return jsonSuccess({
      message: "Login successful",
      token,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
      },
    })
  } catch (error) {
    console.error("Admin login error:", error)
    return jsonErrorResponse(error, 500, "Internal server error", { endpoint: "admin/login" })
  }
}
