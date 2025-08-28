"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewQuestionPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    category: "",
    difficulty: "easy" as "easy" | "medium" | "hard",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData((prev) => ({ ...prev, options: newOptions }))
  }

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData((prev) => ({ ...prev, options: [...prev.options, ""] }))
    }
  }

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      const newCorrectAnswer = formData.correctAnswer >= index ? Math.max(0, formData.correctAnswer - 1) : formData.correctAnswer
      setFormData((prev) => ({ ...prev, options: newOptions, correctAnswer: newCorrectAnswer }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Validation
    if (!formData.question.trim()) {
      setError("Question is required")
      setIsLoading(false)
      return
    }

    if (formData.options.some(opt => !opt.trim())) {
      setError("All options must be filled")
      setIsLoading(false)
      return
    }

    if (!formData.category.trim()) {
      setError("Category is required")
      setIsLoading(false)
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
        body: JSON.stringify(formData),
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
        setFormData({
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          category: "",
          difficulty: "easy",
        })
        // Redirect after a short delay
        setTimeout(() => {
          router.push("/admin/questions")
        }, 1500)
      } else {
        setError(data.error || "Failed to create question")
      }
    } catch (error) {
      console.error("Error creating question:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin/questions">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Questions
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <h1 className="text-2xl font-bold text-card-foreground">Add New Question</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create New Question</CardTitle>
              <CardDescription>Add a new question to your quiz database</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Textarea
                    id="question"
                    placeholder="Enter your question here..."
                    value={formData.question}
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
                      disabled={formData.options.length >= 6}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Option
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.options.map((option, index) => (
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
                          variant={formData.correctAnswer === index ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleInputChange("correctAnswer", index)}
                        >
                          {formData.correctAnswer === index ? "Correct" : "Mark Correct"}
                        </Button>
                        {formData.options.length > 2 && (
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
                      value={formData.category}
                      onChange={(e) => handleInputChange("category", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={formData.difficulty}
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
                  <Link href="/admin/questions">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Question"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
