"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Question {
  _id: string
  question: string
  options: string[]
  correctAnswer: number
  category: string
  difficulty: string
}

export default function QuizPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<{ [key: string]: number }>({})
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

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

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
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
        submitQuiz()
      }
    }
  }

  const submitQuiz = async () => {
    if (!userId) return

    setIsSubmitting(true)

    try {
      const finalAnswers = {
        ...answers,
        [questions[currentQuestionIndex]._id]: selectedAnswer,
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
            <div className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
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

              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-muted-foreground">
                  {selectedAnswer !== null ? "Answer selected" : "Please select an answer"}
                </div>
                <Button onClick={handleNext} disabled={selectedAnswer === null || isSubmitting} size="lg">
                  {isSubmitting
                    ? "Submitting..."
                    : currentQuestionIndex === questions.length - 1
                      ? "Submit Quiz"
                      : "Next Question"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
