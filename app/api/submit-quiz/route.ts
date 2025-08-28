import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { QuizSubmission } from "@/lib/models"
import { ObjectId } from "mongodb"
import { generateCertificateId } from "@/lib/certificate"

export async function POST(request: NextRequest) {
  try {
    const { userId, answers } = await request.json()

    if (!userId || !answers) {
      return NextResponse.json({ error: "User ID and answers are required" }, { status: 400 })
    }

    const questionsCollection = await getCollection("questions")
    const submissionsCollection = await getCollection<QuizSubmission & { certificateId?: string }>("quiz_submissions")
    const usersCollection = await getCollection("users")

    // Get user details
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get all questions with correct answers
    const questionIds = Object.keys(answers).map((id: string) => new ObjectId(id))
    const questions = await questionsCollection
      .find({ _id: { $in: questionIds } })
      .toArray()

    // Calculate score
    let correctAnswers = 0
    const detailedAnswers = questions.map((question: any) => {
      const userAnswer = answers[question._id!.toString()]
      const isCorrect = userAnswer === question.correctAnswer
      if (isCorrect) correctAnswers++

      return {
        questionId: question._id!.toString(),
        selectedAnswer: userAnswer,
        isCorrect,
      }
    })

    const totalQuestions = questions.length
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

    const completedAt = new Date()
    const certificateEligible = percentage >= 90
    const certificateId = certificateEligible ? generateCertificateId(completedAt) : undefined

    // Create submission record
    const submission: (QuizSubmission & { certificateId?: string }) = {
      userId: userId.toString(),
      userName: user.name,
      userEmail: user.email,
      answers: detailedAnswers,
      score: correctAnswers,
      percentage,
      completedAt,
      certificateGenerated: certificateEligible,
      ...(certificateId ? { certificateId } : {}),
    }

    const result = await submissionsCollection.insertOne(submission as any)

    return NextResponse.json({
      message: "Quiz submitted successfully",
      submissionId: result.insertedId.toString(),
      score: correctAnswers,
      percentage,
      certificateEligible,
      certificateId: certificateId || null,
    })
  } catch (error) {
    console.error("Error submitting quiz:", error)
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 })
  }
}
