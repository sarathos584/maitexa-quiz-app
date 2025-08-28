import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { QuizSubmission, User } from "@/lib/models"
import { ObjectId } from "mongodb"
import { jsPDF } from "jspdf"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid submission ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const submissionsCollection = db.collection<QuizSubmission>("quiz_submissions")
    const usersCollection = db.collection<User>("users")

    // Get submission details
    const submission = await submissionsCollection.findOne({
      _id: new ObjectId(id),
    })

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Check if user qualifies for certificate (90% or higher)
    if (submission.percentage < 90) {
      return NextResponse.json({ error: "Certificate not available - score below 90%" }, { status: 403 })
    }

    // Get user details
    const user = await usersCollection.findOne({ _id: new ObjectId(submission.userId) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate PDF certificate
    const pdfBuffer = await generateCertificatePDF({
      userName: user.name,
      userEmail: user.email,
      company: user.company,
      college: user.college,
      score: submission.score,
      percentage: submission.percentage,
      totalQuestions: submission.answers.length,
      completedAt: submission.completedAt,
    })

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="maitexa-certificate-${user.name.replace(/\s+/g, "-")}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating certificate:", error)
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 })
  }
}

interface CertificateData {
  userName: string
  userEmail: string
  company: string
  college: string
  score: number
  percentage: number
  totalQuestions: number
  completedAt: Date
}

async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Background and border
  doc.setFillColor(248, 250, 252) // Light gray background
  doc.rect(0, 0, pageWidth, pageHeight, "F")

  // Main certificate border
  doc.setDrawColor(22, 78, 99) // Primary color border
  doc.setLineWidth(2)
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

  // Inner decorative border
  doc.setDrawColor(139, 92, 246) // Secondary color
  doc.setLineWidth(0.5)
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30)

  // Header section with logo placeholder and title
  doc.setFillColor(22, 78, 99) // Primary color
  doc.rect(20, 20, pageWidth - 40, 25, "F")

  // Maitexa logo placeholder (circle with M)
  doc.setFillColor(255, 255, 255)
  doc.circle(35, 32.5, 8, "F")
  doc.setTextColor(22, 78, 99)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("M", 32, 36)

  // Company name and title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("MAITEXA", 50, 30)
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text("Professional Coding Assessments", 50, 38)

  // Certificate title
  doc.setTextColor(22, 78, 99)
  doc.setFontSize(32)
  doc.setFont("helvetica", "bold")
  const titleText = "CERTIFICATE OF EXCELLENCE"
  const titleWidth = doc.getTextWidth(titleText)
  doc.text(titleText, (pageWidth - titleWidth) / 2, 70)

  // Subtitle
  doc.setFontSize(14)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(71, 85, 105)
  const subtitleText = "This certifies that"
  const subtitleWidth = doc.getTextWidth(subtitleText)
  doc.text(subtitleText, (pageWidth - subtitleWidth) / 2, 85)

  // Candidate name (highlighted)
  doc.setFontSize(28)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(139, 92, 246) // Secondary color
  const nameWidth = doc.getTextWidth(data.userName)
  doc.text(data.userName, (pageWidth - nameWidth) / 2, 105)

  // Achievement description
  doc.setFontSize(14)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(71, 85, 105)
  const achievementText = "has successfully completed the Maitexa Coding Assessment"
  const achievementWidth = doc.getTextWidth(achievementText)
  doc.text(achievementText, (pageWidth - achievementWidth) / 2, 120)

  const achievementText2 = "and demonstrated exceptional technical proficiency"
  const achievementWidth2 = doc.getTextWidth(achievementText2)
  doc.text(achievementText2, (pageWidth - achievementWidth2) / 2, 130)

  // Score section
  doc.setFillColor(236, 254, 255) // Light cyan background
  doc.rect(60, 145, pageWidth - 120, 30, "F")
  doc.setDrawColor(22, 78, 99)
  doc.setLineWidth(1)
  doc.rect(60, 145, pageWidth - 120, 30)

  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(22, 78, 99)
  const scoreText = `SCORE: ${data.score}/${data.totalQuestions} (${data.percentage}%)`
  const scoreWidth = doc.getTextWidth(scoreText)
  doc.text(scoreText, (pageWidth - scoreWidth) / 2, 165)

  // Details section
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(71, 85, 105)

  const leftColumnX = 40
  const rightColumnX = pageWidth - 120
  const detailsY = 190

  // Left column
  doc.text("Company:", leftColumnX, detailsY)
  doc.setFont("helvetica", "bold")
  doc.text(data.company, leftColumnX, detailsY + 8)

  doc.setFont("helvetica", "normal")
  doc.text("Institution:", leftColumnX, detailsY + 20)
  doc.setFont("helvetica", "bold")
  doc.text(data.college, leftColumnX, detailsY + 28)

  // Right column
  doc.setFont("helvetica", "normal")
  doc.text("Date of Completion:", rightColumnX, detailsY)
  doc.setFont("helvetica", "bold")
  const completionDate = data.completedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  doc.text(completionDate, rightColumnX, detailsY + 8)

  doc.setFont("helvetica", "normal")
  doc.text("Certificate ID:", rightColumnX, detailsY + 20)
  doc.setFont("helvetica", "bold")
  const certificateId = `MTX-${data.completedAt.getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  doc.text(certificateId, rightColumnX, detailsY + 28)

  // Footer with signature line and validation
  doc.setDrawColor(139, 92, 246)
  doc.setLineWidth(0.5)
  doc.line(50, pageHeight - 35, 120, pageHeight - 35) // Signature line

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(71, 85, 105)
  doc.text("Authorized Signature", 50, pageHeight - 25)
  doc.text("Maitexa Assessment Team", 50, pageHeight - 20)

  // Validation note
  const validationText = "This certificate can be verified at maitexa.com/verify"
  const validationWidth = doc.getTextWidth(validationText)
  doc.text(validationText, pageWidth - validationWidth - 20, pageHeight - 15)

  // Excellence badge
  doc.setFillColor(139, 92, 246)
  doc.circle(pageWidth - 40, 60, 15, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.text("EXCELLENCE", pageWidth - 50, 58)
  doc.text("90%+", pageWidth - 45, 65)

  // Convert to buffer
  const pdfOutput = doc.output("arraybuffer")
  return Buffer.from(pdfOutput)
}
