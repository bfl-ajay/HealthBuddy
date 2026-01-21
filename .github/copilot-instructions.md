# HealthGram - Health Tracking Application

## Project Overview
React Native Expo application for tracking daily health records with cross-platform support (Web, iOS, Android).

## Features Implemented
✅ User Registration with validation
✅ User Login with authentication  
✅ User Profile View (Height, Weight, Age, Blood Group, Allergies, BMI)
✅ Blood Pressure Tracking (Systolic, Diastolic, Heart Rate)
✅ **SQLite Database** with relational tables
✅ Cross-platform support (Web, iOS, Android)
✅ Structured data storage with proper schema
✅ BMI calculator with health categories
✅ Blood pressure history with timestamps
✅ Responsive design

## Technology Stack
- **Database**: SQLite (expo-sqlite) for structured local storage
- **Tables**: users, blood_pressure, sessions
- **Queries**: Parameterized queries with foreign keys
- **Context API**: For state management
- **Expo Router**: For navigation

## Development Setup Completed
✅ Project structure created
✅ All dependencies installed (including expo-sqlite)
✅ SQLite database integrated
✅ Database schema created (3 tables)
✅ Expo development server configured
✅ All screens and components implemented
✅ Context API updated for database operations
✅ Routing with Expo Router

## Database Schema
**users** - User accounts and profiles
**blood_pressure** - BP readings with timestamps  
**sessions** - Active login session tracking

See [database/README.md](database/README.md) for complete documentation.

## Running the Application
- Web: Press 'w' in terminal or run `npm run web`
- iOS: Press 'i' in terminal or run `npm run ios`
- Android: Press 'a' in terminal or run `npm run android`
- Offline Mode: `npx expo start --offline`

## Current Status
✅ Development server running at http://localhost:8081
✅ SQLite database fully integrated
✅ Ready for testing on web and mobile devices
