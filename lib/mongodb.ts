import { MongoClient, Db } from 'mongodb'

const MONGODB_URI = process.env.MONGO_URI
const DATABASE_NAME = "maitexa_quiz"

let client: MongoClient | null = null
let db: Db | null = null

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error('MONGO_URI environment variable is not defined')
  }

  if (client && db) {
    return { client, db }
  }

  try {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    db = client.db(DATABASE_NAME)
    
    console.log('Connected to MongoDB successfully')
    return { client, db }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}

export async function getCollection(name: string) {
  const { db } = await connectToDatabase()
  return db.collection(name)
}

export async function closeConnection() {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}

// Legacy compatibility
export async function getDatabase() {
  const { db } = await connectToDatabase()
  return {
    collection: (name: string) => db.collection(name),
  }
}

export default Promise.resolve(null) // For compatibility
