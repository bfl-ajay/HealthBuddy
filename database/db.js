import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DB_NAME = 'healthgram.db';
const isWeb = Platform.OS === 'web';

let db = null;

// Initialize database based on platform
export const initDatabase = async () => {
  try {
    if (!isWeb) {
      // Use SQLite for mobile
      db = await SQLite.openDatabaseAsync(DB_NAME);
      
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          height REAL,
          weight REAL,
          age INTEGER,
          bloodGroup TEXT,
          allergies TEXT,
          createdAt TEXT NOT NULL
        );
      `);

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS blood_pressure (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          systolic INTEGER NOT NULL,
          diastolic INTEGER NOT NULL,
          heartRate INTEGER NOT NULL,
          timestamp TEXT NOT NULL,
          FOREIGN KEY (userId) REFERENCES users (id)
        );
      `);

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          isActive INTEGER DEFAULT 1,
          FOREIGN KEY (userId) REFERENCES users (id)
        );
      `);
    }
    
    console.log('Database initialized successfully for', Platform.OS);
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Web-specific storage helpers
const getWebUsers = async () => {
  const users = await AsyncStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

const setWebUsers = async (users) => {
  await AsyncStorage.setItem('users', JSON.stringify(users));
};

const getWebReadings = async (userId) => {
  const readings = await AsyncStorage.getItem(`bp_${userId}`);
  return readings ? JSON.parse(readings) : [];
};

const setWebReadings = async (userId, readings) => {
  await AsyncStorage.setItem(`bp_${userId}`, JSON.stringify(readings));
};

// User Operations
export const createUser = async (name, email, password) => {
  try {
    const createdAt = new Date().toISOString();

    if (isWeb) {
      // Web implementation with AsyncStorage
      const users = await getWebUsers();
      
      if (users.find(u => u.email === email)) {
        throw new Error('User already exists');
      }

      const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        createdAt
      };

      users.push(newUser);
      await setWebUsers(users);
      return newUser;
    } else {
      // Mobile implementation with SQLite
      const result = await db.runAsync(
        'INSERT INTO users (name, email, password, createdAt) VALUES (?, ?, ?, ?)',
        [name, email, password, createdAt]
      );

      return { id: result.lastInsertRowId, name, email, createdAt };
    }
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed') || error.message.includes('already exists')) {
      throw new Error('User already exists');
    }
    throw error;
  }
};

export const getUserByEmailAndPassword = async (email, password) => {
  try {
    if (isWeb) {
      const users = await getWebUsers();
      return users.find(u => u.email === email && u.password === password) || null;
    } else {
      const result = await db.getFirstAsync(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password]
      );
      return result;
    }
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    if (isWeb) {
      const users = await getWebUsers();
      return users.find(u => u.id === userId) || null;
    } else {
      const result = await db.getFirstAsync(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );
      return result;
    }
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const { height, weight, age, bloodGroup, allergies } = profileData;

    if (isWeb) {
      const users = await getWebUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      users[userIndex] = {
        ...users[userIndex],
        height,
        weight,
        age,
        bloodGroup,
        allergies
      };

      await setWebUsers(users);
      return users[userIndex];
    } else {
      await db.runAsync(
        `UPDATE users 
         SET height = ?, weight = ?, age = ?, bloodGroup = ?, allergies = ?
         WHERE id = ?`,
        [height, weight, age, bloodGroup, allergies, userId]
      );

      return await getUserById(userId);
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Session Operations
export const createSession = async (userId) => {
  try {
    if (isWeb) {
      await AsyncStorage.setItem('activeSession', JSON.stringify({ userId }));
    } else {
      await db.runAsync('UPDATE sessions SET isActive = 0 WHERE isActive = 1');
      await db.runAsync(
        'INSERT INTO sessions (userId, isActive) VALUES (?, 1)',
        [userId]
      );
    }
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

export const getActiveSession = async () => {
  try {
    if (isWeb) {
      const session = await AsyncStorage.getItem('activeSession');
      if (session) {
        const { userId } = JSON.parse(session);
        return await getUserById(userId);
      }
      return null;
    } else {
      const session = await db.getFirstAsync(
        'SELECT userId FROM sessions WHERE isActive = 1 LIMIT 1'
      );
      
      if (session) {
        return await getUserById(session.userId);
      }
      return null;
    }
  } catch (error) {
    console.error('Error getting active session:', error);
    return null;
  }
};

export const clearSession = async () => {
  try {
    if (isWeb) {
      await AsyncStorage.removeItem('activeSession');
    } else {
      await db.runAsync('UPDATE sessions SET isActive = 0 WHERE isActive = 1');
    }
  } catch (error) {
    console.error('Error clearing session:', error);
    throw error;
  }
};

// Blood Pressure Operations
export const addBloodPressureReading = async (userId, systolic, diastolic, heartRate) => {
  try {
    const timestamp = new Date().toISOString();

    if (isWeb) {
      const readings = await getWebReadings(userId);
      const newReading = {
        id: Date.now(),
        userId,
        systolic,
        diastolic,
        heartRate,
        timestamp
      };
      readings.unshift(newReading);
      await setWebReadings(userId, readings);
      return newReading;
    } else {
      const result = await db.runAsync(
        'INSERT INTO blood_pressure (userId, systolic, diastolic, heartRate, timestamp) VALUES (?, ?, ?, ?, ?)',
        [userId, systolic, diastolic, heartRate, timestamp]
      );

      return {
        id: result.lastInsertRowId,
        userId,
        systolic,
        diastolic,
        heartRate,
        timestamp
      };
    }
  } catch (error) {
    console.error('Error adding blood pressure reading:', error);
    throw error;
  }
};

export const getBloodPressureReadings = async (userId) => {
  try {
    if (isWeb) {
      return await getWebReadings(userId);
    } else {
      const readings = await db.getAllAsync(
        'SELECT * FROM blood_pressure WHERE userId = ? ORDER BY timestamp DESC',
        [userId]
      );
      return readings;
    }
  } catch (error) {
    console.error('Error getting blood pressure readings:', error);
    return [];
  }
};

export const deleteBloodPressureReading = async (readingId) => {
  try {
    if (isWeb) {
      // Not implemented for web in this version
      throw new Error('Delete not implemented for web');
    } else {
      await db.runAsync('DELETE FROM blood_pressure WHERE id = ?', [readingId]);
    }
  } catch (error) {
    console.error('Error deleting blood pressure reading:', error);
    throw error;
  }
};

// Utility functions
export const clearAllData = async () => {
  try {
    if (isWeb) {
      await AsyncStorage.multiRemove(['users', 'activeSession']);
      const keys = await AsyncStorage.getAllKeys();
      const bpKeys = keys.filter(k => k.startsWith('bp_'));
      await AsyncStorage.multiRemove(bpKeys);
    } else {
      await db.execAsync(`
        DELETE FROM blood_pressure;
        DELETE FROM sessions;
        DELETE FROM users;
      `);
    }
    console.log('All data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};
