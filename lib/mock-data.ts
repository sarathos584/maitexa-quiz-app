// Mock data for demonstration when MongoDB is not configured

const inMemoryStorage: { [collection: string]: any[] } = {
  users: [],
  quiz_submissions: [],
  questions: [],
  admins: [],
}

export const mockQuestions = [
  {
    _id: "q1",
    question: "What is the correct way to declare a variable in JavaScript?",
    options: ["var x = 5;", "variable x = 5;", "v x = 5;", "declare x = 5;"],
    correctAnswer: 0,
    category: "JavaScript",
    difficulty: "Easy",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    _id: "q2",
    question: "Which of the following is NOT a JavaScript data type?",
    options: ["String", "Boolean", "Float", "Undefined"],
    correctAnswer: 2,
    category: "JavaScript",
    difficulty: "Easy",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    _id: "q3",
    question: "What does the '===' operator do in JavaScript?",
    options: ["Assigns a value", "Compares values only", "Compares values and types", "Creates a new variable"],
    correctAnswer: 2,
    category: "JavaScript",
    difficulty: "Medium",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    _id: "q4",
    question: "Which method is used to add an element to the end of an array?",
    options: ["push()", "pop()", "shift()", "unshift()"],
    correctAnswer: 0,
    category: "JavaScript",
    difficulty: "Easy",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    _id: "q5",
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correctAnswer: 1,
    category: "Algorithms",
    difficulty: "Medium",
    isActive: true,
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-16"),
  },
  {
    _id: "q6",
    question: "Which data structure uses LIFO (Last In, First Out) principle?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correctAnswer: 1,
    category: "Data Structures",
    difficulty: "Easy",
    isActive: true,
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-16"),
  },
  {
    _id: "q7",
    question: "What does CSS stand for?",
    options: ["Computer Style Sheets", "Creative Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"],
    correctAnswer: 2,
    category: "Web Development",
    difficulty: "Easy",
    isActive: true,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17"),
  },
  {
    _id: "q8",
    question: "Which HTTP method is used to update a resource?",
    options: ["GET", "POST", "PUT", "DELETE"],
    correctAnswer: 2,
    category: "Web Development",
    difficulty: "Medium",
    isActive: true,
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17"),
  },
  {
    _id: "q9",
    question: "What is the purpose of the 'useState' hook in React?",
    options: ["To manage component state", "To handle side effects", "To optimize performance", "To create components"],
    correctAnswer: 0,
    category: "React",
    difficulty: "Medium",
    isActive: true,
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-18"),
  },
  {
    _id: "q10",
    question: "Which sorting algorithm has the best average-case time complexity?",
    options: ["Bubble Sort", "Selection Sort", "Quick Sort", "Insertion Sort"],
    correctAnswer: 2,
    category: "Algorithms",
    difficulty: "Hard",
    isActive: true,
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-18"),
  },
]

export const mockUsers = [
  {
    _id: "u1",
    name: "Alice Johnson",
    email: "alice.johnson@email.com",
    company: "TechCorp Inc",
    college: "MIT",
    experience: "3 years",
    phone: "+1-555-0101",
    createdAt: new Date("2024-01-20T10:30:00Z"),
  },
  {
    _id: "u2",
    name: "Bob Smith",
    email: "bob.smith@email.com",
    company: "StartupXYZ",
    college: "Stanford University",
    experience: "2 years",
    phone: "+1-555-0102",
    createdAt: new Date("2024-01-21T14:15:00Z"),
  },
  {
    _id: "u3",
    name: "Carol Davis",
    email: "carol.davis@email.com",
    company: "BigTech Solutions",
    college: "UC Berkeley",
    experience: "5 years",
    phone: "+1-555-0103",
    createdAt: new Date("2024-01-22T09:45:00Z"),
  },
]

