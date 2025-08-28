const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGO_URI;
const DATABASE_NAME = "maitexa_quiz";

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
];

async function seedQuestions() {
  if (!MONGODB_URI) {
    console.error('MONGO_URI environment variable is not defined');
    console.error('Please check your .env.local file');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(DATABASE_NAME);
    const questionsCollection = db.collection('questions');

    // Clear existing questions
    await questionsCollection.deleteMany({});
    console.log('Cleared existing questions');

    // Insert sample questions
    const result = await questionsCollection.insertMany(sampleQuestions);
    console.log(`Inserted ${result.insertedIds ? Object.keys(result.insertedIds).length : sampleQuestions.length} questions`);
    console.log('Questions seeded successfully!');

  } catch (error) {
    console.error('Error seeding questions:', error);
  } finally {
    await client.close();
  }
}

seedQuestions();
