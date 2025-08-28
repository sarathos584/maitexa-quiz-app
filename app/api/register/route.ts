import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { User } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, company, college, experience, phone } = body

    // Validate required fields
    if (!name || !email || !company || !college || !experience || !phone) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const usersCollection = getCollection("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Create new user
    const newUser: User = {
      name,
      email,
      company,
      college,
      experience,
      phone,
      createdAt: new Date(),
    }

    const result = await usersCollection.insertOne(newUser)

    return NextResponse.json(
      {
        message: "User registered successfully",
        userId: result.insertedId.toString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
