import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { requireAdminAuth } from "@/lib/auth"
import { jsonErrorResponse, jsonSuccess } from "@/lib/api"

export async function GET(request: Request) {
  try {
    // Verify admin authentication
    requireAdminAuth(request as any)

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

    return jsonSuccess({ stats })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    if (error instanceof Error && error.message.includes("token")) {
      return jsonErrorResponse(error, 401, "Unauthorized", { endpoint: "admin/stats" })
    }
    return jsonErrorResponse(error, 500, "Failed to fetch statistics", { endpoint: "admin/stats" })
  }
}
