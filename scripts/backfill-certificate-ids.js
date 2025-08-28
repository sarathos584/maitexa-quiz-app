require('dotenv').config({ path: '.env.local' })
const { MongoClient } = require('mongodb')

const MONGODB_URI = process.env.MONGO_URI
const DATABASE_NAME = 'maitexa_quiz'

function generateCertificateId(date = new Date()) {
  const year = date.getFullYear()
  const rand = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `MTX-${year}-${rand}`
}

async function run() {
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db(DATABASE_NAME)
  const col = db.collection('quiz_submissions')

  const cursor = col.find({ percentage: { $gte: 90 }, $or: [{ certificateId: { $exists: false } }, { certificateId: null }] })
  let count = 0
  while (await cursor.hasNext()) {
    const doc = await cursor.next()
    const certificateId = generateCertificateId(doc.completedAt || new Date())
    await col.updateOne({ _id: doc._id }, { $set: { certificateId, certificateGenerated: true } })
    count++
  }
  console.log(`Backfilled certificateId for ${count} submissions`)
  await client.close()
}

run().catch(err => { console.error(err); process.exit(1) })
