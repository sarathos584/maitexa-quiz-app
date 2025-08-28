import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { QuizSubmission, User } from "@/lib/models"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const certificateId = searchParams.get("certificateId")

    if (!certificateId) {
      return NextResponse.json({ error: "certificateId is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const submissions = db.collection("quiz_submissions")
    const users = db.collection("users")

    const submission = await submissions.findOne({ certificateId })
    if (!submission) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    const user = await users.findOne({ email: submission.userEmail })

    const certificate = {
      userName: submission.userName,
      userEmail: submission.userEmail,
      company: (user as any)?.company || "",
      college: (user as any)?.college || "",
      percentage: submission.percentage,
      totalQuestions: submission.answers?.length || 0,
      completedAt: submission.completedAt.toISOString(),
      certificateId: certificateId,
      excellence: submission.percentage >= 90,
    }

    return NextResponse.json({ certificate })
  } catch (error) {
    console.error("Certificate preview error:", error)
    return NextResponse.json({ error: "Failed to load certificate" }, { status: 500 })
  }
}
