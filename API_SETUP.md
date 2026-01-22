# HealthBuddy - MongoDB API Backend Setup

## Architecture

The application now uses a **Backend API Architecture**:

```
React Native App → Express API Server → MongoDB Atlas
```

This approach works with Expo because:
- ✅ React Native/Expo apps call HTTP APIs
- ✅ Backend Node.js server handles MongoDB directly
- ✅ Works on Web, iOS, and Android
- ✅ Scalable and maintainable

## Getting Started

### 1. Install All Dependencies

```bash
npm install --legacy-peer-deps
```

This installs:
- Frontend dependencies (React Native, Expo)
- Backend dependencies (Express, MongoDB driver)

### 2. Create Environment Files

**`.env` (Backend API)**
```
MONGODB_URI=mongodb+srv://healthbuddy:Health_1@healthbuddy.qtivokh.mongodb.net/?appName=healthBuddy
PORT=5000
```

**`.env.local` (Frontend App)**
```
EXPO_PUBLIC_API_URL=http://localhost:5000
```

### 3. Start Backend API (Terminal 1)

```bash
node api/server.js
```

You should see:
```
✓ MongoDB connected
✓ HealthBuddy API running on http://localhost:5000
```

### 4. Start Frontend App (Terminal 2)

```bash
npm run web
```

The app will open at `http://localhost:19006`

### 5. Test the App

1. **Register**: Create a new account
2. **Login**: Login with credentials
3. **Profile**: Update health information
4. **Blood Pressure**: Add readings
5. **Verify**: Check data in MongoDB Atlas

## Backend API Endpoints

### Users
- `POST /api/users/register` - Create account
- `POST /api/users/login` - Login
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId/profile` - Update profile

### Sessions
- `POST /api/sessions` - Create session
- `GET /api/sessions/active` - Get active session
- `POST /api/sessions/clear` - Logout

### Blood Pressure
- `POST /api/blood-pressure` - Add reading
- `GET /api/blood-pressure/:userId` - Get readings
- `DELETE /api/blood-pressure/:readingId` - Delete reading

## Project Structure

```
HealthBuddy/
├── app/                    # React Native screens
├── components/             # React components
├── context/                # Auth context
├── database/               # Database API layer (db.js)
├── api/                    # Backend server
│   └── server.js          # Express API (NEW)
├── package.json            # Dependencies
├── .env                    # Backend env vars (create this)
├── .env.local             # Frontend env vars (create this)
└── .env.example           # Template
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=your_connection_string
PORT=5000
```

### Frontend (.env.local)
```
EXPO_PUBLIC_API_URL=http://localhost:5000
```

For deployment:
- **Netlify**: Set in Build & deploy → Environment
- **AWS EC2**: Set in GitHub Actions secrets
- **Vercel**: Set in Project settings

## Running in Production

### AWS EC2

```bash
# Install Node.js and dependencies
sudo apt-get update
sudo apt-get install -y nodejs npm
cd /opt/healthgram
npm install --legacy-peer-deps

# Run API server with PM2
npm install -g pm2
pm2 start api/server.js --name healthbuddy-api
pm2 start "serve -s dist" --name healthbuddy-web

# For web serving, build the app first
npm run web -- --build-path dist
```

### Netlify

Netlify can't run Node.js servers, so:
1. Deploy API to Heroku, Render, or AWS Lambda
2. Set `EXPO_PUBLIC_API_URL` to your API server URL
3. Deploy frontend to Netlify

### Docker (Optional)

```dockerfile
FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps

EXPOSE 5000
CMD ["node", "api/server.js"]
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot connect to API" | Ensure `node api/server.js` is running on port 5000 |
| "MongoDB connection failed" | Check connection string in `.env` |
| "App won't load" | Check `.env.local` has `EXPO_PUBLIC_API_URL` |
| "CORS error" | API is running but frontend can't reach it |

### Test Connection

```bash
# Test API health
curl http://localhost:5000/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

## Database

MongoDB Atlas is hosting the database. No local database needed.

**Cluster Details:**
- Database: `healthbuddy`
- Collections: `users`, `blood_pressure`, `sessions`

## Security Notes

⚠️ **For Development Only:**
- Passwords stored as plain text
- CORS allows all origins
- No authentication tokens

🔒 **For Production:**
- Hash passwords with bcrypt
- Use JWT tokens for authentication
- Enable MongoDB IP whitelist
- Use HTTPS
- Validate all inputs
- Rate limiting

## Next Steps

1. ✅ Run backend: `node api/server.js`
2. ✅ Run frontend: `npm run web`
3. ✅ Test functionality
4. ✅ Deploy to production

---

**Updated:** January 22, 2026  
**Status:** Ready to run
