# MongoDB Setup - Quick Start

## 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

## 2. Create .env.local

```bash
cp .env.example .env.local
```

File content (already set):
```
EXPO_PUBLIC_MONGODB_URI=mongodb+srv://healthbuddy:Health_1@healthbuddy.qtivokh.mongodb.net/?appName=healthBuddy
```

## 3. Test Connection

```bash
npm run web
```

Then:
1. Navigate to the app
2. Try to register a new user
3. Try to login
4. Try to add blood pressure reading

## 4. Verify in MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Login with credentials provided
3. Navigate to Cluster → healthbuddy
4. Collections tab should show:
   - `users`
   - `blood_pressure`
   - `sessions`

## 5. Deploy

```bash
git push origin main
```

GitHub Actions workflow will:
- Install dependencies with `--legacy-peer-deps`
- Build web app
- Deploy to EC2
- Use MongoDB for data storage

## Environment Variables by Platform

### Local Development
- Create `.env.local` file
- Automatically loaded by Expo

### Netlify
- Site settings → Build & deploy → Environment
- Add variable: `EXPO_PUBLIC_MONGODB_URI`

### GitHub Actions
- Repository Secrets
- `EXPO_PUBLIC_MONGODB_URI` (optional, uses default if not set)

### AWS EC2
- Set during GitHub Actions deployment
- Or configure in `.env.production`

## MongoDB Atlas Configuration

### Current Setup
- Database: `healthbuddy`
- Cluster: `healthbuddy.qtivokh.mongodb.net`
- Collections: `users`, `blood_pressure`, `sessions`

### IP Whitelist
1. Go to MongoDB Atlas Dashboard
2. Network Access → Add IP Address
3. Add your server IP or use `0.0.0.0/0` (development only)

## Troubleshooting Commands

### Check MongoDB Connection
```bash
# In browser console after loading app
const db = getMongoDb ? require('./database/db').getMongoDb() : null;
console.log(db ? 'Connected!' : 'Not connected');
```

### View Logs
```bash
# Local development
npm run web # Check terminal output

# EC2
ssh -i ec2-deploy-key ubuntu@YOUR_EC2_IP
pm2 logs healthgram
```

### Test Database
```bash
# Register new user
# Open MongoDB Atlas and check 'users' collection
```

## Common Issues

| Issue | Solution |
|-------|----------|
| `Cannot find module 'mongodb'` | Run `npm install --legacy-peer-deps` |
| Connection timeout | Check MongoDB Atlas IP whitelist |
| "User already exists" | Use different email for registration |
| No data appearing | Verify `.env.local` has correct URI |

## Database Collections

### users
- Stores: name, email, password, height, weight, age, blood group, allergies
- Access: `createUser()`, `getUserById()`, `updateUserProfile()`

### blood_pressure
- Stores: userId, systolic, diastolic, heart rate, timestamp
- Access: `addBloodPressureReading()`, `getBloodPressureReadings()`

### sessions
- Stores: userId, isActive flag, timestamp
- Access: `createSession()`, `getActiveSession()`, `clearSession()`

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure `.env.local`
3. ✅ Test locally with `npm run web`
4. ✅ Deploy with `git push origin main`
5. ✅ Monitor MongoDB Atlas
6. ✅ Check GitHub Actions logs

See [MONGODB_MIGRATION.md](MONGODB_MIGRATION.md) for complete migration details.
See [database/README_MONGODB.md](database/README_MONGODB.md) for API documentation.

---

**Quick Links:**
- [MongoDB Atlas](https://cloud.mongodb.com)
- [MongoDB Connection String Guide](https://www.mongodb.com/docs/manual/reference/connection-string/)
- [GitHub Actions Logs](../../actions)
