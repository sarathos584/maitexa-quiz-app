"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogOut, Users, FileText, Award, Plus, TrendingUp, Edit, Trash2, ArrowLeft, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface DashboardStats {
  totalSubmissions: number
  totalUsers: number
  totalQuestions: number
  excellentPerformers: number
}

interface Submission {
  _id: string
  userName: string
  userEmail: string
  score: number
  percentage: number
  completedAt: string
  certificateGenerated: boolean
}

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

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("submissions")
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [newQuestionForm, setNewQuestionForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    category: "",
    difficulty: "easy" as "easy" | "medium" | "hard",
  })
  const [editQuestionForm, setEditQuestionForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    category: "",
    difficulty: "easy" as "easy" | "medium" | "hard",
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    // Check admin authentication
    const adminToken = sessionStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/admin")
      return
    }

    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      const adminToken = sessionStorage.getItem("adminToken")
      const headers = {
        "Authorization": `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      }

      const [statsResponse, submissionsResponse, questionsResponse] = await Promise.all([
        fetch("/api/admin/stats", { headers }),
        fetch("/api/admin/submissions", { headers }),
        fetch("/api/admin/questions", { headers }),
      ])

      if (statsResponse.status === 401 || submissionsResponse.status === 401 || questionsResponse.status === 401) {
        sessionStorage.removeItem("adminToken")
        router.push("/admin")
        return
      }

      if (statsResponse.ok && submissionsResponse.ok && questionsResponse.ok) {
        const statsData = await statsResponse.json()
        const submissionsData = await submissionsResponse.json()
        const questionsData = await questionsResponse.json()

        setStats(statsData.stats)
        setSubmissions(submissionsData.submissions)
        setQuestions(questionsData.questions)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken")
    router.push("/admin")
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
        setQuestions(questions.filter(q => q._id !== questionId))
        // Refresh stats
        fetchDashboardData()
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
        setQuestions(questions.map(q => 
          q._id === questionId ? { ...q, isActive: !currentStatus } : q
        ))
        // Refresh stats
        fetchDashboardData()
      }
    } catch (error) {
      console.error("Error updating question:", error)
    }
  }

  const handleViewQuestion = (question: Question) => {
    setSelectedQuestion(question)
    setIsEditMode(false)
    setShowQuestionModal(true)
  }

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question)
    setEditQuestionForm({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      category: question.category,
      difficulty: question.difficulty,
      isActive: question.isActive,
    })
    setIsEditMode(true)
    setShowQuestionModal(true)
  }

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    if (!selectedQuestion) return

    // Validation
    if (!editQuestionForm.question.trim()) {
      setError("Question is required")
      setIsSubmitting(false)
      return
    }

    if (editQuestionForm.options.some(opt => !opt.trim())) {
      setError("All options must be filled")
      setIsSubmitting(false)
      return
    }

    if (!editQuestionForm.category.trim()) {
      setError("Category is required")
      setIsSubmitting(false)
      return
    }

    try {
      const adminToken = sessionStorage.getItem("adminToken")
      const headers = {
        "Authorization": `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      }

      const response = await fetch(`/api/admin/questions/${selectedQuestion._id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(editQuestionForm),
      })

      if (response.status === 401) {
        sessionStorage.removeItem("adminToken")
        router.push("/admin")
        return
      }

      const data = await response.json()

      if (response.ok) {
        setSuccess("Question updated successfully!")
        // Update the question in the local state
        setQuestions(questions.map(q => 
          q._id === selectedQuestion._id 
            ? { 
                ...q, 
                question: editQuestionForm.question,
                options: editQuestionForm.options,
                correctAnswer: editQuestionForm.correctAnswer,
                category: editQuestionForm.category,
                difficulty: editQuestionForm.difficulty,
                isActive: editQuestionForm.isActive,
                updatedAt: new Date().toISOString()
              }
            : q
        ))
        // Refresh stats
        fetchDashboardData()
        // Close modal after a short delay
        setTimeout(() => {
          setShowQuestionModal(false)
          setIsEditMode(false)
        }, 1500)
      } else {
        setError(data.error || "Failed to update question")
      }
    } catch (error) {
      console.error("Error updating question:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    // Validation
    if (!newQuestionForm.question.trim()) {
      setError("Question is required")
      setIsSubmitting(false)
      return
    }

    if (newQuestionForm.options.some(opt => !opt.trim())) {
      setError("All options must be filled")
      setIsSubmitting(false)
      return
    }

    if (!newQuestionForm.category.trim()) {
      setError("Category is required")
      setIsSubmitting(false)
      return
    }

    try {
      const adminToken = sessionStorage.getItem("adminToken")
      const headers = {
        "Authorization": `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      }

      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers,
        body: JSON.stringify(newQuestionForm),
      })

      if (response.status === 401) {
        sessionStorage.removeItem("adminToken")
        router.push("/admin")
        return
      }

      const data = await response.json()

      if (response.ok) {
        setSuccess("Question created successfully!")
        // Reset form
        setNewQuestionForm({
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          category: "",
          difficulty: "easy",
        })
        // Close modal and refresh data
        setShowAddQuestionModal(false)
        fetchDashboardData()
      } else {
        setError(data.error || "Failed to create question")
      }
    } catch (error) {
      console.error("Error creating question:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setNewQuestionForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleEditInputChange = (field: string, value: string | number | string[]) => {
    setEditQuestionForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...newQuestionForm.options]
    newOptions[index] = value
    setNewQuestionForm((prev) => ({ ...prev, options: newOptions }))
  }

  const handleEditOptionChange = (index: number, value: string) => {
    const newOptions = [...editQuestionForm.options]
    newOptions[index] = value
    setEditQuestionForm((prev) => ({ ...prev, options: newOptions }))
  }

  const addOption = () => {
    if (newQuestionForm.options.length < 6) {
      setNewQuestionForm((prev) => ({ ...prev, options: [...prev.options, ""] }))
    }
  }

  const addEditOption = () => {
    if (editQuestionForm.options.length < 6) {
      setEditQuestionForm((prev) => ({ ...prev, options: [...prev.options, ""] }))
    }
  }

  const removeOption = (index: number) => {
    if (newQuestionForm.options.length > 2) {
      const newOptions = newQuestionForm.options.filter((_, i) => i !== index)
      const newCorrectAnswer = newQuestionForm.correctAnswer >= index ? Math.max(0, newQuestionForm.correctAnswer - 1) : newQuestionForm.correctAnswer
      setNewQuestionForm((prev) => ({ ...prev, options: newOptions, correctAnswer: newCorrectAnswer }))
    }
  }

  const removeEditOption = (index: number) => {
    if (editQuestionForm.options.length > 2) {
      const newOptions = editQuestionForm.options.filter((_, i) => i !== index)
      const newCorrectAnswer = editQuestionForm.correctAnswer >= index ? Math.max(0, editQuestionForm.correctAnswer - 1) : editQuestionForm.correctAnswer
      setEditQuestionForm((prev) => ({ ...prev, options: newOptions, correctAnswer: newCorrectAnswer }))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
              <p>Loading dashboard...</p>
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
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <h1 className="text-2xl font-bold text-card-foreground">Admin Dashboard</h1>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalQuestions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Excellent Performers</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.excellentPerformers}</div>
                <p className="text-xs text-muted-foreground">90%+ scores</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="submissions">Quiz Submissions</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
            </TabsList>
            {activeTab === "questions" && (
              <Dialog open={showAddQuestionModal} onOpenChange={setShowAddQuestionModal}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Question</DialogTitle>
                    <DialogDescription>Add a new question to your quiz database</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddQuestion} className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert>
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="question">Question</Label>
                      <Textarea
                        id="question"
                        placeholder="Enter your question here..."
                        value={newQuestionForm.question}
                        onChange={(e) => handleInputChange("question", e.target.value)}
                        required
                        rows={3}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Options</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addOption}
                          disabled={newQuestionForm.options.length >= 6}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Option
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {newQuestionForm.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="flex-1">
                              <Input
                                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                required
                              />
                            </div>
                            <Button
                              type="button"
                              variant={newQuestionForm.correctAnswer === index ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleInputChange("correctAnswer", index)}
                            >
                              {newQuestionForm.correctAnswer === index ? "Correct" : "Mark Correct"}
                            </Button>
                            {newQuestionForm.options.length > 2 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeOption(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          placeholder="e.g., JavaScript, Data Structures"
                          value={newQuestionForm.category}
                          onChange={(e) => handleInputChange("category", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select
                          value={newQuestionForm.difficulty}
                          onValueChange={(value: "easy" | "medium" | "hard") =>
                            handleInputChange("difficulty", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowAddQuestionModal(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Question"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Quiz Submissions</CardTitle>
                <CardDescription>View and manage candidate assessment results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-muted-foreground">Recent submissions from candidates</div>
                  <Link href="/admin/analytics">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <TrendingUp className="h-4 w-4" />
                      View Analytics
                    </Button>
                  </Link>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Certificate</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission._id}>
                        <TableCell className="font-medium">{submission.userName}</TableCell>
                        <TableCell>{submission.userEmail}</TableCell>
                        <TableCell>{submission.score}/10</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              submission.percentage >= 90
                                ? "default"
                                : submission.percentage >= 70
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {submission.percentage}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {submission.certificateGenerated ? (
                            <Badge variant="default">Generated</Badge>
                          ) : (
                            <Badge variant="outline">Not Eligible</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(submission.completedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {submissions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No submissions found. Candidates will appear here after taking the quiz.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle>Question Management</CardTitle>
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewQuestion(question)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditQuestion(question)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
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
          </TabsContent>
        </Tabs>

        {/* Question View/Edit Modal */}
        <Dialog open={showQuestionModal} onOpenChange={setShowQuestionModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Edit Question" : "Question Details"}
              </DialogTitle>
              <DialogDescription>
                {isEditMode ? "Update question information" : "View question information"}
              </DialogDescription>
            </DialogHeader>
            
            {selectedQuestion && (
              <>
                {isEditMode ? (
                  <form onSubmit={handleUpdateQuestion} className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert>
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="edit-question">Question</Label>
                      <Textarea
                        id="edit-question"
                        placeholder="Enter your question here..."
                        value={editQuestionForm.question}
                        onChange={(e) => handleEditInputChange("question", e.target.value)}
                        required
                        rows={3}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Options</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addEditOption}
                          disabled={editQuestionForm.options.length >= 6}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Option
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {editQuestionForm.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="flex-1">
                              <Input
                                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                value={option}
                                onChange={(e) => handleEditOptionChange(index, e.target.value)}
                                required
                              />
                            </div>
                            <Button
                              type="button"
                              variant={editQuestionForm.correctAnswer === index ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleEditInputChange("correctAnswer", index)}
                            >
                              {editQuestionForm.correctAnswer === index ? "Correct" : "Mark Correct"}
                            </Button>
                            {editQuestionForm.options.length > 2 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeEditOption(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-category">Category</Label>
                        <Input
                          id="edit-category"
                          placeholder="e.g., JavaScript, Data Structures"
                          value={editQuestionForm.category}
                          onChange={(e) => handleEditInputChange("category", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-difficulty">Difficulty</Label>
                        <Select
                          value={editQuestionForm.difficulty}
                          onValueChange={(value: "easy" | "medium" | "hard") =>
                            handleEditInputChange("difficulty", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-status">Status</Label>
                        <Select
                          value={editQuestionForm.isActive ? "active" : "inactive"}
                          onValueChange={(value) =>
                            handleEditInputChange("isActive", value === "active")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowQuestionModal(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Updating..." : "Update Question"}
                      </Button>
                    </div>
                  </form>
                ) : (
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
                    <div className="grid grid-cols-3 gap-4">
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
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <p className="text-sm text-muted-foreground mt-1">
                          <Badge variant={selectedQuestion.isActive ? "default" : "outline"}>
                            {selectedQuestion.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        onClick={() => handleEditQuestion(selectedQuestion)}
                      >
                        Edit Question
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
