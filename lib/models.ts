export interface User {
  _id?: string
  name: string
  email: string
  company: string
  college: string
  experience: string
  phone: string
  createdAt: Date
}

export interface Question {
  _id?: string
  question: string
  options: string[]
  correctAnswer: number
  category: string
  difficulty: "easy" | "medium" | "hard"
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface QuizSubmission {
  _id?: string
  userId: string
  userName: string
  userEmail: string
  answers: {
    questionId: string
    selectedAnswer: number
    isCorrect: boolean
  }[]
  score: number
  percentage: number
  completedAt: Date
  certificateGenerated: boolean
}

export interface Admin {
  _id?: string
  email: string
  password: string
  name: string
  createdAt: Date
}
