const MONGODB_DATA_API_URL = process.env.MONGODB_DATA_API_URL
const MONGODB_API_KEY = process.env.MONGODB_API_KEY
const DATABASE_NAME = "maitexa_quiz"

const sampleQuestions = [
  {
    question: "What is the time complexity of accessing an element in an array by index?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correctAnswer: 0,
    category: "Data Structures",
    difficulty: "easy",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    question: "Which of the following is NOT a valid JavaScript data type?",
    options: ["undefined", "boolean", "float", "symbol"],
    correctAnswer: 2,
    category: "JavaScript",
    difficulty: "easy",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    question: "What does the 'this' keyword refer to in JavaScript?",
    options: ["The global object", "The current function", "The object that owns the method", "The parent object"],
    correctAnswer: 2,
    category: "JavaScript",
    difficulty: "medium",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    question: "Which sorting algorithm has the best average-case time complexity?",
    options: ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"],
    correctAnswer: 2,
    category: "Algorithms",
    difficulty: "medium",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    question: "What is the purpose of the 'async' keyword in JavaScript?",
    options: [
      "To make a function synchronous",
      "To make a function return a Promise",
      "To handle errors",
      "To create a new thread",
    ],
    correctAnswer: 1,
    category: "JavaScript",
    difficulty: "medium",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    question: "Which data structure uses LIFO (Last In, First Out) principle?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correctAnswer: 1,
    category: "Data Structures",
    difficulty: "easy",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    question: "What is the space complexity of the merge sort algorithm?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 2,
    category: "Algorithms",
    difficulty: "hard",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    question: "Which HTTP method is idempotent?",
    options: ["POST", "PUT", "PATCH", "All of the above"],
    correctAnswer: 1,
    category: "Web Development",
    difficulty: "medium",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    question: "What is closure in JavaScript?",
    options: [
      "A way to close a function",
      "A function with access to outer scope variables",
      "A method to end execution",
      "A type of loop",
    ],
    correctAnswer: 1,
    category: "JavaScript",
    difficulty: "hard",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    question: "Which of the following is a NoSQL database?",
    options: ["MySQL", "PostgreSQL", "MongoDB", "SQLite"],
    correctAnswer: 2,
    category: "Databases",
    difficulty: "easy",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

async function seedQuestions() {
  if (!MONGODB_DATA_API_URL || !MONGODB_API_KEY) {
    console.log("MongoDB Data API not configured. Using mock data in development.")
    console.log("Questions will be available when you configure the MongoDB Atlas Data API.")
    return
  }

  try {
    console.log("Seeding questions via MongoDB Atlas Data API...")

    // Clear existing questions
    await fetch(`${MONGODB_DATA_API_URL}/action/deleteMany`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": MONGODB_API_KEY,
      },
      body: JSON.stringify({
        collection: "questions",
        database: DATABASE_NAME,
        filter: {},
      }),
    })

    console.log("Cleared existing questions")

    // Insert sample questions
    const response = await fetch(`${MONGODB_DATA_API_URL}/action/insertMany`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": MONGODB_API_KEY,
      },
      body: JSON.stringify({
        collection: "questions",
        database: DATABASE_NAME,
        documents: sampleQuestions,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const result = await response.json()
    console.log(`Inserted ${result.insertedIds?.length || sampleQuestions.length} questions`)
    console.log("Questions seeded successfully!")
  } catch (error) {
    console.error("Error seeding questions:", error)
  }
}

seedQuestions()
