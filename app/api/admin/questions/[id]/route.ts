import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { requireAdminAuth } from "@/lib/auth"
import type { Question } from "@/lib/models"
import { ObjectId } from "mongodb"
import { jsonErrorResponse, jsonSuccess } from "@/lib/api"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    requireAdminAuth(request)

    const db = await getDatabase()
    const questionsCollection = db.collection<Question>("questions")

    // Validate ObjectId
    if (!ObjectId.isValid(params.id)) {
      return jsonErrorResponse(null, 400, "Invalid question ID")
    }

    const question = await questionsCollection.findOne({ _id: new ObjectId(params.id) })

    if (!question) {
      return jsonErrorResponse(null, 404, "Question not found")
    }

    // Format the data for the frontend
    const formattedQuestion = {
      _id: question._id!.toString(),
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      category: question.category,
      difficulty: question.difficulty,
      isActive: question.isActive,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
    }

    return jsonSuccess({ question: formattedQuestion })
  } catch (error) {
    console.error("Error fetching question:", error)
    if (error instanceof Error && error.message.includes("token")) {
      return jsonErrorResponse(error, 401, "Unauthorized", { endpoint: "admin/questions/[id]", method: "GET" })
    }
    return jsonErrorResponse(error, 500, "Failed to fetch question", { endpoint: "admin/questions/[id]", method: "GET" })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    requireAdminAuth(request)

    const body = await request.json()
    const { question, options, correctAnswer, category, difficulty, isActive } = body

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

    // Validate ObjectId
    if (!ObjectId.isValid(params.id)) {
      return jsonErrorResponse(null, 400, "Invalid question ID")
    }

    const db = await getDatabase()
    const questionsCollection = db.collection<Question>("questions")

    // Update question
    const updateData = {
      question: question.trim(),
      options: options.map((opt: string) => opt.trim()),
      correctAnswer,
      category: category.trim(),
      difficulty,
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: new Date(),
    }

    const result = await questionsCollection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return jsonErrorResponse(null, 404, "Question not found")
    }

    return jsonSuccess({
      message: "Question updated successfully",
    })
  } catch (error) {
    console.error("Error updating question:", error)
    if (error instanceof Error && error.message.includes("token")) {
      return jsonErrorResponse(error, 401, "Unauthorized", { endpoint: "admin/questions/[id]", method: "PUT" })
    }
    return jsonErrorResponse(error, 500, "Failed to update question", { endpoint: "admin/questions/[id]", method: "PUT" })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    requireAdminAuth(request)

    // Validate ObjectId
    if (!ObjectId.isValid(params.id)) {
      return jsonErrorResponse(null, 400, "Invalid question ID")
    }

    const db = await getDatabase()
    const questionsCollection = db.collection<Question>("questions")

    const result = await questionsCollection.deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return jsonErrorResponse(null, 404, "Question not found")
    }

    return jsonSuccess({
      message: "Question deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting question:", error)
    if (error instanceof Error && error.message.includes("token")) {
      return jsonErrorResponse(error, 401, "Unauthorized", { endpoint: "admin/questions/[id]", method: "DELETE" })
    }
    return jsonErrorResponse(error, 500, "Failed to delete question", { endpoint: "admin/questions/[id]", method: "DELETE" })
  }
}
