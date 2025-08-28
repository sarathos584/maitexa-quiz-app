"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Question {
  _id: string
  question: string
  options: string[]
  correctAnswer: number
  category: string
  difficulty: "easy" | "medium" | "hard"
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function QuestionsManagement() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)

  useEffect(() => {
    // Check admin authentication
    const adminToken = sessionStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/admin")
      return
    }

    fetchQuestions()
  }, [router])

  const fetchQuestions = async () => {
    try {
      const adminToken = sessionStorage.getItem("adminToken")
      const headers = {
        "Authorization": `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      }

      const response = await fetch("/api/admin/questions", { headers })

      if (response.status === 401) {
        sessionStorage.removeItem("adminToken")
        router.push("/admin")
        return
      }

      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions)
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const adminToken = sessionStorage.getItem("adminToken")
      const headers = {
        "Authorization": `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      }

      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: "DELETE",
        headers,
      })

      if (response.status === 401) {
        sessionStorage.removeItem("adminToken")
        router.push("/admin")
        return
      }

      if (response.ok) {
        // Remove the question from the local state
        setQuestions(questions.filter(q => q._id !== questionId))
      }
    } catch (error) {
      console.error("Error deleting question:", error)
    }
  }

  const handleToggleActive = async (questionId: string, currentStatus: boolean) => {
    try {
      const adminToken = sessionStorage.getItem("adminToken")
      const headers = {
        "Authorization": `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      }

      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.status === 401) {
        sessionStorage.removeItem("adminToken")
        router.push("/admin")
        return
      }

      if (response.ok) {
        // Update the question status in local state
        setQuestions(questions.map(q => 
          q._id === questionId ? { ...q, isActive: !currentStatus } : q
        ))
      }
    } catch (error) {
      console.error("Error updating question:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">M</span>
                </div>
                <h1 className="text-2xl font-bold text-card-foreground">Question Management</h1>
              </div>
            </div>
            <Link href="/admin/questions/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>All Questions</CardTitle>
            <CardDescription>Manage quiz questions, categories, and difficulty levels</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question._id}>
                    <TableCell className="max-w-md">
                      <div className="truncate" title={question.question}>
                        {question.question}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{question.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={question.isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleActive(question._id, question.isActive)}
                      >
                        {question.isActive ? "Active" : "Inactive"}
                      </Button>
                    </TableCell>
                    <TableCell>{formatDate(question.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedQuestion(question)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Question Details</DialogTitle>
                              <DialogDescription>
                                View and edit question information
                              </DialogDescription>
                            </DialogHeader>
                            {selectedQuestion && (
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Question</label>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {selectedQuestion.question}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Options</label>
                                  <div className="space-y-2 mt-1">
                                    {selectedQuestion.options.map((option, index) => (
                                      <div
                                        key={index}
                                        className={`p-2 rounded border ${
                                          index === selectedQuestion.correctAnswer
                                            ? "border-green-500 bg-green-50"
                                            : "border-gray-200"
                                        }`}
                                      >
                                        <span className="text-sm font-medium mr-2">
                                          {String.fromCharCode(65 + index)}.
                                        </span>
                                        {option}
                                        {index === selectedQuestion.correctAnswer && (
                                          <Badge className="ml-2 bg-green-500">Correct</Badge>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Category</label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {selectedQuestion.category}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Difficulty</label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {selectedQuestion.difficulty}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Link href={`/admin/questions/${selectedQuestion._id}/edit`}>
                                    <Button>Edit Question</Button>
                                  </Link>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Question</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this question? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteQuestion(question._id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {questions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No questions found. Create your first question to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
