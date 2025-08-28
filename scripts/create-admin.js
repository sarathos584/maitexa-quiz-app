const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGO_URI;
const DATABASE_NAME = "maitexa_quiz";

async function createAdmin() {
  if (!MONGODB_URI) {
    console.error('MONGO_URI environment variable is not defined');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(DATABASE_NAME);
    const adminCollection = db.collection('admins');

    // Check if admin already exists
    const existingAdmin = await adminCollection.findOne({ email: 'admin@maitexa.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin user
    const adminUser = {
      email: 'admin@maitexa.com',
      password: hashedPassword,
      name: 'Admin User',
      createdAt: new Date()
    };

    const result = await adminCollection.insertOne(adminUser);
    console.log('Admin user created successfully:', result.insertedId);

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await client.close();
  }
}

createAdmin();
