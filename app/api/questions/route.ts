import { NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"

export async function GET() {
  try {
    const questionsCollection = getCollection("questions")

    // Fetch active questions, limit to 10 for the quiz
    const questions = await questionsCollection.find({ isActive: true }, { limit: 10 })

    // Remove correct answers from the response for security
    const questionsWithoutAnswers = questions.map(({ correctAnswer, ...question }) => question)

    return NextResponse.json({
      questions: questionsWithoutAnswers,
      total: questions.length,
    })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}
