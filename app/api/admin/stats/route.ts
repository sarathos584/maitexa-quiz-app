import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDatabase()

    // Get statistics from different collections
    const [totalSubmissions, totalUsers, totalQuestions, excellentPerformers] = await Promise.all([
      db.collection("quiz_submissions").countDocuments(),
      db.collection("users").countDocuments(),
      db.collection("questions").countDocuments({ isActive: true }),
      db.collection("quiz_submissions").countDocuments({ percentage: { $gte: 90 } }),
    ])

    const stats = {
      totalSubmissions,
      totalUsers,
      totalQuestions,
      excellentPerformers,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
