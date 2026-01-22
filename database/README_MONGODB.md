# MongoDB Database Documentation

## Overview

The HealthBuddy application now uses **MongoDB Atlas** as its cloud-based database. Data is automatically synchronized across all platforms (Web, iOS, Android).

## Connection Configuration

### Connection String

```
mongodb+srv://healthbuddy:Health_1@healthbuddy.qtivokh.mongodb.net/?appName=healthBuddy
```

### Environment Variable

Set `EXPO_PUBLIC_MONGODB_URI` in your `.env.local` or deployment platform:

```bash
EXPO_PUBLIC_MONGODB_URI=mongodb+srv://healthbuddy:Health_1@healthbuddy.qtivokh.mongodb.net/?appName=healthBuddy
```

## Database: healthbuddy

### Collections

#### users

User account and profile information.

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String,
  height: Number | null,
  weight: Number | null,
  age: Number | null,
  bloodGroup: String | null,
  allergies: String | null,
  createdAt: ISO8601 String,
  updatedAt: ISO8601 String (optional)
}
```

**Indexes:** UNIQUE constraint on `email`

#### blood_pressure

Blood pressure readings for users.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  systolic: Number,
  diastolic: Number,
  heartRate: Number,
  timestamp: ISO8601 String
}
```

**Indexes:** Compound index on `userId` + `timestamp` (descending)

#### sessions

User login sessions.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  isActive: Boolean,
  createdAt: ISO8601 String
}
```

**Indexes:** Index on `userId`

## API Functions

### User Operations

```javascript
// Create user
await createUser(name, email, password)

// Get user by credentials
await getUserByEmailAndPassword(email, password)

// Get user by ID
await getUserById(userId)

// Update profile
await updateUserProfile(userId, { height, weight, age, bloodGroup, allergies })
```

### Session Operations

```javascript
// Create session
await createSession(userId)

// Get active session
await getActiveSession()

// Clear session
await clearSession()
```

### Blood Pressure Operations

```javascript
// Add reading
await addBloodPressureReading(userId, systolic, diastolic, heartRate)

// Get readings
await getBloodPressureReadings(userId)

// Delete reading
await deleteBloodPressureReading(readingId)
```

### Utility Functions

```javascript
// Initialize database
await initDatabase()

// Close connection
await closeDatabase()

// Clear all data
await clearAllData()

// Get MongoDB client
getMongoClient()

// Get MongoDB database
getMongoDb()
```

## Setup Instructions

### 1. Initialize Database

Call this before any database operations:

```javascript
import { initDatabase } from './database/db';

// In your app initialization
await initDatabase();
```

### 2. Environment Setup

Create `.env.local`:

```bash
EXPO_PUBLIC_MONGODB_URI=mongodb+srv://healthbuddy:Health_1@healthbuddy.qtivokh.mongodb.net/?appName=healthBuddy
```

### 3. Dependencies

Install MongoDB driver:

```bash
npm install mongodb --legacy-peer-deps
```

## Data Relationships

```
users (1) ──────< (many) blood_pressure
  │
  └──────< (many) sessions
```

## Security

⚠️ **Important:**

- Credentials are in the connection string
- For production, use IP whitelist in MongoDB Atlas
- Consider environment-based credentials
- Hash passwords before storing
- Never commit `.env` files with real credentials

### MongoDB Atlas IP Whitelist

1. Go to MongoDB Atlas Dashboard
2. **Network Access** → **Add IP Address**
3. Add your server's IP

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Database not initialized" | Call `initDatabase()` first |
| Connection timeout | Check IP whitelist in MongoDB Atlas |
| "ENOTFOUND" | Verify connection string syntax |
| "Authentication failed" | Check MongoDB credentials |

## Migration from SQLite

**Changes:**
- ✅ Cloud-based storage
- ✅ Cross-device sync
- ✅ No local storage limits
- ✅ Automatic backups
- ✅ Scalable

**Breaking changes:**
- All operations are async
- User IDs are ObjectId strings
- Data stored in cloud, not locally

---

**Version:** 2.0 (MongoDB)  
**Updated:** January 22, 2026
