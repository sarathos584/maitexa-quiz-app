"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Download, Home, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { jsPDF } from "jspdf"

interface QuizResult {
  _id: string
  score: number
  totalQuestions: number
  correctAnswers: number
  answers: {
    questionId: string
    question: string
    selectedAnswer: number
    correctAnswer: number
    options: string[]
    isCorrect: boolean
  }[]
  isExcellent: boolean
  userName: string
  userEmail: string
  submittedAt: string
  certificateId?: string
}

export default function ResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<QuizResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const submissionId = sessionStorage.getItem("submissionId")
    if (!submissionId) {
      router.push("/")
      return
    }

    const mockResults = sessionStorage.getItem("mockResults")
    if (mockResults) {
      try {
        const parsedResults = JSON.parse(mockResults)
        setResult(parsedResults)
      } catch (error) {
        console.error("Error parsing mock results:", error)
        router.push("/")
      }
    } else {
      router.push("/")
    }
    setIsLoading(false)
  }, [router])

  const downloadCertificate = async () => {
    if (!result) return

    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 10
      const inner = 5

      // Background & borders
      doc.setFillColor(248, 250, 252)
      doc.rect(0, 0, pageWidth, pageHeight, "F")
      doc.setDrawColor(22, 78, 99)
      doc.setLineWidth(2)
      doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2)
      doc.setDrawColor(139, 92, 246)
      doc.setLineWidth(0.5)
      doc.rect(margin + inner, margin + inner, pageWidth - (margin + inner) * 2, pageHeight - (margin + inner) * 2)

      // Header bar
      doc.setFillColor(22, 78, 99)
      doc.rect(margin + inner + 5, margin + inner + 5, pageWidth - (margin + inner + 5) * 2, 25, "F")

      // Logo & company
      doc.setFillColor(255, 255, 255)
      doc.circle(margin + inner + 20, margin + inner + 17.5, 8, "F")
      doc.setTextColor(22, 78, 99)
      doc.setFontSize(16)
      doc.setFont("times", "bold")
      doc.text("M", margin + inner + 17, margin + inner + 21)

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("MAITEXA", margin + inner + 35, margin + inner + 15)
      doc.setFontSize(12)
      doc.setFont("courier", "normal")
      doc.text("Professional Coding Assessments", margin + inner + 35, margin + inner + 23)

      // Title
      const isExcellent = result.isExcellent
      doc.setTextColor(22, 78, 99)
      doc.setFontSize(30)
      doc.setFont("times", "bold")
      const title = isExcellent ? "CERTIFICATE OF EXCELLENCE" : "CERTIFICATE OF PARTICIPATION"
      const titleWidth = doc.getTextWidth(title)
      doc.text(title, (pageWidth - titleWidth) / 2, 70)

      // Subtitle & name
      doc.setFontSize(14)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(71, 85, 105)
      const subtitle = "This certifies that"
      const subtitleWidth = doc.getTextWidth(subtitle)
      doc.text(subtitle, (pageWidth - subtitleWidth) / 2, 85)

      doc.setFontSize(28)
      doc.setFont("courier", "bold")
      doc.setTextColor(139, 92, 246)
      const nameWidth = doc.getTextWidth(result.userName)
      doc.text(result.userName, (pageWidth - nameWidth) / 2, 105)

      doc.setFontSize(14)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(71, 85, 105)
      const line1 = isExcellent
        ? "has successfully completed the Maitexa Coding Assessment"
        : "has successfully participated in the Maitexa Coding Assessment"
      const wrappedLine1 = doc.splitTextToSize(line1, pageWidth - 40)
      doc.text(wrappedLine1, 20, 120)

      // Bottom details (responsive)
      doc.setFontSize(12)
      doc.setTextColor(22, 78, 99)
      doc.setFont("helvetica", "bold")
      const colGap = 15
      const colWidth = (pageWidth - 40 - colGap) / 2
      const leftX = 20
      const rightX = leftX + colWidth + colGap
      let y = 150

      // Institution
      doc.text("Institution:", leftX, y)
      doc.setFont("helvetica", "normal")
      const college = (sessionStorage.getItem("college") || "-")
      const wrappedCollege = doc.splitTextToSize(college, colWidth)
      doc.text(wrappedCollege, leftX, y + 8)

      // Date & Certificate ID
      doc.setFont("helvetica", "bold")
      doc.text("Date of Completion:", rightX, y)
      doc.setFont("helvetica", "normal")
      const dateStr = new Date(result.submittedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      const wrappedDate = doc.splitTextToSize(dateStr, colWidth)
      doc.text(wrappedDate, rightX, y + 8)

      y = y + Math.max(wrappedCollege.length, wrappedDate.length) * 6 + 10

      doc.setFont("helvetica", "bold")
      doc.text("Certificate ID:", rightX, y)
      doc.setFont("courier", "bold")
      const certId = (result as any).certificateId || "-"
      const wrappedCert = doc.splitTextToSize(certId, colWidth)
      doc.text(wrappedCert, rightX, y + 8)

      // Badge
      doc.setFillColor(139, 92, 246)
      doc.circle(pageWidth - 40, 60, 15, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.text(isExcellent ? "EXCELLENCE" : "PARTICIPATION", pageWidth - 54, 58)
      doc.text(isExcellent ? "90%+" : "THANK YOU", pageWidth - 47, 65)

      doc.save(`maitexa-certificate-${result.userName.replace(/\s+/g, "-")}.pdf`)
    } catch (error) {
      console.error("Error generating certificate PDF:", error)
      alert("Certificate download failed. Please try again.")
    }
  }

  const previewCertificate = () => {
    if (!result) return

    const url = `/certificate/preview?certificateId=${encodeURIComponent((result as any).certificateId || "")}`
    window.open(url, "_blank")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading your results...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">Results not found.</p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100)
  const isExcellent = result.isExcellent

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <h1 className="text-2xl font-bold text-card-foreground">Assessment Results</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className={`${isExcellent ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"}`}>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Congratulations!</CardTitle>
              <CardDescription className="text-lg">
                {isExcellent
                  ? "Excellent performance! You qualify for a certificate of excellence."
                  : "Thank you for completing the assessment. Your certificate of participation is ready."}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Your Score</p>
                  <p className="text-3xl font-bold text-primary">
                    {result.correctAnswers}/{result.totalQuestions}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Percentage</p>
                  <p className={`text-3xl font-bold ${isExcellent ? "text-green-600" : "text-primary"}`}>
                    {percentage}%
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Performance</p>
                  <Badge variant={isExcellent ? "default" : "secondary"} className="text-lg px-4 py-2">
                    {isExcellent ? "Excellent" : percentage >= 70 ? "Good" : "Participation"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <p className={`${isExcellent ? "text-green-700" : "text-blue-700"} font-medium`}>
                  {isExcellent
                    ? "🎉 Outstanding! You scored 90% or higher and qualify for our excellence certificate."
                    : "🎉 Great job! Here is your certificate of participation."}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={previewCertificate} variant="outline" size="lg" className="gap-2 bg-transparent">
                    <Eye className="h-4 w-4" />
                    Preview Certificate
                  </Button>
                  <Button onClick={downloadCertificate} size="lg" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Certificate
                  </Button>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Link href="/">
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Home className="h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
                <Button onClick={() => (window.location.href = "mailto:contact@maitexa.com")}>Contact us for queries</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Answer Review</CardTitle>
              <CardDescription>Review your answers and see the correct solutions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.answers.map((answer, index) => (
                <div key={answer.questionId} className="border border-border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {answer.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="font-medium text-balance">
                        {index + 1}. {answer.question}
                      </p>
                      <div className="space-y-1">
                        <p className={`text-sm ${answer.isCorrect ? "text-green-700" : "text-red-700"}`}>
                          Your answer: {answer.options[answer.selectedAnswer]}
                        </p>
                        {!answer.isCorrect && (
                          <p className="text-sm text-green-700">
                            Correct answer: {answer.options[answer.correctAnswer]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
