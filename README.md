# Habit Tracker

Production-ready MERN stack Habit Tracker application with JWT authentication, MongoDB Atlas, and comprehensive security features.

## 🎯 Features

- **Authentication**: JWT with httpOnly cookies, bcrypt password hashing
- **Habit Management**: Create, delete, and track daily habits
- **Streak System**: Automatic streak calculation from completion logs
- **Badge System**: Earn badges at milestones (3, 7, 14, 21, 30, 90, 180, 365 days)
- **Dashboard**: Clean, minimal grayscale UI with completion tracking
- **Security**: OWASP-compliant with rate limiting, input validation, and sanitization

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB Atlas (Mongoose)
- JWT authentication
- bcrypt (12 salt rounds)
- helmet (security headers)
- express-rate-limit (IP + user based)
- express-validator (input validation)
- express-mongo-sanitize (NoSQL injection prevention)

### Frontend
- React 18 (Vite)
- React Router v6
- Tailwind CSS (grayscale theme)
- Axios (API calls with credentials)

## 📁 Project Structure

```
tracker/
├── backend/
│   ├── server.js
│   ├── config/db.js
│   ├── models/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 20+ and npm
- MongoDB Atlas account

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_64_character_secret
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
CLIENT_URL=http://localhost:5173
```

**Generate JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

4. Start backend server:
```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start frontend development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## 📖 Usage

1. **Register**: Create account at `/register`
   - 12 default habits created automatically
   - Password must contain uppercase, lowercase, and number

2. **Login**: Access dashboard at `/login`

3. **Dashboard**: 
   - View all habits with 7-day tracking grid
   - Click checkboxes to mark daily completion
   - View current streaks and earned badges
   - Add custom habits with name and emoji icon
   - Delete habits (removes all tracking data)

4. **Streaks**: Calculated from consecutive completed days
   - Breaks on first missing day
   - Updates in real-time

5. **Badges**: Automatically awarded at milestones
   - 🔥 3 days - "3-Day Warrior"
   - ⭐ 7 days - "Week Champion"
   - 💎 14 days - "Two-Week Hero"
   - 👑 21 days - "21-Day Master"
   - 🏆 30 days - "Month Legend"
   - 🎖️ 90 days - "Quarter King"
   - 🌟 180 days - "Half-Year Titan"
   - 👑 365 days - "Year Conqueror"

## 🔒 Security Features

- **OWASP A1 (Injection)**: MongoDB sanitization, input validation
- **OWASP A2 (Authentication)**: JWT, bcrypt, rate limiting
- **OWASP A3 (Data Exposure)**: httpOnly cookies, password hashing
- **OWASP A5 (Access Control)**: User isolation, protected routes
- **OWASP A6 (Configuration)**: Helmet security headers
- **OWASP A7 (XSS)**: Input sanitization, httpOnly cookies

### Rate Limiting
- Global: 100 req/15min (IP)
- Auth: 5 req/15min (IP)
- Authenticated: 200 req/15min (user)
- Habit creation: 20/hour (user)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Habits
- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create habit
- `DELETE /api/habits/:id` - Delete habit

### Tracking
- `POST /api/tracking/log` - Log completion
- `GET /api/tracking/logs` - Get logs
- `GET /api/tracking/streaks` - Get streaks
- `GET /api/tracking/badges` - Get badges
- `GET /api/tracking/stats` - Get stats

## 🌐 Deployment

### Backend (Railway/Render/Heroku)

1. Set environment variables in platform dashboard
2. Ensure `NODE_ENV=production`
3. Use strong JWT_SECRET (64+ characters)
4. Configure MongoDB Atlas IP whitelist
5. Set CLIENT_URL to production frontend URL

### Frontend (Vercel/Netlify)

1. Set `VITE_API_URL` to production backend URL
2. Build command: `npm run build`
3. Output directory: `dist`

## 📝 Code Documentation

All code includes comprehensive comments explaining:
- Security considerations
- OWASP best practices
- Function parameters and return values
- Algorithm explanations
- Error handling strategies

See individual files for detailed inline documentation.

## 🧪 Testing

Test with Thunder Client, Postman, or curl:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

## 📄 License

MIT

## 👤 Author

Built as a production-ready SaaS MVP with enterprise-grade security.
