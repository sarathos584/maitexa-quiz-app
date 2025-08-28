import { NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"
import type { Question } from "@/lib/models"

export async function GET() {
  try {
    const questionsCollection = await getCollection<Question>("questions")

    // Fetch all active questions
    const allQuestions = await questionsCollection
      .find({ isActive: true })
      .toArray()

    // Randomly select up to 10 questions
    const shuffled = allQuestions.sort(() => Math.random() - 0.5)
    const selectedQuestions = shuffled.slice(0, Math.min(10, allQuestions.length))

    // Remove correct answers from the response for security
    const questions = selectedQuestions.map(({ correctAnswer, ...rest }) => ({ ...rest, _id: rest._id!.toString() })) as any

    return NextResponse.json({
      questions,
      total: questions.length,
    })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}
