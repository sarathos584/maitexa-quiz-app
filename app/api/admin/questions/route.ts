import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Question } from "@/lib/models"

export async function GET() {
  try {
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

    return NextResponse.json({ questions: formattedQuestions })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, options, correctAnswer, category, difficulty } = body

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

    return NextResponse.json(
      {
        message: "Question created successfully",
        questionId: result.insertedId.toString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}
