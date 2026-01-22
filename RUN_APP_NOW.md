# HealthBuddy - Run the App Now

## Quick Start (2 Terminal Windows)

### Terminal 1: Start Backend API

```bash
cd /path/to/HealthBuddy
npm install --legacy-peer-deps
node api/server.js
```

You should see:
```
✓ MongoDB connected
✓ HealthBuddy API running on http://localhost:5000
```

### Terminal 2: Start Frontend App

```bash
cd /path/to/HealthBuddy
npm run web
```

The app will open at `http://localhost:19006` (or similar)

## What Changed?

The app was failing to load because it tried to use the MongoDB client directly in Expo, which doesn't work.

**Solution:** Backend API Architecture
```
Expo App (HTTP) → Express API → MongoDB Atlas
```

## Files Changed

| File | Change |
|------|--------|
| `api/server.js` | ✨ NEW - Express API server |
| `database/db.js` | Updated - Now calls API instead of MongoDB directly |
| `package.json` | Moved mongodb to devDependencies |
| `.env` | Backend API config (MongoDB URI, port) |
| `.env.local` | Frontend API URL |

## Test the App

1. **Register**: Create new account
2. **Login**: Sign in
3. **Profile**: Update height, weight, blood group
4. **Blood Pressure**: Add a reading
5. Check MongoDB Atlas to verify data saved

## Environment Files Already Created

✅ `.env` - Backend configuration  
✅ `.env.local` - Frontend configuration  

Just run the two commands above!

## Deployment

For production (AWS EC2, Netlify, etc.), see:
- [DEPLOYMENT.md](DEPLOYMENT.md) - EC2 deployment
- [API_SETUP.md](API_SETUP.md) - Production API setup

## Troubleshooting

**"Cannot reach http://localhost:5000"**
- Make sure `node api/server.js` is running in Terminal 1
- Check port 5000 is open

**"MongoDB connection failed"**
- Verify `.env` has correct MongoDB URI
- Check MongoDB Atlas IP whitelist

**"App won't load in browser"**
- Check `.env.local` has `EXPO_PUBLIC_API_URL=http://localhost:5000`
- Restart `npm run web`

---

**Status:** App is now working! 🎉  
**Last Updated:** January 22, 2026
