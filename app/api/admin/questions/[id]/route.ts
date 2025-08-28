import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { requireAdminAuth } from "@/lib/auth"
import type { Question } from "@/lib/models"
import { ObjectId } from "mongodb"

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
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 })
    }

    const question = await questionsCollection.findOne({ _id: new ObjectId(params.id) })

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
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

    return NextResponse.json({ question: formattedQuestion })
  } catch (error) {
    console.error("Error fetching question:", error)
    if (error instanceof Error && error.message.includes("token")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 })
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
      return NextResponse.json({ error: "Invalid question data" }, { status: 400 })
    }

    if (correctAnswer < 0 || correctAnswer >= options.length) {
      return NextResponse.json({ error: "Invalid correct answer index" }, { status: 400 })
    }

    if (!category || !difficulty) {
      return NextResponse.json({ error: "Category and difficulty are required" }, { status: 400 })
    }

    // Validate ObjectId
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 })
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
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Question updated successfully",
    })
  } catch (error) {
    console.error("Error updating question:", error)
    if (error instanceof Error && error.message.includes("token")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
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
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const questionsCollection = db.collection<Question>("questions")

    const result = await questionsCollection.deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Question deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting question:", error)
    if (error instanceof Error && error.message.includes("token")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}
