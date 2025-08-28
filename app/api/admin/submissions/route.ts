import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { requireAdminAuth } from "@/lib/auth"
import type { QuizSubmission } from "@/lib/models"
import { jsonErrorResponse, jsonSuccess } from "@/lib/api"

export async function GET(request: Request) {
  try {
    // Verify admin authentication
    requireAdminAuth(request as any)

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

    return jsonSuccess({ submissions: formattedSubmissions })
  } catch (error) {
    console.error("Error fetching submissions:", error)
    if (error instanceof Error && error.message.includes("token")) {
      return jsonErrorResponse(error, 401, "Unauthorized", { endpoint: "admin/submissions" })
    }
    return jsonErrorResponse(error, 500, "Failed to fetch submissions", { endpoint: "admin/submissions" })
  }
}
