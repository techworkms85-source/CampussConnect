# Campus Portal — Bennett University

A full-stack campus management portal with JWT auth, role-based access, and 7 feature modules.

## Tech Stack

- Frontend: React 18, Tailwind CSS, React Router v6, Axios
- Backend: Node.js, Express.js, Mongoose
- Database: MongoDB Atlas
- Auth: JWT + bcrypt

## Project Structure

```
campus-portal/
├── backend/
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── uploads/         # File uploads (gitignored)
│   └── server.js
└── frontend/
    └── src/
        ├── components/  # Reusable UI
        ├── context/     # Auth + Theme context
        ├── pages/       # Route pages
        └── utils/       # Axios instance
```

## Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your values
mkdir uploads
npm run dev            # runs on :5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set REACT_APP_API_URL
npm start              # runs on :3000
```

## Environment Variables

### Backend `.env`
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:5000/api
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | User | Get profile |
| PUT | /api/auth/profile | User | Update profile |
| GET | /api/cgpa | User | Get CGPA record |
| POST | /api/cgpa/semester | User | Add/update semester |
| DELETE | /api/cgpa/semester/:sem | User | Delete semester |
| GET | /api/food | — | List outlets |
| POST | /api/food | Admin | Create outlet |
| PUT | /api/food/:id | Admin | Update outlet |
| DELETE | /api/food/:id | Admin | Delete outlet |
| POST | /api/food/:id/rate | User | Rate outlet |
| GET | /api/resources | — | List resources |
| POST | /api/resources | User | Upload resource |
| DELETE | /api/resources/:id | User/Admin | Delete resource |
| GET | /api/lostandfound | — | List items |
| POST | /api/lostandfound | User | Post item |
| PUT | /api/lostandfound/:id | Owner/Admin | Update item |
| DELETE | /api/lostandfound/:id | Owner/Admin | Delete item |
| GET | /api/clubs | — | List clubs |
| POST | /api/clubs | Admin | Create club |
| POST | /api/clubs/:id/join | User | Request to join |
| POST | /api/clubs/:id/approve/:userId | Admin | Approve member |
| GET | /api/feedback/mine | User | My feedbacks |
| POST | /api/feedback | User | Submit feedback |
| GET | /api/feedback | Admin | All feedbacks |
| PUT | /api/feedback/:id | Admin | Respond to feedback |
| GET | /api/events | — | List events |
| POST | /api/events | Admin | Create event |
| POST | /api/events/:id/register | User | Register for event |
| GET | /api/admin/stats | Admin | Dashboard stats |
| GET | /api/admin/users | Admin | All users |
| PUT | /api/admin/users/:id/role | Admin | Change user role |

## Deployment

### Backend → Render
1. Push to GitHub
2. Create Web Service on Render, connect repo, set root to `backend/`
3. Build: `npm install`, Start: `node server.js`
4. Add environment variables in Render dashboard

### Frontend → Vercel
1. Import repo on Vercel, set root to `frontend/`
2. Add `REACT_APP_API_URL=https://your-render-url.onrender.com/api`
3. Deploy

### Database → MongoDB Atlas
1. Create free cluster at mongodb.com/atlas
2. Add IP `0.0.0.0/0` to network access
3. Copy connection string to `MONGO_URI`

## Features

- JWT authentication with protected routes
- Role-based access (User / Admin)
- Dark mode toggle
- CGPA/SGPA calculator with semester management
- Food outlets with menu, ratings, open/closed status
- File upload for study resources (PDF, DOC, PPT, ZIP)
- Lost & Found board with status tracking
- Club directory with join request flow
- Feedback system with admin responses
- Events portal with registration
- Admin dashboard with user management
- Responsive design (mobile + desktop)
- Toast notifications throughout
- Search & filter on all modules
# CampussConnect
