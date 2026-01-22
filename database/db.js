import { MongoClient, ObjectId } from 'mongodb';

// MongoDB Connection
const MONGODB_URI = process.env.EXPO_PUBLIC_MONGODB_URI || 'mongodb+srv://healthbuddy:Health_1@healthbuddy.qtivokh.mongodb.net/?appName=healthBuddy';
const DB_NAME = 'healthbuddy';
const COLLECTIONS = {
  USERS: 'users',
  BLOOD_PRESSURE: 'blood_pressure',
  SESSIONS: 'sessions'
};

let client = null;
let db = null;

// Initialize MongoDB connection
export const initDatabase = async () => {
  try {
    if (!client) {
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      db = client.db(DB_NAME);
      
      // Create collections if they don't exist
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      if (!collectionNames.includes(COLLECTIONS.USERS)) {
        await db.createCollection(COLLECTIONS.USERS);
        // Create unique index on email
        await db.collection(COLLECTIONS.USERS).createIndex({ email: 1 }, { unique: true });
      }
      
      if (!collectionNames.includes(COLLECTIONS.BLOOD_PRESSURE)) {
        await db.createCollection(COLLECTIONS.BLOOD_PRESSURE);
        // Create index on userId for faster queries
        await db.collection(COLLECTIONS.BLOOD_PRESSURE).createIndex({ userId: 1, timestamp: -1 });
      }
      
      if (!collectionNames.includes(COLLECTIONS.SESSIONS)) {
        await db.createCollection(COLLECTIONS.SESSIONS);
        // Create index on userId
        await db.collection(COLLECTIONS.SESSIONS).createIndex({ userId: 1 });
      }
    }
    
    console.log('MongoDB Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing MongoDB:', error);
    throw error;
  }
};

// Close database connection
export const closeDatabase = async () => {
  try {
    if (client) {
      await client.close();
      client = null;
      db = null;
      console.log('MongoDB connection closed');
    }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    throw error;
  }
};

// User Operations
export const createUser = async (name, email, password) => {
  try {
    if (!db) throw new Error('Database not initialized');
    
    const createdAt = new Date().toISOString();
    const usersCollection = db.collection(COLLECTIONS.USERS);
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const newUser = {
      name,
      email,
      password,
      height: null,
      weight: null,
      age: null,
      bloodGroup: null,
      allergies: null,
      createdAt
    };
    
    const result = await usersCollection.insertOne(newUser);
    
    return {
      id: result.insertedId.toString(),
      ...newUser
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUserByEmailAndPassword = async (email, password) => {
  try {
    if (!db) throw new Error('Database not initialized');
    
    const usersCollection = db.collection(COLLECTIONS.USERS);
    const user = await usersCollection.findOne({ email, password });
    
    if (user) {
      return {
        id: user._id.toString(),
        ...user
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    if (!db) throw new Error('Database not initialized');
    
    const usersCollection = db.collection(COLLECTIONS.USERS);
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (user) {
      return {
        id: user._id.toString(),
        ...user
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    if (!db) throw new Error('Database not initialized');
    
    const { height, weight, age, bloodGroup, allergies } = profileData;
    const usersCollection = db.collection(COLLECTIONS.USERS);
    
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
    
    if (result.value) {
      return {
        id: result.value._id.toString(),
        ...result.value
      };
    }
    
    throw new Error('User not found');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Session Operations
export const createSession = async (userId) => {
  try {
    if (!db) throw new Error('Database not initialized');
    
    const sessionsCollection = db.collection(COLLECTIONS.SESSIONS);
    
    // Clear any existing active sessions for this user
    await sessionsCollection.deleteMany({ userId: new ObjectId(userId) });
    
    // Create new session
    const session = {
      userId: new ObjectId(userId),
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    await sessionsCollection.insertOne(session);
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

export const getActiveSession = async () => {
  try {
    if (!db) throw new Error('Database not initialized');
    
    const sessionsCollection = db.collection(COLLECTIONS.SESSIONS);
    const session = await sessionsCollection.findOne({ isActive: true });
    
    if (session) {
      return await getUserById(session.userId.toString());
    }
    
    return null;
  } catch (error) {
    console.error('Error getting active session:', error);
    return null;
  }
};

export const clearSession = async () => {
  try {
    if (!db) throw new Error('Database not initialized');
    
    const sessionsCollection = db.collection(COLLECTIONS.SESSIONS);
    await sessionsCollection.updateMany(
      { isActive: true },
      { $set: { isActive: false } }
    );
  } catch (error) {
    console.error('Error clearing session:', error);
    throw error;
  }
};

// Blood Pressure Operations
export const addBloodPressureReading = async (userId, systolic, diastolic, heartRate) => {
  try {
    if (!db) throw new Error('Database not initialized');
    
    const timestamp = new Date().toISOString();
    const bpCollection = db.collection(COLLECTIONS.BLOOD_PRESSURE);
    
    const newReading = {
      userId: new ObjectId(userId),
      systolic,
      diastolic,
      heartRate,
      timestamp
    };
    
    const result = await bpCollection.insertOne(newReading);
    
    return {
      id: result.insertedId.toString(),
      userId,
      systolic,
      diastolic,
      heartRate,
      timestamp
    };
  } catch (error) {
    console.error('Error adding blood pressure reading:', error);
    throw error;
  }
};

export const getBloodPressureReadings = async (userId) => {
  try {
    if (!db) throw new Error('Database not initialized');
    
    const bpCollection = db.collection(COLLECTIONS.BLOOD_PRESSURE);
    const readings = await bpCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ timestamp: -1 })
      .toArray();
    
    return readings.map(reading => ({
      id: reading._id.toString(),
      userId: reading.userId.toString(),
      systolic: reading.systolic,
      diastolic: reading.diastolic,
      heartRate: reading.heartRate,
      timestamp: reading.timestamp
    }));
  } catch (error) {
    console.error('Error getting blood pressure readings:', error);
    return [];
  }
};

export const deleteBloodPressureReading = async (readingId) => {
  try {
    if (!db) throw new Error('Database not initialized');
    
    const bpCollection = db.collection(COLLECTIONS.BLOOD_PRESSURE);
    const result = await bpCollection.deleteOne({ _id: new ObjectId(readingId) });
    
    if (result.deletedCount === 0) {
      throw new Error('Reading not found');
    }
  } catch (error) {
    console.error('Error deleting blood pressure reading:', error);
    throw error;
  }
};

// Utility functions
export const clearAllData = async () => {
  try {
    if (!db) throw new Error('Database not initialized');
    
    const collections = [
      COLLECTIONS.BLOOD_PRESSURE,
      COLLECTIONS.SESSIONS,
      COLLECTIONS.USERS
    ];
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      await collection.deleteMany({});
    }
    
    console.log('All data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};

// Export MongoDB client for advanced queries if needed
export const getMongoClient = () => client;
export const getMongoDb = () => db;
