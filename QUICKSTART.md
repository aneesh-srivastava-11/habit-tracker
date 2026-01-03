# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. MongoDB Atlas Setup (2 minutes)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user (username + password)
4. Network Access → Add IP: `0.0.0.0/0` (allow all for development)
5. Connect → Drivers → Copy connection string

### 2. Backend Setup (1 minute)
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
MONGO_URI=your_connection_string_from_step_1
JWT_SECRET=run_command_below_to_generate
```

Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Start server:
```bash
npm run dev
```

### 3. Frontend Setup (1 minute)
```bash
cd frontend
npm install
npm run dev
```

### 4. Access Application
Open browser: `http://localhost:5173`

**Register** → Creates account + 12 default habits
**Start tracking!**

---

## 📁 Project Structure

```
tracker/
├── backend/          # Node.js + Express + MongoDB
│   ├── server.js
│   ├── models/      # User, Habit, HabitLog
│   ├── routes/      # auth, habits, tracking
│   ├── middleware/  # auth, rate limiting, validation
│   └── utils/       # streaks, badges
├── frontend/         # React + Vite + Tailwind
│   └── src/
│       ├── pages/   # Login, Register, Dashboard
│       ├── components/  # HabitCard, CheckboxGrid, etc.
│       ├── context/ # AuthContext
│       └── services/  # API calls
└── README.md
```

---

## 🔑 Key Features

✅ **Authentication**: JWT with httpOnly cookies
✅ **12 Default Habits**: Created on registration
✅ **Daily Tracking**: 7-day checkbox grid
✅ **Streak System**: Automatic calculation
✅ **8 Badge Milestones**: 3, 7, 14, 21, 30, 90, 180, 365 days
✅ **Security**: OWASP-compliant, rate limiting, validation
✅ **Grayscale UI**: Professional, minimal design

---

## 🎯 Usage

1. **Register** → Email + password (must have uppercase, lowercase, number)
2. **Dashboard** → See 12 default habits
3. **Track** → Click checkboxes to mark completion
4. **Streaks** → View current streak count
5. **Badges** → Earn at milestones
6. **Add Habit** → Custom name + emoji icon
7. **Delete Habit** → Remove with confirmation

---

## 🔒 Security

- Rate limiting (IP + user based)
- Input validation (express-validator)
- NoSQL injection prevention
- XSS protection (httpOnly cookies)
- Password hashing (bcrypt, 12 rounds)
- Security headers (helmet)

---

## 📚 Documentation

- [README.md](./README.md) - Full documentation
- [backend/README.md](./backend/README.md) - Backend details
- [walkthrough.md](./.gemini/antigravity/brain/.../walkthrough.md) - Complete walkthrough

---

## 🌐 Deployment

**Backend**: Railway, Render, Heroku
**Frontend**: Vercel, Netlify

See README.md for detailed deployment instructions.

---

## 💡 Tips

- Use strong JWT secret (64+ characters)
- Set `NODE_ENV=production` for deployment
- Configure MongoDB Atlas IP whitelist
- Update `CLIENT_URL` to production frontend URL
- Test with Thunder Client or Postman

---

Built with ❤️ as a production-ready SaaS MVP
