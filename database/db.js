/**
 * Database API Layer
 * 
 * This layer communicates with the backend MongoDB API instead of using
 * the MongoDB driver directly (which doesn't work in Expo environment).
 * 
 * The backend API is in api/server.js
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Helper function to make API calls
 */
const apiCall = async (method, endpoint, data = null) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API call failed: ${method} ${endpoint}`, error);
    throw error;
  }
};

// Database initialization
export const initDatabase = async () => {
  try {
    // Test connection to API
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`);
    if (!response.ok) {
      throw new Error('API health check failed');
    }
    console.log('✓ Database API connected');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

export const closeDatabase = async () => {
  // No-op for API-based connection
  console.log('Database connection closed');
};

// User Operations
export const createUser = async (name, email, password) => {
  try {
    const result = await apiCall('POST', '/users/register', {
      name,
      email,
      password
    });
    return {
      id: result.id,
      name: result.name,
      email: result.email,
      createdAt: result.createdAt
    };
  } catch (error) {
    if (error.message.includes('already exists')) {
      throw new Error('User already exists');
    }
    throw error;
  }
};

export const getUserByEmailAndPassword = async (email, password) => {
  try {
    const result = await apiCall('POST', '/users/login', {
      email,
      password
    });
    return result;
  } catch (error) {
    if (error.message.includes('Invalid credentials')) {
      return null;
    }
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const result = await apiCall('GET', `/users/${userId}`);
    return result;
  } catch (error) {
    if (error.message.includes('not found')) {
      return null;
    }
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const result = await apiCall('PUT', `/users/${userId}/profile`, profileData);
    return result;
  } catch (error) {
    throw error;
  }
};

// Session Operations
export const createSession = async (userId) => {
  try {
    await apiCall('POST', '/sessions', { userId });
  } catch (error) {
    throw error;
  }
};

export const getActiveSession = async () => {
  try {
    const result = await apiCall('GET', '/sessions/active');
    return result;
  } catch (error) {
    if (error.message.includes('No active session')) {
      return null;
    }
    throw error;
  }
};

export const clearSession = async () => {
  try {
    await apiCall('POST', '/sessions/clear');
  } catch (error) {
    throw error;
  }
};

// Blood Pressure Operations
export const addBloodPressureReading = async (userId, systolic, diastolic, heartRate) => {
  try {
    const result = await apiCall('POST', '/blood-pressure', {
      userId,
      systolic,
      diastolic,
      heartRate
    });
    return result;
  } catch (error) {
    throw error;
  }
};

export const getBloodPressureReadings = async (userId) => {
  try {
    const result = await apiCall('GET', `/blood-pressure/${userId}`);
    return result || [];
  } catch (error) {
    console.error('Error getting blood pressure readings:', error);
    return [];
  }
};

export const deleteBloodPressureReading = async (readingId) => {
  try {
    await apiCall('DELETE', `/blood-pressure/${readingId}`);
  } catch (error) {
    throw error;
  }
};

// Utility functions
export const clearAllData = async () => {
  // Not implemented in API for safety
  throw new Error('clearAllData not available via API');
};

export const getMongoClient = () => {
  return null;
};

export const getMongoDb = () => {
  return null;
};
