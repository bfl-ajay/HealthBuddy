/**
 * MongoDB API Backend for HealthBuddy
 * 
 * This is a simple Node.js/Express server that handles MongoDB operations
 * Install with: npm install express mongodb dotenv cors
 * 
 * Run with: node api/server.js
 */

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://healthbuddy:Health_1@healthbuddy.qtivokh.mongodb.net/?appName=healthBuddy';
const DB_NAME = 'healthbuddy';

let db = null;

// Initialize MongoDB
async function initMongoDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✓ MongoDB connected');
    return db;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error);
    throw error;
  }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// User Operations
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const usersCollection = db.collection('users');
    const existing = await usersCollection.findOne({ email });
    
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const user = {
      name,
      email,
      password, // Hash this in production!
      height: null,
      weight: null,
      age: null,
      bloodGroup: null,
      allergies: null,
      createdAt: new Date().toISOString()
    };
    
    const result = await usersCollection.insertOne(user);
    
    res.json({
      id: result.insertedId.toString(),
      ...user
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }
    
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email, password });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({
      id: user._id.toString(),
      ...user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user._id.toString(),
      ...user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const { height, weight, age, bloodGroup, allergies } = req.body;
    
    const usersCollection = db.collection('users');
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: {
          height,
          weight,
          age,
          bloodGroup,
          allergies,
          updatedAt: new Date().toISOString()
        }
      },
      { returnDocument: 'after' }
    );
    
    if (!result.value) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: result.value._id.toString(),
      ...result.value
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Session Operations
app.post('/api/sessions', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }
    
    const sessionsCollection = db.collection('sessions');
    
    // Clear existing sessions
    await sessionsCollection.deleteMany({ userId: new ObjectId(userId) });
    
    // Create new session
    const result = await sessionsCollection.insertOne({
      userId: new ObjectId(userId),
      isActive: true,
      createdAt: new Date().toISOString()
    });
    
    res.json({ sessionId: result.insertedId.toString() });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sessions/active', async (req, res) => {
  try {
    const sessionsCollection = db.collection('sessions');
    const session = await sessionsCollection.findOne({ isActive: true });
    
    if (!session) {
      return res.status(404).json({ error: 'No active session' });
    }
    
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: session.userId });
    
    res.json({
      id: user._id.toString(),
      ...user
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sessions/clear', async (req, res) => {
  try {
    const sessionsCollection = db.collection('sessions');
    await sessionsCollection.updateMany(
      { isActive: true },
      { $set: { isActive: false } }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Clear session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Blood Pressure Operations
app.post('/api/blood-pressure', async (req, res) => {
  try {
    const { userId, systolic, diastolic, heartRate } = req.body;
    
    if (!userId || !systolic || !diastolic || !heartRate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const bpCollection = db.collection('blood_pressure');
    const result = await bpCollection.insertOne({
      userId: new ObjectId(userId),
      systolic,
      diastolic,
      heartRate,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      id: result.insertedId.toString(),
      userId,
      systolic,
      diastolic,
      heartRate,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Add BP reading error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/blood-pressure/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const bpCollection = db.collection('blood_pressure');
    const readings = await bpCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ timestamp: -1 })
      .toArray();
    
    res.json(readings.map(r => ({
      id: r._id.toString(),
      userId: r.userId.toString(),
      systolic: r.systolic,
      diastolic: r.diastolic,
      heartRate: r.heartRate,
      timestamp: r.timestamp
    })));
  } catch (error) {
    console.error('Get BP readings error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/blood-pressure/:readingId', async (req, res) => {
  try {
    const { readingId } = req.params;
    const bpCollection = db.collection('blood_pressure');
    const result = await bpCollection.deleteOne({ _id: new ObjectId(readingId) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Reading not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete BP reading error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function start() {
  try {
    await initMongoDB();
    app.listen(PORT, () => {
      console.log(`\n✓ HealthBuddy API running on http://localhost:${PORT}`);
      console.log(`✓ MongoDB: ${DB_NAME}`);
      console.log('\nAPI Endpoints:');
      console.log('  POST   /api/users/register');
      console.log('  POST   /api/users/login');
      console.log('  GET    /api/users/:userId');
      console.log('  PUT    /api/users/:userId/profile');
      console.log('  POST   /api/sessions');
      console.log('  GET    /api/sessions/active');
      console.log('  POST   /api/sessions/clear');
      console.log('  POST   /api/blood-pressure');
      console.log('  GET    /api/blood-pressure/:userId');
      console.log('  DELETE /api/blood-pressure/:readingId');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
