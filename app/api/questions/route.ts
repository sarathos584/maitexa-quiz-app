import { NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { Question } from "@/lib/models"

export async function GET() {
  try {
    const questionsCollection = await getCollection<Question>("questions")

    // Fetch active questions, limit to 10 for the quiz
    const docs = await questionsCollection
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    // Remove correct answers from the response for security
    const questions = docs.map(({ correctAnswer, ...rest }) => ({ ...rest, _id: rest._id!.toString() })) as any

    return NextResponse.json({
      questions,
      total: questions.length,
    })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}
