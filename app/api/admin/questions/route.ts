import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { requireAdminAuth } from "@/lib/auth"
import type { Question } from "@/lib/models"
import { jsonErrorResponse, jsonSuccess } from "@/lib/api"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    requireAdminAuth(request)

    const db = await getDatabase()
    const questionsCollection = db.collection<Question>("questions")

    // Get all questions for admin (including inactive ones)
    const questions = await questionsCollection.find({}).sort({ createdAt: -1 }).toArray()

    // Format the data for the frontend
    const formattedQuestions = questions.map((question) => ({
      _id: question._id!.toString(),
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      category: question.category,
      difficulty: question.difficulty,
      isActive: question.isActive,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
    }))

    return jsonSuccess({ questions: formattedQuestions })
  } catch (error) {
    console.error("Error fetching questions:", error)
    if (error instanceof Error && error.message.includes("token")) {
      return jsonErrorResponse(error, 401, "Unauthorized", { endpoint: "admin/questions" })
    }
    return jsonErrorResponse(error, 500, "Failed to fetch questions", { endpoint: "admin/questions" })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    requireAdminAuth(request)

    const body = await request.json()
    const { question, options, correctAnswer, category, difficulty } = body

    // Validation
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return jsonErrorResponse(null, 400, "Invalid question data")
    }

    if (correctAnswer < 0 || correctAnswer >= options.length) {
      return jsonErrorResponse(null, 400, "Invalid correct answer index")
    }

    if (!category || !difficulty) {
      return jsonErrorResponse(null, 400, "Category and difficulty are required")
    }

    const db = await getDatabase()
    const questionsCollection = db.collection<Question>("questions")

    // Create new question
    const newQuestion: Question = {
      question: question.trim(),
      options: options.map((opt: string) => opt.trim()),
      correctAnswer,
      category: category.trim(),
      difficulty,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await questionsCollection.insertOne(newQuestion)

    return jsonSuccess(
      {
        message: "Question created successfully",
        questionId: result.insertedId.toString(),
      },
      201,
    )
  } catch (error) {
    console.error("Error creating question:", error)
    if (error instanceof Error && error.message.includes("token")) {
      return jsonErrorResponse(error, 401, "Unauthorized", { endpoint: "admin/questions" })
    }
    return jsonErrorResponse(error, 500, "Failed to create question", { endpoint: "admin/questions" })
  }
}
