const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGO_URI;
const DATABASE_NAME = "maitexa_quiz";

const mockSubmissions = [
  {
    userId: "user_001",
    userName: "John Doe",
    userEmail: "john.doe@example.com",
    answers: [
      { questionId: "q1", selectedAnswer: 0, isCorrect: true },
      { questionId: "q2", selectedAnswer: 2, isCorrect: false },
      { questionId: "q3", selectedAnswer: 2, isCorrect: true },
      { questionId: "q4", selectedAnswer: 2, isCorrect: true },
      { questionId: "q5", selectedAnswer: 1, isCorrect: true },
      { questionId: "q6", selectedAnswer: 1, isCorrect: true },
      { questionId: "q7", selectedAnswer: 2, isCorrect: true },
      { questionId: "q8", selectedAnswer: 1, isCorrect: true },
      { questionId: "q9", selectedAnswer: 1, isCorrect: true },
      { questionId: "q10", selectedAnswer: 2, isCorrect: true }
    ],
    score: 9,
    percentage: 90,
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    certificateGenerated: true
  },
  {
    userId: "user_002",
    userName: "Jane Smith",
    userEmail: "jane.smith@example.com",
    answers: [
      { questionId: "q1", selectedAnswer: 0, isCorrect: true },
      { questionId: "q2", selectedAnswer: 3, isCorrect: true },
      { questionId: "q3", selectedAnswer: 2, isCorrect: true },
      { questionId: "q4", selectedAnswer: 2, isCorrect: true },
      { questionId: "q5", selectedAnswer: 1, isCorrect: true },
      { questionId: "q6", selectedAnswer: 1, isCorrect: true },
      { questionId: "q7", selectedAnswer: 2, isCorrect: true },
      { questionId: "q8", selectedAnswer: 1, isCorrect: true },
      { questionId: "q9", selectedAnswer: 1, isCorrect: true },
      { questionId: "q10", selectedAnswer: 2, isCorrect: true }
    ],
    score: 10,
    percentage: 100,
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    certificateGenerated: true
  },
  {
    userId: "user_003",
    userName: "Mike Johnson",
    userEmail: "mike.johnson@example.com",
    answers: [
      { questionId: "q1", selectedAnswer: 0, isCorrect: true },
      { questionId: "q2", selectedAnswer: 2, isCorrect: false },
      { questionId: "q3", selectedAnswer: 0, isCorrect: false },
      { questionId: "q4", selectedAnswer: 1, isCorrect: false },
      { questionId: "q5", selectedAnswer: 1, isCorrect: true },
      { questionId: "q6", selectedAnswer: 1, isCorrect: true },
      { questionId: "q7", selectedAnswer: 3, isCorrect: false },
      { questionId: "q8", selectedAnswer: 1, isCorrect: true },
      { questionId: "q9", selectedAnswer: 0, isCorrect: false },
      { questionId: "q10", selectedAnswer: 2, isCorrect: true }
    ],
    score: 5,
    percentage: 50,
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    certificateGenerated: false
  },
  {
    userId: "user_004",
    userName: "Sarah Wilson",
    userEmail: "sarah.wilson@example.com",
    answers: [
      { questionId: "q1", selectedAnswer: 0, isCorrect: true },
      { questionId: "q2", selectedAnswer: 3, isCorrect: true },
      { questionId: "q3", selectedAnswer: 2, isCorrect: true },
      { questionId: "q4", selectedAnswer: 2, isCorrect: true },
      { questionId: "q5", selectedAnswer: 1, isCorrect: true },
      { questionId: "q6", selectedAnswer: 1, isCorrect: true },
      { questionId: "q7", selectedAnswer: 2, isCorrect: true },
      { questionId: "q8", selectedAnswer: 1, isCorrect: true },
      { questionId: "q9", selectedAnswer: 1, isCorrect: true },
      { questionId: "q10", selectedAnswer: 2, isCorrect: true }
    ],
    score: 10,
    percentage: 100,
    completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    certificateGenerated: true
  },
  {
    userId: "user_005",
    userName: "David Brown",
    userEmail: "david.brown@example.com",
    answers: [
      { questionId: "q1", selectedAnswer: 0, isCorrect: true },
      { questionId: "q2", selectedAnswer: 2, isCorrect: false },
      { questionId: "q3", selectedAnswer: 2, isCorrect: true },
      { questionId: "q4", selectedAnswer: 2, isCorrect: true },
      { questionId: "q5", selectedAnswer: 1, isCorrect: true },
      { questionId: "q6", selectedAnswer: 1, isCorrect: true },
      { questionId: "q7", selectedAnswer: 2, isCorrect: true },
      { questionId: "q8", selectedAnswer: 1, isCorrect: true },
      { questionId: "q9", selectedAnswer: 1, isCorrect: true },
      { questionId: "q10", selectedAnswer: 2, isCorrect: true }
    ],
    score: 9,
    percentage: 90,
    completedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    certificateGenerated: true
  }
];

async function seedSubmissions() {
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
    const submissionsCollection = db.collection('quiz_submissions');

    // Clear existing submissions
    await submissionsCollection.deleteMany({});
    console.log('Cleared existing submissions');

    // Insert mock submissions
    const result = await submissionsCollection.insertMany(mockSubmissions);
    console.log(`Inserted ${result.insertedIds ? Object.keys(result.insertedIds).length : mockSubmissions.length} submissions`);
    console.log('Submissions seeded successfully!');

  } catch (error) {
    console.error('Error seeding submissions:', error);
  } finally {
    await client.close();
  }
}

seedSubmissions();
