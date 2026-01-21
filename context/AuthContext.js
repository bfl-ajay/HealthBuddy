import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  initDatabase,
  createUser as dbCreateUser,
  getUserByEmailAndPassword,
  updateUserProfile as dbUpdateUserProfile,
  createSession,
  getActiveSession,
  clearSession,
  addBloodPressureReading as dbAddBloodPressureReading,
  getBloodPressureReadings as dbGetBloodPressureReadings,
} from '../database/db';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    initDB();
  }, []);

  const initDB = async () => {
    try {
      await initDatabase();
      setDbInitialized(true);
      await loadUser();
    } catch (error) {
      console.error('Error initializing database:', error);
      setLoading(false);
    }
  };

  const loadUser = async () => {
    try {
      const activeUser = await getActiveSession();
      if (activeUser) {
        setUser(activeUser);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      if (!dbInitialized) {
        throw new Error('Database not initialized');
      }

      await dbCreateUser(userData.name, userData.email, userData.password);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      if (!dbInitialized) {
        throw new Error('Database not initialized');
      }

      const foundUser = await getUserByEmailAndPassword(email, password);

      if (!foundUser) {
        throw new Error('Invalid credentials');
      }

      await createSession(foundUser.id);
      setUser(foundUser);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await clearSession();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      if (!dbInitialized || !user) {
        throw new Error('Database not initialized or user not logged in');
      }

      const updatedUser = await dbUpdateUserProfile(user.id, profileData);
      setUser(updatedUser);

      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const addBloodPressureReading = async (reading) => {
    try {
      if (!dbInitialized || !user) {
        throw new Error('Database not initialized or user not logged in');
      }

      await dbAddBloodPressureReading(
        user.id,
        reading.systolic,
        reading.diastolic,
        reading.heartRate
      );

      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const getBloodPressureReadings = async () => {
    try {
      if (!dbInitialized || !user) {
        return [];
      }

      return await dbGetBloodPressureReadings(user.id);
    } catch (error) {
      console.error('Error loading readings:', error);
      return [];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        dbInitialized,
        register,
        login,
        logout,
        updateProfile,
        addBloodPressureReading,
        getBloodPressureReadings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
