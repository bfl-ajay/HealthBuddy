# HealthGram - Health Tracking Application

A comprehensive health tracking application built with React Native and Expo, supporting web, iOS, and Android platforms.

## Features

✅ **User Authentication**
- User Registration with validation
- Secure Login system
- Persistent authentication

✅ **User Profile Management**
- Height, Weight, Age tracking
- Blood Group information
- Allergy management
- Automatic BMI calculation with health categories

✅ **Blood Pressure Tracking**
- Record Systolic (SYS) pressure
- Record Diastolic (DIA) pressure
- Heart Rate monitoring
- Historical readings with timestamps
- Blood pressure category indicators (Normal, Elevated, High BP Stage 1 & 2, Hypertensive Crisis)

✅ **Cross-Platform Support**
- Web application
- iOS mobile app
- Android mobile app
- Responsive design for all screen sizes

## Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Context API
- **Database**: SQLite (expo-sqlite) with structured tables
- **UI**: Custom styled components with React Native

## Installation

1. **Clone the repository**
   ```bash
   cd HealthGram
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## Running the Application

### Web
```bash
npm run web
```
Or press `w` in the terminal after running `npm start`

### iOS
```bash
npm run ios
```
Or press `i` in the terminal after running `npm start`
*Requires macOS and Xcode*

### Android
```bash
npm run android
```
Or press `a` in the terminal after running `npm start`
*Requires Android Studio and Android SDK*

## Project Structure

```
HealthGram/
├── app/                    # Expo Router pages
│   ├── _layout.js         # Root layout with AuthProvider
│   ├── index.js           # Initial loading screen
│   ├── login.js           # Login page
│   ├── register.js        # Registration page
│   ├── home.js            # Home dashboard
│   ├── profile.js         # User profile page
│   └── blood-pressure.js  # Blood pressure tracking page
├── components/            # Reusable components
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── HomeScreen.js
│   ├── ProfileScreen.js
│   └── BloodPressureScreen.js
├── context/              # Context providers
│   └── AuthContext.js    # Authentication & data management
├── database/            # SQLite database
│   ├── db.js            # Database operations & queries
│   └── README.md        # Database schema documentation
├── assets/               # Images and icons
├── app.json             # Expo configuration
├── package.json         # Dependencies
└── babel.config.js      # Babel configuration
```

## Features Breakdown

### 1. User Registration
- Name, Email, and Password fields
- Email validation
- Password strength checking (minimum 6 characters)
- Password confirmation
- Duplicate user prevention

### 2. User Login
- Email and password authentication
- Form validation
- Persistent login sessions
- Secure credential storage

### 3. User Profile View
- **Personal Information**: Name and Email display
- **Health Vitals**:
  - Height (in cm)
  - Weight (in kg)
  - Age
  - Blood Group (A+, A-, B+, B-, O+, O-, AB+, AB-)
  - Allergies (comma-separated list)
- **BMI Calculator**: 
  - Automatic calculation based on height and weight
  - Color-coded BMI categories:
    - Underweight (< 18.5) - Orange
    - Normal (18.5 - 24.9) - Green
    - Overweight (25 - 29.9) - Orange
    - Obese (≥ 30) - Red

### 4. Blood Pressure Tracking
- **Add New Readings**:
  - Systolic pressure (40-250 mmHg)
  - Diastolic pressure (30-150 mmHg)
  - Heart Rate (30-200 BPM)
  - Input validation
- **Reading History**:
  - Chronological list of all readings
  - Timestamps for each entry
  - Color-coded categories:
    - Normal (< 120/80) - Green
    - Elevated (120-129/<80) - Yellow
    - High BP Stage 1 (130-139/80-89) - Orange
    - High BP Stage 2 (140-179/90-119) - Red
    - Hypertensive Crisis (≥180/≥120) - Dark Red
The application uses **SQLite database** for structured local storage:

The application uses **platform-aware storage** for optimal performance:

### Storage Strategy:
- **Web**: AsyncStorage (browser localStorage)
- **iOS/Android**: SQLite database

### Database Tables (Mobile):
1. **users** - User accounts and health profiles
2. **blood_pressure** - BP readings with timestamps
3. **sessions** - Active login sessions

### Features:
- Platform detection (automatic)
- SQLite for mobile (relational database)
- AsyncStorage for web (JSON-based)
- Same API for both platforms
- Automatic session management

See [database/README.md](database/README.md) for complete schema documentation.d profiles
- Blood pressure readings
- Authentication tokens
- User preferences

## UI/UX Features

- Clean, modern interface
- Intuitive navigation
- Color-coded health indicators
- Responsive layouts for all screen sizes
- Form validation with error messages
- Success/error alerts for user actions
- Loading states
- Empty states for new users

## Security Features

- Password-protected accounts
- Secure local storage
- Session management
- Logout functionality

## Future Enhancements

Potential features for future versions:
- Data export (CSV, PDF)
- Graphs and charts for trend analysis
- Medication reminders
- Doctor appointment scheduling
- Cloud sync across devices
- Touch ID / Face ID authentication
- Multiple user profiles
- Health tips and recommendations
- Integration with health devices
- Multi-language support

## Support

For issues or questions, please create an issue in the repository.

## License

This project is created for educational and personal use.

---

**Developed with ❤️ using React Native and Expo**
