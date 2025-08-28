import { type NextRequest, NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = Number.parseInt(searchParams.get("timeRange") || "30")

    const submissionsCollection = getCollection("quiz_submissions")
    const usersCollection = getCollection("users")

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - timeRange)

    // Get submissions within time range
    const submissions = await submissionsCollection.find({
      completedAt: { $gte: startDate, $lte: endDate },
    })

    // Get user details for submissions
    const userIds = submissions.map((s) => s.userId)
    const users = await usersCollection.find({ _id: { $in: userIds } })
    const userMap = new Map(users.map((user) => [user._id!.toString(), user]))

    // Generate CSV content
    const csvHeaders = [
      "Submission Date",
      "User Name",
      "Email",
      "Company",
      "College",
      "Experience",
      "Score",
      "Percentage",
      "Certificate Generated",
    ]

    const csvRows = submissions.map((submission) => {
      const user = userMap.get(submission.userId)
      return [
        submission.completedAt.toISOString().split("T")[0],
        submission.userName,
        submission.userEmail,
        user?.company || "N/A",
        user?.college || "N/A",
        user?.experience || "N/A",
        submission.score.toString(),
        submission.percentage.toString(),
        submission.certificateGenerated ? "Yes" : "No",
      ]
    })

    const csvContent = [csvHeaders, ...csvRows].map((row) => row.join(",")).join("\n")

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="maitexa-analytics-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting analytics:", error)
    return NextResponse.json({ error: "Failed to export analytics" }, { status: 500 })
  }
}
