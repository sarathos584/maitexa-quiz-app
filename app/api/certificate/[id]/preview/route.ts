import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { QuizSubmission, User } from "@/lib/models"
import { ObjectId } from "mongodb"
import { generateCertificateId } from "@/lib/certificate"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid submission ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const submissionsCollection = db.collection<QuizSubmission>("quiz_submissions")
    const usersCollection = db.collection<User>("users")

    // Get submission details
    const submission = await submissionsCollection.findOne({
      _id: new ObjectId(id),
    })

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Check if user qualifies for certificate (90% or higher)
    if (submission.percentage < 90) {
      return NextResponse.json({ error: "Certificate not available - score below 90%" }, { status: 403 })
    }

    // Get user details
    const user = await usersCollection.findOne({ _id: new ObjectId(submission.userId) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prepare certificate preview data
    const certificate = {
      userName: user.name,
      userEmail: user.email,
      company: user.company,
      college: user.college,
      score: submission.score,
      percentage: submission.percentage,
      totalQuestions: submission.answers.length,
      completedAt: submission.completedAt.toISOString(),
      certificateId: generateCertificateId(submission.completedAt),
    }

    return NextResponse.json({ certificate })
  } catch (error) {
    console.error("Error fetching certificate preview:", error)
    return NextResponse.json({ error: "Failed to fetch certificate preview" }, { status: 500 })
  }
}
