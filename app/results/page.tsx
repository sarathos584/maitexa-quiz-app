"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Download, Home, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
      // Create a mock PDF download
      const mockPdfContent = `
        CERTIFICATE OF EXCELLENCE
        
        This is to certify that
        ${result.userName}
        
        has successfully completed the Maitexa Coding Assessment
        with a score of ${result.score}/${result.totalQuestions} (${Math.round((result.correctAnswers / result.totalQuestions) * 100)}%)
        
        Date: ${new Date(result.submittedAt).toLocaleDateString()}
        Certificate ID: ${result._id}
        
        Maitexa Technologies
      `

      const blob = new Blob([mockPdfContent], { type: "text/plain" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `maitexa-certificate-${result.userName.replace(/\s+/g, "-")}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading certificate:", error)
      alert("Certificate download feature is in demo mode.")
    }
  }

  const previewCertificate = () => {
    if (!result) return

    const certificateUrl = `/certificate/${result._id}`
    window.open(certificateUrl, "_blank")
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
          <Card className={`${isExcellent ? "border-green-200 bg-green-50" : ""}`}>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">{isExcellent ? "Congratulations!" : "Assessment Complete"}</CardTitle>
              <CardDescription className="text-lg">
                {isExcellent
                  ? "Excellent performance! You qualify for a certificate."
                  : "Thank you for taking the assessment."}
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
                    {isExcellent ? "Excellent" : percentage >= 70 ? "Good" : "Needs Improvement"}
                  </Badge>
                </div>
              </div>

              {isExcellent && (
                <div className="space-y-4">
                  <p className="text-green-700 font-medium">
                    🎉 Outstanding! You scored 90% or higher and qualify for our excellence certificate.
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
              )}

              <div className="flex gap-4 justify-center">
                <Link href="/">
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Home className="h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
                <Button onClick={() => (window.location.href = "mailto:contact@maitexa.com")}>
                  Contact us for queries
                </Button>
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
