import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = Number.parseInt(searchParams.get("timeRange") || "30")

    const submissionsCollection = getCollection("quiz_submissions")
    const questionsCollection = getCollection("questions")

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - timeRange)

    // Get submissions within time range
    const submissions = await submissionsCollection.find({
      completedAt: { $gte: startDate, $lte: endDate },
    })

    // Get all questions for analysis
    const questions = await questionsCollection.find({ isActive: true })

    // Calculate overview statistics
    const totalSubmissions = submissions.length
    const totalUsers = new Set(submissions.map((s) => s.userId)).size
    const averageScore = submissions.reduce((sum, s) => sum + s.score, 0) / totalSubmissions || 0
    const averagePercentage = submissions.reduce((sum, s) => sum + s.percentage, 0) / totalSubmissions || 0
    const excellentPerformers = submissions.filter((s) => s.percentage >= 90).length

    // Category performance analysis
    const categoryStats = new Map<string, { total: number; correct: number }>()

    submissions.forEach((submission) => {
      submission.answers.forEach((answer) => {
        const question = questions.find((q) => q._id!.toString() === answer.questionId)
        if (question) {
          const category = question.category
          if (!categoryStats.has(category)) {
            categoryStats.set(category, { total: 0, correct: 0 })
          }
          const stats = categoryStats.get(category)!
          stats.total++
          if (answer.isCorrect) stats.correct++
        }
      })
    })

    const categoryPerformance = Array.from(categoryStats.entries()).map(([category, stats]) => ({
      category,
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      accuracy: (stats.correct / stats.total) * 100,
    }))

    // Difficulty analysis
    const difficultyStats = new Map<string, { total: number; correct: number }>()

    submissions.forEach((submission) => {
      submission.answers.forEach((answer) => {
        const question = questions.find((q) => q._id!.toString() === answer.questionId)
        if (question) {
          const difficulty = question.difficulty
          if (!difficultyStats.has(difficulty)) {
            difficultyStats.set(difficulty, { total: 0, correct: 0 })
          }
          const stats = difficultyStats.get(difficulty)!
          stats.total++
          if (answer.isCorrect) stats.correct++
        }
      })
    })

    const difficultyAnalysis = Array.from(difficultyStats.entries()).map(([difficulty, stats]) => ({
      difficulty,
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      accuracy: (stats.correct / stats.total) * 100,
    }))

    // Time series data (daily submissions and average scores)
    const dailyStats = new Map<string, { submissions: number; totalScore: number; count: number }>()

    submissions.forEach((submission) => {
      const date = submission.completedAt.toISOString().split("T")[0]
      if (!dailyStats.has(date)) {
        dailyStats.set(date, { submissions: 0, totalScore: 0, count: 0 })
      }
      const stats = dailyStats.get(date)!
      stats.submissions++
      stats.totalScore += submission.score
      stats.count++
    })

    const timeSeriesData = Array.from(dailyStats.entries())
      .map(([date, stats]) => ({
        date,
        submissions: stats.submissions,
        averageScore: stats.totalScore / stats.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Question performance analysis
    const questionStats = new Map<string, { attempts: number; correct: number; question: any }>()

    submissions.forEach((submission) => {
      submission.answers.forEach((answer) => {
        const question = questions.find((q) => q._id!.toString() === answer.questionId)
        if (question) {
          const questionId = answer.questionId
          if (!questionStats.has(questionId)) {
            questionStats.set(questionId, { attempts: 0, correct: 0, question })
          }
          const stats = questionStats.get(questionId)!
          stats.attempts++
          if (answer.isCorrect) stats.correct++
        }
      })
    })

    const questionPerformance = Array.from(questionStats.entries()).map(([questionId, stats]) => ({
      questionId,
      question: stats.question.question,
      category: stats.question.category,
      difficulty: stats.question.difficulty,
      totalAttempts: stats.attempts,
      correctAttempts: stats.correct,
      accuracy: (stats.correct / stats.attempts) * 100,
    }))

    // User performance distribution
    const scoreRanges = [
      { range: "0-20%", min: 0, max: 20 },
      { range: "21-40%", min: 21, max: 40 },
      { range: "41-60%", min: 41, max: 60 },
      { range: "61-80%", min: 61, max: 80 },
      { range: "81-89%", min: 81, max: 89 },
      { range: "90-100%", min: 90, max: 100 },
    ]

    const userPerformance = scoreRanges.map((range) => {
      const count = submissions.filter((s) => s.percentage >= range.min && s.percentage <= range.max).length
      return {
        scoreRange: range.range,
        count,
        percentage: (count / totalSubmissions) * 100,
      }
    })

    const analytics = {
      overview: {
        totalSubmissions,
        totalUsers,
        averageScore,
        excellentPerformers,
        averagePercentage,
      },
      categoryPerformance,
      difficultyAnalysis,
      timeSeriesData,
      questionPerformance,
      userPerformance,
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
