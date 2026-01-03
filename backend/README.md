# Habit Tracker Backend

Production-ready MERN backend with JWT authentication, MongoDB Atlas, and comprehensive security.

## Security Features (OWASP Compliant)

- ✅ **A1: Injection** - MongoDB sanitization, input validation
- ✅ **A2: Broken Authentication** - JWT with httpOnly cookies, bcrypt (12 rounds), rate limiting
- ✅ **A3: Sensitive Data Exposure** - Password hashing, secure cookie storage
- ✅ **A5: Broken Access Control** - User isolation, protected routes
- ✅ **A6: Security Misconfiguration** - Helmet security headers
- ✅ **A7: XSS** - Input sanitization, httpOnly cookies
- ✅ **A8: Insecure Deserialization** - JSON payload limits
- ✅ **A9: Known Vulnerabilities** - Updated dependencies

## Rate Limiting

- **Global**: 100 requests / 15 min (IP-based)
- **Auth endpoints**: 5 requests / 15 min (IP-based)
- **Authenticated routes**: 200 requests / 15 min (user-based)
- **Habit creation**: 20 habits / hour (user-based)

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGO_URI=your_mongodb_atlas_connection_string

# JWT Secret (generate with command below)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# JWT Expiration
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# Frontend URL
CLIENT_URL=http://localhost:5173
```

**Generate a secure JWT secret:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. MongoDB Atlas Setup

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create database user (Database Access)
4. Whitelist your IP (Network Access) or use `0.0.0.0/0` for development
5. Get connection string from "Connect" → "Connect your application"
6. Replace `<password>` and `<database>` in connection string

### 4. Run Server

Development mode (with nodemon):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Habits

- `GET /api/habits` - Get all habits (protected)
- `POST /api/habits` - Create habit (protected)
- `DELETE /api/habits/:id` - Delete habit (protected)

### Tracking

- `POST /api/tracking/log` - Toggle habit completion (protected)
- `GET /api/tracking/logs` - Get logs for date range (protected)
- `GET /api/tracking/streaks` - Get current streaks (protected)
- `GET /api/tracking/badges` - Get earned badges (protected)
- `GET /api/tracking/stats` - Get comprehensive stats (protected)

### Health Check

- `GET /api/health` - Server health check

## Default Habits

Created automatically on user registration:

- 🌅 Wake up early
- ⏰ No snoozing
- 💧 Drink water
- 💪 Gym
- 🧘 Stretching
- 📚 Reading
- 🧘‍♂️ Meditation
- 📖 Study
- ✨ Skincare
- 📱 Limit social media
- 🚫 No alcohol
- 💰 Track expenses

## Streak & Badge System

**Streak Calculation:**
- Counts consecutive days of completion from today backward
- Breaks on first missing day
- Timezone-safe (UTC dates)

**Badge Milestones:**
- 🔥 3 days - "3-Day Warrior"
- ⭐ 7 days - "Week Champion"
- 💎 14 days - "Two-Week Hero"
- 👑 21 days - "21-Day Master"
- 🏆 30 days - "Month Legend"
- 🎖️ 90 days - "Quarter King"
- 🌟 180 days - "Half-Year Titan"
- 👑 365 days - "Year Conqueror"

## Project Structure

```
backend/
├── server.js              # Express app entry point
├── config/
│   └── db.js             # MongoDB Atlas connection
├── models/
│   ├── User.js           # User schema (bcrypt hashing)
│   ├── Habit.js          # Habit schema
│   └── HabitLog.js       # Daily tracking logs
├── middleware/
│   ├── auth.js           # JWT authentication
│   ├── rateLimiter.js    # Rate limiting configs
│   └── validation.js     # Input validation schemas
├── routes/
│   ├── auth.js           # Auth endpoints
│   ├── habits.js         # Habit CRUD
│   └── tracking.js       # Tracking endpoints
├── utils/
│   ├── streaks.js        # Streak calculation
│   └── badges.js         # Badge calculation
├── package.json
├── .env.example
└── .env (create this)
```

## Deployment Notes

### Environment Variables

Ensure all environment variables are set in production:
- `NODE_ENV=production`
- `MONGO_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Strong random secret (64+ characters)
- `CLIENT_URL` - Production frontend URL

### Security Checklist

- ✅ Use HTTPS in production
- ✅ Set `NODE_ENV=production`
- ✅ Use strong JWT secret (64+ characters)
- ✅ Configure CORS with specific origin
- ✅ Enable MongoDB Atlas IP whitelist
- ✅ Use environment variables (never hardcode secrets)
- ✅ Keep dependencies updated
- ✅ Monitor rate limit violations
- ✅ Set up error logging (e.g., Sentry)

### Deployment Platforms

**Recommended platforms:**
- **Railway** - Easy deployment, MongoDB Atlas integration
- **Render** - Free tier, automatic deployments
- **Heroku** - Classic choice, easy setup
- **DigitalOcean App Platform** - Scalable, affordable
- **AWS Elastic Beanstalk** - Enterprise-grade

**Deployment steps (example for Railway):**

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Add environment variables in Railway dashboard
5. Deploy: `railway up`

## Testing

Test endpoints with:
- **Thunder Client** (VS Code extension)
- **Postman**
- **curl**

Example register request:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

## License

MIT
