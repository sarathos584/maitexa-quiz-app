import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { QuizSubmission } from "@/lib/models"
import { ObjectId } from "mongodb"
import { generateCertificateId } from "@/lib/certificate"

export async function POST(request: NextRequest) {
  try {
    const submissionData = await request.json()

    if (!submissionData.userId || !submissionData.answers) {
      return NextResponse.json({ error: "User ID and answers are required" }, { status: 400 })
    }

    const submissionsCollection = await getCollection<QuizSubmission & { certificateId?: string }>("quiz_submissions")

    // Create submission record with the data from the quiz page
    const submission: (QuizSubmission & { certificateId?: string }) = {
      userId: submissionData.userId,
      userName: submissionData.userName,
      userEmail: submissionData.userEmail,
      answers: submissionData.answers,
      score: submissionData.correctAnswers,
      percentage: submissionData.percentage,
      totalQuestions: submissionData.totalQuestions,
      correctAnswers: submissionData.correctAnswers,
      completedAt: submissionData.completedAt,
      submittedAt: submissionData.submittedAt,
      isExcellent: submissionData.isExcellent,
      autoSubmitted: submissionData.autoSubmitted,
      timeTakenMs: submissionData.timeTakenMs,
      certificateGenerated: submissionData.certificateGenerated,
      certificateId: submissionData.certificateId,
    }

    const result = await submissionsCollection.insertOne(submission as any)

    return NextResponse.json({
      message: "Quiz submitted successfully",
      submissionId: result.insertedId.toString(),
      score: submissionData.correctAnswers,
      percentage: submissionData.percentage,
      certificateEligible: submissionData.certificateGenerated,
      certificateId: submissionData.certificateId || null,
    })
  } catch (error) {
    console.error("Error submitting quiz:", error)
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 })
  }
}
