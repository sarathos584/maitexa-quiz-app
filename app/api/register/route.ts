import { type NextRequest } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { User } from "@/lib/models"
import { jsonErrorResponse, jsonSuccess } from "@/lib/api"
import { ObjectId } from "mongodb"

type DbUser = Omit<User, "_id"> & {
  _id?: ObjectId
  university?: string
  course?: string
  graduationYear?: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, college, university, course, graduationYear, phone, email } = body

    // Validate required fields
    if (!fullName || !college || !university || !course || !graduationYear || !phone || !email) {
      return jsonErrorResponse(null, 400, "All fields are required")
    }

    const usersCollection = await getCollection<DbUser>("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return jsonErrorResponse(null, 409, "User with this email already exists")
    }

    // Create new user
    const newUser: DbUser = {
      name: fullName,
      email,
      company: "",
      college,
      experience: "",
      phone,
      createdAt: new Date(),
      // Extended fields for education
      university,
      course,
      graduationYear: Number(graduationYear),
    }

    const result = await usersCollection.insertOne(newUser)

    return jsonSuccess(
      {
        message: "User registered successfully",
        userId: result.insertedId.toString(),
      },
      201,
    )
  } catch (error) {
    console.error("Registration error:", error)
    return jsonErrorResponse(error, 500, "Internal server error", { endpoint: "register" })
  }
}
