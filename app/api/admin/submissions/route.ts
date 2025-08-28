import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { QuizSubmission } from "@/lib/models"

export async function GET() {
  try {
    const db = await getDatabase()
    const submissionsCollection = db.collection<QuizSubmission>("quiz_submissions")

    // Get recent submissions, sorted by completion date
    const submissions = await submissionsCollection.find({}).sort({ completedAt: -1 }).limit(50).toArray()

    // Format the data for the frontend
    const formattedSubmissions = submissions.map((submission) => ({
      _id: submission._id!.toString(),
      userName: submission.userName,
      userEmail: submission.userEmail,
      score: submission.score,
      percentage: submission.percentage,
      completedAt: submission.completedAt.toISOString(),
      certificateGenerated: submission.certificateGenerated,
    }))

    return NextResponse.json({ submissions: formattedSubmissions })
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}
