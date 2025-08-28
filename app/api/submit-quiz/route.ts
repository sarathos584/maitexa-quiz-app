import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { QuizSubmission } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const { userId, answers } = await request.json()

    if (!userId || !answers) {
      return NextResponse.json({ error: "User ID and answers are required" }, { status: 400 })
    }

    const questionsCollection = getCollection("questions")
    const submissionsCollection = getCollection("quiz_submissions")
    const usersCollection = getCollection("users")

    // Get user details
    const user = await usersCollection.findOne({ _id: userId })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get all questions with correct answers
    const questionIds = Object.keys(answers)
    const questions = await questionsCollection.find({
      _id: { $in: questionIds },
    })

    // Calculate score
    let correctAnswers = 0
    const detailedAnswers = questions.map((question) => {
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
    const percentage = Math.round((correctAnswers / totalQuestions) * 100)

    // Create submission record
    const submission: QuizSubmission = {
      userId: userId,
      userName: user.name,
      userEmail: user.email,
      answers: detailedAnswers,
      score: correctAnswers,
      percentage,
      completedAt: new Date(),
      certificateGenerated: percentage >= 90,
    }

    const result = await submissionsCollection.insertOne(submission)

    return NextResponse.json({
      message: "Quiz submitted successfully",
      submissionId: result.insertedId.toString(),
      score: correctAnswers,
      percentage,
      certificateEligible: percentage >= 90,
    })
  } catch (error) {
    console.error("Error submitting quiz:", error)
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 })
  }
}
