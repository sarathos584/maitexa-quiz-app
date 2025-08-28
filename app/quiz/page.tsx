"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { generateCertificateId } from "@/lib/certificate"

interface Question {
  _id: string
  question: string
  options: string[]
  correctAnswer: number
  category: string
  difficulty: string
}

const QUIZ_DURATION_MS = 10 * 60 * 1000 // 10 minutes

export default function QuizPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<{ [key: string]: number }>({})
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [deadline, setDeadline] = useState<number | null>(null)
  const [now, setNow] = useState<number>(Date.now())

  // Derived countdown time left
  const timeLeftMs = useMemo(() => {
    if (!deadline) return 0
    return Math.max(0, deadline - now)
  }, [deadline, now])

  const timeLeftDisplay = useMemo(() => {
    const totalSeconds = Math.floor(timeLeftMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }, [timeLeftMs])

  useEffect(() => {
    // Check if user is registered
    const storedUserId = sessionStorage.getItem("userId")
    if (!storedUserId) {
      router.push("/register")
      return
    }
    setUserId(storedUserId)

    // Fetch questions
    fetchQuestions()
  }, [router])

  // Timer tick
  useEffect(() => {
    if (!hasStarted || !deadline) return

    const tick = () => setNow(Date.now())
    const interval = setInterval(tick, 1000)

    // Auto-submit at deadline
    if (timeLeftMs === 0 && questions.length > 0 && !isSubmitting) {
      submitQuiz(true)
    }

    return () => clearInterval(interval)
  }, [hasStarted, deadline, timeLeftMs, questions.length, isSubmitting])

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/questions")
      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions)
      } else {
        throw new Error("Failed to fetch questions")
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
      alert("Failed to load questions. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const startQuiz = () => {
    setHasStarted(true)
    setDeadline(Date.now() + QUIZ_DURATION_MS)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleSkip = () => {
    // move forward without selecting an answer
    const nextIndex = currentQuestionIndex + 1
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex)
      setSelectedAnswer(null)
    } else {
      submitQuiz(false)
    }
  }

  const handleNext = () => {
    if (selectedAnswer !== null) {
      const currentQuestion = questions[currentQuestionIndex]
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion._id]: selectedAnswer,
      }))

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
        setSelectedAnswer(null)
      } else {
        // Quiz completed, submit answers
        submitQuiz(false)
      }
    }
  }

  const submitQuiz = async (auto: boolean) => {
    if (!userId) return

    setIsSubmitting(true)

    try {
      const finalAnswers = {
        ...answers,
        ...(selectedAnswer !== null && { [questions[currentQuestionIndex]?._id]: selectedAnswer }),
      }

      // Calculate mock score
      let correctCount = 0
      const mockAnswers = Object.entries(finalAnswers).map(([questionId, selectedAnswer]) => {
        const question = questions.find((q) => q._id === questionId)
        const isCorrect = question ? question.correctAnswer === selectedAnswer : false
        if (isCorrect) correctCount++

        return {
          questionId,
          selectedAnswer,
          isCorrect,
          correctAnswer: question?.correctAnswer || 0,
          question: question?.question || "",
          options: question?.options || [],
        }
      })

      const score = Math.round((correctCount / questions.length) * 100)
      const isExcellent = score >= 90

      const certId = generateCertificateId(new Date())

      // Create mock submission data
      const mockSubmission = {
        _id: `mock_${Date.now()}`,
        userId,
        userName: sessionStorage.getItem("userName") || "Test User",
        userEmail: sessionStorage.getItem("userEmail") || "test@example.com",
        score,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        answers: mockAnswers,
        submittedAt: new Date().toISOString(),
        isExcellent,
        autoSubmitted: auto,
        timeTakenMs: deadline ? QUIZ_DURATION_MS - Math.max(0, deadline - Date.now()) : undefined,
        certificateId: certId,
      }

      // Store mock results in sessionStorage for the results page
      sessionStorage.setItem("mockResults", JSON.stringify(mockSubmission))
      sessionStorage.setItem("submissionId", mockSubmission._id)

      // Redirect to results page
      router.push("/results")
    } catch (error) {
      console.error("Error creating mock results:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const exitWithoutSubmitting = () => {
    if (confirm("Are you sure you want to exit without submitting? Your progress will be lost.")) {
      router.push("/")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading questions...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">No questions available at the moment.</p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Pre-quiz instructions screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Assessment Instructions</CardTitle>
            <CardDescription>Please read carefully before you start</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
              <li>You have 10 minutes to complete the assessment.</li>
              <li>You can skip questions and come back if time permits.</li>
              <li>Your quiz auto-submits when time runs out.</li>
              <li>Click "Start Assessment" when you are ready.</li>
            </ul>
            <div className="flex justify-end">
              <Button onClick={startQuiz}>Start Assessment</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <h1 className="text-2xl font-bold text-card-foreground">Maitexa Quiz</h1>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-3">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span className="px-2 py-1 rounded bg-muted font-mono">{timeLeftDisplay}</span>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                    {currentQuestion.category}
                  </span>
                  <span className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-full capitalize">
                    {currentQuestion.difficulty}
                  </span>
                </div>
              </div>
              <CardTitle className="text-xl text-balance">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={selectedAnswer?.toString()}
                onValueChange={(value) => handleAnswerSelect(Number.parseInt(value))}
              >
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex flex-wrap gap-2 justify-between items-center pt-4">
                <div className="text-sm text-muted-foreground">
                  {selectedAnswer !== null ? "Answer selected" : "Please select an answer or skip"}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSkip} disabled={isSubmitting}>Skip</Button>
                  <Button variant="outline" onClick={() => submitQuiz(false)} disabled={isSubmitting}>Submit Now</Button>
                  <Button variant="outline" onClick={exitWithoutSubmitting} disabled={isSubmitting}>Exit</Button>
                  <Button onClick={handleNext} disabled={selectedAnswer === null || isSubmitting}>
                    {isSubmitting
                      ? "Submitting..."
                      : currentQuestionIndex === questions.length - 1
                        ? "Submit Quiz"
                        : "Next Question"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
