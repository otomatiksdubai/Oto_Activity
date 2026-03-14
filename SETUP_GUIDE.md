# Quick Start Guide

## 1. Install Backend Dependencies
```bash
cd backend
npm install
```

## 2. Setup MongoDB
- Option A: Local MongoDB (ensure it's running on port 27017)
- Option B: MongoDB Atlas (update MONGODB_URI in .env)

## 3. Create .env file in backend/
Copy contents from .env.example and update values as needed:
```bash
cp .env.example .env
```

## 4. Start Backend Server
```bash
npm run dev
```
Server will run on http://localhost:5000

## 5. Install Frontend Dependencies (New Terminal)
```bash
cd frontend
npm install
```

## 6. Start Frontend Development Server
```bash
npm run dev
```
App will run on http://localhost:5173

## 7. Create Test User (Optional)
Use MongoDB client or create via `/api/auth/register` endpoint:
```bash
POST /api/auth/register
{
  "username": "teststaff",
  "password": "test123",
  "role": "staff"
}
```

## 8. Login
Use credentials from previous step in the login form.

## Troubleshooting

**Port already in use:**
- Change PORT in backend/.env
- Change port in frontend/vite.config.js

**MongoDB connection error:**
- Ensure MongoDB is running
- Check MONGODB_URI in .env

**CORS error:**
- Ensure backend is running on correct port
- Frontend proxy configured in vite.config.js

## Build for Production

### Frontend
```bash
cd frontend
npm run build
```
Output in frontend/dist/

### Backend
No build needed for Express, just deploy with node_modules and .env

## File Organization

- **Backend Real-time Issues**: Check server.js console
- **Frontend Errors**: Check browser console (F12)
- **API Issues**: Check backend routes and controllers
- **Database Issues**: Check MongoDB compass or terminal