export const mockSubmissions = [
  {
    _id: "s1",
    userId: "u1",
    userName: "Alice Johnson",
    userEmail: "alice.johnson@email.com",
    answers: [0, 2, 2, 0, 1, 1, 2, 2, 0, 2], // 9/10 correct = 90%
    score: 90,
    totalQuestions: 10,
    correctAnswers: 9,
    submittedAt: new Date("2024-01-20T11:00:00Z"),
    certificateGenerated: true,
    certificateId: "cert_alice_2024_001",
  },
  {
    _id: "s2",
    userId: "u2",
    userName: "Bob Smith",
    userEmail: "bob.smith@email.com",
    answers: [0, 2, 2, 0, 1, 1, 2, 1, 0, 1], // 8/10 correct = 80%
    score: 80,
    totalQuestions: 10,
    correctAnswers: 8,
    submittedAt: new Date("2024-01-21T15:30:00Z"),
    certificateGenerated: false,
    certificateId: null,
  },
  {
    _id: "s3",
    userId: "u3",
    userName: "Carol Davis",
    userEmail: "carol.davis@email.com",
    answers: [0, 2, 2, 0, 1, 1, 2, 2, 0, 2], // 10/10 correct = 100%
    score: 100,
    totalQuestions: 10,
    correctAnswers: 10,
    submittedAt: new Date("2024-01-22T10:15:00Z"),
    certificateGenerated: true,
    certificateId: "cert_carol_2024_002",
  },
]

export const mockAdmin = {
  _id: "admin1",
  username: "admin",
  password: "$2b$10$rQZ8kHWKtGkVQ7K5wGxUVeJ7XZYQXqYvKGxUVeJ7XZYQXqYvKGxUVe", // "admin123"
  email: "admin@maitexa.com",
  role: "admin",
  createdAt: new Date("2024-01-01T00:00:00Z"),
}

export function storeMockData(collection: string, data: any) {
  if (!inMemoryStorage[collection]) {
    inMemoryStorage[collection] = []
  }
  inMemoryStorage[collection].push(data)
  return data
}

// Helper function to get mock data based on collection name and operation
export function getMockData(collection: string, operation: string, filter?: any, options?: any) {
  switch (collection) {
    case "questions":
      if (operation === "find") {
        let questions = [...mockQuestions, ...inMemoryStorage.questions]
        if (filter?.isActive !== undefined) {
          questions = questions.filter((q) => q.isActive === filter.isActive)
        }
        if (filter?._id) {
          if (filter._id.$in) {
            questions = questions.filter((q) => filter._id.$in.includes(q._id))
          } else {
            questions = questions.filter((q) => q._id === filter._id)
          }
        }
        if (options?.limit) {
          questions = questions.slice(0, options.limit)
        }
        return questions
      }
      if (operation === "findOne") {
        const allQuestions = [...mockQuestions, ...inMemoryStorage.questions]
        return allQuestions.find((q) => q._id === filter?._id) || null
      }
      break

    case "users":
      if (operation === "find") {
        return [...mockUsers, ...inMemoryStorage.users]
      }
      if (operation === "findOne") {
        const allUsers = [...mockUsers, ...inMemoryStorage.users]
        return allUsers.find((u) => u._id === filter?._id || u.email === filter?.email) || null
      }
      break

    case "quiz_submissions":
      if (operation === "find") {
        return [...mockSubmissions, ...inMemoryStorage.quiz_submissions]
      }
      if (operation === "findOne") {
        const allSubmissions = [...mockSubmissions, ...inMemoryStorage.quiz_submissions]
        return allSubmissions.find((s) => s._id === filter?._id) || null
      }
      if (operation === "aggregate") {
        // Handle analytics aggregations
        return getAnalyticsMockData()
      }
      break

    case "admins":
      if (operation === "findOne") {
        if (filter?.username === "admin") {
          return mockAdmin
        }
        const allAdmins = [mockAdmin, ...inMemoryStorage.admins]
        return allAdmins.find((a) => a._id === filter?._id || a.username === filter?.username) || null
      }
      break
  }

  return operation === "find" ? [] : null
}

function getAnalyticsMockData() {
  return [
    {
      _id: "JavaScript",
      count: 15,
      avgScore: 85.5,
      totalQuestions: 4,
    },
    {
      _id: "Algorithms",
      count: 12,
      avgScore: 78.2,
      totalQuestions: 2,
    },
    {
      _id: "Web Development",
      count: 18,
      avgScore: 82.1,
      totalQuestions: 2,
    },
    {
      _id: "React",
      count: 8,
      avgScore: 75.0,
      totalQuestions: 1,
    },
    {
      _id: "Data Structures",
      count: 10,
      avgScore: 88.5,
      totalQuestions: 1,
    },
  ]
}
