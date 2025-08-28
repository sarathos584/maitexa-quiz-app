import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getCollection } from "@/lib/mongodb"
import type { Admin } from "@/lib/models"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const adminCollection = await getCollection("admins")
    
    // Find admin by email
    const admin = await adminCollection.findOne({ email: email.toLowerCase() })
    
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password)
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin._id.toString(),
        email: admin.email,
        name: admin.name 
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    )

    return NextResponse.json({
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
