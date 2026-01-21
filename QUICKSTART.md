# HealthGram - Quick Start Guide

## 🎉 Application Successfully Created!

Your health tracking application is ready and running!

## 📱 What's Been Built

### **Complete Features:**

1. **User Registration** ✅
   - Full name, email, password with validation
   - Password confirmation
   - Duplicate user prevention

2. **User Login** ✅
   - Secure authentication
   - Persistent sessions
   - Form validation

3. **User Profile** ✅
   - Personal info display
   - Health vitals (Height, Weight, Age, Blood Group, Allergies)
   - **Automatic BMI Calculator** with color-coded categories:
     - Underweight: < 18.5 (Orange)
     - Normal: 18.5 - 24.9 (Green)
     - Overweight: 25 - 29.9 (Orange)
     - Obese: ≥ 30 (Red)

4. **Blood Pressure Tracker** ✅
   - Add readings (Systolic, Diastolic, Heart Rate)
   - View history with timestamps
   - **Automatic categorization:**
     - Normal: < 120/80 (Green)
     - Elevated: 120-129/<80 (Yellow)
     - High BP Stage 1: 130-139/80-89 (Orange)
     - High BP Stage 2: 140-179/90-119 (Red)
     - Hypertensive Crisis: ≥180/≥120 (Dark Red)

## 🚀 How to Access

### **Currently Running:**
- **Web:** http://localhost:8081
- **QR Code:** Scan with Expo Go app on your phone

### **Available Commands:**

In the terminal, press:
- `w` - Open in web browser
- `i` - Open iOS simulator (macOS only)
- `a` - Open Android emulator
- `r` - Reload the app
- `Ctrl+C` - Stop the server

## 📂 Project Structure

```
HealthGram/
├── app/                      # Screens (Expo Router)
│   ├── _layout.js           # Root layout with auth
│   ├── index.js             # Loading/redirect screen
│   ├── login.js             # Login page
│   ├── register.js          # Registration page
│   ├── home.js              # Dashboard
│   ├── profile.js           # Profile management
│   └── blood-pressure.js    # BP tracking
├── components/              # UI Components
├── context/                 # State management
│   └── AuthContext.js       # Auth & data logic
└── assets/                  # Images & icons
```

## 💾 Data Storage

All data is stored locally on the device using AsyncStorage:
- User accounts and credentials
- Profile information
- Blood pressure readings
- Session data

## 🎨 User Flow

1. **First Time:**
   - Register → Fill profile info → Start tracking

2. **Returning User:**
   - Auto-login → View dashboard → Track readings

3. **Navigation:**
   - Home → Profile or Blood Pressure
   - Easy logout from profile

## 🔧 Development Commands

```bash
# Start development server
npm start

# Start in offline mode (if network issues)
npx expo start --offline

# Run on specific platform
npm run web
npm run ios
npm run android

# Install dependencies
npm install
```

## 📱 Testing the App

### **Web (Recommended for quick testing):**
1. Server is already running at http://localhost:8081
2. Click to open in browser
3. Test all features in browser

### **Mobile Device:**
1. Install "Expo Go" from App Store/Play Store
2. Scan the QR code in terminal
3. App loads on your phone

### **Simulator:**
1. Press `i` for iOS simulator (Mac only)
2. Press `a` for Android emulator

## ✨ Test Scenario

Try this flow to test all features:

1. **Register:** Create account with your details
2. **Login:** Sign in with your credentials
3. **Profile:** 
   - Add height (e.g., 175 cm)
   - Add weight (e.g., 70 kg)
   - Add age, blood group, allergies
   - See BMI calculated automatically
4. **Blood Pressure:**
   - Add reading (e.g., 120/80, HR: 72)
   - View in history with category
   - Add more readings to see history
5. **Logout:** Test logout and login again

## 🛠️ Technology Stack

- **Framework:** React Native 0.76.5
- **Platform:** Expo 52.0
- **Navigation:** Expo Router 4.0
- **Storage:** AsyncStorage
- **State:** Context API
- **UI:** React Native core components

## 📊 Features Highlights

### **Smart Health Tracking:**
- BMI auto-calculation on profile update
- BP readings categorized automatically
- Color-coded health indicators
- Timestamp all readings

### **User Experience:**
- Clean, modern UI
- Responsive design
- Form validation
- Loading states
- Error handling

### **Data Management:**
- Local data persistence
- Secure storage
- Fast access
- No internet required

## 🎯 Next Steps

### **Optional Enhancements:**
- Add graphs/charts for trends
- Export data to CSV/PDF
- Medication reminders
- Weight tracking over time
- Water intake tracker
- Sleep tracker
- Exercise log
- Cloud sync

## 🐛 Troubleshooting

**Server won't start:**
```bash
npx expo start --offline
```

**Web not loading:**
- Make sure port 8081 is free
- Check http://localhost:8081 directly

**Mobile not connecting:**
- Ensure phone and computer on same WiFi
- Try scanning QR code again

**Dependencies issue:**
```bash
rm -rf node_modules
npm install
```

## 📖 Documentation

- Full README: See README.md
- Expo Docs: https://docs.expo.dev
- React Native Docs: https://reactnative.dev

---

**🎊 Congratulations!** Your HealthGram application is fully functional and ready for use!

**Current Status:** ✅ Server Running | ✅ Web Accessible | ✅ Ready for Testing
