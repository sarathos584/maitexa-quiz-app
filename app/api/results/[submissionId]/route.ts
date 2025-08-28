import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Question, QuizSubmission } from "@/lib/models"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { submissionId: string } }) {
  try {
    const { submissionId } = params

    if (!ObjectId.isValid(submissionId)) {
      return NextResponse.json({ error: "Invalid submission ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const submissionsCollection = db.collection<QuizSubmission>("quiz_submissions")
    const questionsCollection = db.collection<Question>("questions")

    // Get submission
    const submission = await submissionsCollection.findOne({
      _id: new ObjectId(submissionId),
    })

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Get question details for the answers
    const questionIds = submission.answers.map((answer) => new ObjectId(answer.questionId))
    const questions = await questionsCollection.find({ _id: { $in: questionIds } }).toArray()

    // Create detailed answer review
    const detailedAnswers = submission.answers.map((answer) => {
      const question = questions.find((q) => q._id!.toString() === answer.questionId)
      return {
        questionId: answer.questionId,
        question: question?.question || "Question not found",
        options: question?.options || [],
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question?.correctAnswer || 0,
        isCorrect: answer.isCorrect,
      }
    })

    const result = {
      _id: submission._id!.toString(),
      score: submission.score,
      percentage: submission.percentage,
      totalQuestions: submission.answers.length,
      answers: detailedAnswers,
      certificateGenerated: submission.certificateGenerated,
      userName: submission.userName,
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error("Error fetching results:", error)
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}
