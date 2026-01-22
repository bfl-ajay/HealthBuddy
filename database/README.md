# MongoDB Database Setup

## Overview
The application now uses **MongoDB** as the cloud-based database. Data is stored in MongoDB Atlas with automatic synchronization across all platforms (Web, iOS, Android).

## Connection Configuration

The application connects to MongoDB Atlas using:
```
mongodb+srv://healthbuddy:Health_1@healthbuddy.qtivokh.mongodb.net/?appName=healthBuddy
```

### Environment Variables

Set `EXPO_PUBLIC_MONGODB_URI` for custom connection:
```bash
EXPO_PUBLIC_MONGODB_URI=mongodb+srv://healthbuddy:Health_1@healthbuddy.qtivokh.mongodb.net/?appName=healthBuddy
```

## Database: healthbuddy

### Collections

#### 1. **users** collection
Stores user account and profile information.

```sql
CREATE TABLE blood_pressure (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  systolic INTEGER NOT NULL,
  diastolic INTEGER NOT NULL,
  heartRate INTEGER NOT NULL,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users (id)
);
```

**Columns:**
- `id` - Auto-incrementing primary key
- `userId` - Foreign key referencing users.id
- `systolic` - Systolic blood pressure (mmHg)
- `diastolic` - Diastolic blood pressure (mmHg)
- `heartRate` - Heart rate in beats per minute (BPM)
- `timestamp` - Reading timestamp (ISO 8601 format)

**Relationships:**
- Many-to-one with `users` table

---

#### 3. **sessions** table
Manages user login sessions.

```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  isActive INTEGER DEFAULT 1,
  FOREIGN KEY (userId) REFERENCES users (id)
);
```

**Columns:**
- `id` - Auto-incrementing primary key
- `userId` - Foreign key referencing users.id
- `isActive` - Boolean flag (1 = active, 0 = inactive)

**Relationships:**
- Many-to-one with `users` table

**Note:** Only one session can be active at a time

---

## Database Operations

### User Operations

#### Register New User
```javascript
createUser(name, email, password)
```
- Creates new user account
- Returns user object with generated ID
- Throws error if email already exists

#### Login User
```javascript
getUserByEmailAndPassword(email, password)
```
- Validates credentials
- Returns user object if valid
- Returns null if invalid

#### Update Profile
```javascript
updateUserProfile(userId, { height, weight, age, bloodGroup, allergies })
```
- Updates user health information
- Returns updated user object

#### Get User by ID
```javascript
getUserById(userId)
```
- Retrieves user information by ID

---

### Session Operations

#### Create Session
```javascript
createSession(userId)
```
- Clears any existing active sessions
- Creates new active session for user

#### Get Active Session
```javascript
getActiveSession()
```
- Returns currently logged-in user
- Returns null if no active session

#### Clear Session (Logout)
```javascript
clearSession()
```
- Deactivates current session

---

### Blood Pressure Operations

#### Add Reading
```javascript
addBloodPressureReading(userId, systolic, diastolic, heartRate)
```
- Creates new blood pressure record
- Auto-generates timestamp
- Returns reading object with ID

#### Get User Readings
```javascript
getBloodPressureReadings(userId)
```
- Returns all readings for user
- Ordered by timestamp (newest first)

#### Delete Reading
```javascript
deleteBloodPressureReading(readingId)
```
- Removes specific blood pressure reading

---

## Utility Functions

### Get All Tables
```javascript
getAllTables()
```
- Returns list of all database tables
- Useful for debugging

### Clear All Data
```javascript
clearAllData()
```
- Deletes all records from all tables
- Useful for testing/development
- ⚠️ **Warning:** This is irreversible!

---

## Data Relationships

```
users (1) ──────< (many) blood_pressure
  │
  └──────< (many) sessions
```

- One user can have many blood pressure readings
- One user can have many sessions (but only one active)

---

## Query Examples

### Get user with their readings
```sql
SELECT u.*, bp.*
FROM users u
LEFT JOIN blood_pressure bp ON u.id = bp.userId
WHERE u.id = ?
ORDER BY bp.timestamp DESC;
```

### Get average blood pressure for user
```sql
SELECT 
  AVG(systolic) as avgSystolic,
  AVG(diastolic) as avgDiastolic,
  AVG(heartRate) as avgHeartRate
FROM blood_pressure
WHERE userId = ?;
```

### Get latest reading
```sql
SELECT * FROM blood_pressure
WHERE userId = ?
ORDER BY timestamp DESC
LIMIT 1;
```

---

## Best Practices

1. **Always initialize database** before any operations:
   ```javascript
   await initDatabase();
   ```

2. **Check database initialization** in components:
   ```javascript
   if (!dbInitialized) {
     throw new Error('Database not initialized');
   }
   ```

3. **Handle errors gracefully**:
   ```javascript
   try {
     await createUser(name, email, password);
   } catch (error) {
     if (error.message.includes('UNIQUE constraint')) {
       // Handle duplicate user
     }
   }
   ```

4. **Use transactions for multiple operations** (future enhancement)

5. **Regular backups** (future enhancement)

---

## Migration Notes

### From AsyncStorage to SQLite

**What changed:**
- ✅ Structured relational data
- ✅ Type safety with defined schemas
- ✅ Better query capabilities
- ✅ Foreign key relationships
- ✅ More efficient for large datasets

**Migration path:**
- Old data in AsyncStorage is not automatically migrated
- Users will need to re-register
- This is a breaking change from previous version

---

## Future Enhancements

### Planned Features:
1. **Indexes** on frequently queried columns
2. **Full-text search** for allergies
3. **Aggregated health metrics** table
4. **Medication tracking** table
5. **Appointments** table
6. **Data export/import** functionality
7. **Database encryption** for security
8. **Automatic backups**

### Additional Tables (Planned):
```sql
-- Weight History
CREATE TABLE weight_history (
  id INTEGER PRIMARY KEY,
  userId INTEGER,
  weight REAL,
  timestamp TEXT,
  FOREIGN KEY (userId) REFERENCES users (id)
);

-- Medications
CREATE TABLE medications (
  id INTEGER PRIMARY KEY,
  userId INTEGER,
  name TEXT,
  dosage TEXT,
  frequency TEXT,
  startDate TEXT,
  endDate TEXT,
  FOREIGN KEY (userId) REFERENCES users (id)
);
```

---

## Performance Considerations

- **Indexes:** Consider adding indexes if dataset grows large
- **Pagination:** Implement for blood pressure history
- **Cleanup:** Periodic removal of old sessions
- **Optimization:** Use prepared statements for repeated queries

---

## Security Notes

⚠️ **Current Implementation:**
- Passwords stored as plain text
- No encryption at rest
- Local device storage only

🔒 **Production Recommendations:**
- Hash passwords (bcrypt, argon2)
- Enable SQLCipher for database encryption
- Implement proper authentication tokens
- Add data validation at database level

---

## Database Location

- **iOS:** Library/LocalDatabase/
- **Android:** /data/data/[package]/databases/
- **Web:** IndexedDB (via expo-sqlite web polyfill)

---

**Database Version:** 1.0  
**Last Updated:** January 21, 2026
