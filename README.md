# School Club Management Portal (MERN Stack)

A production-ready, full-stack School Club Management Portal built using MongoDB, Express.js, React.js (Vite), and Node.js. It features role-based access control (Super Admin/Principal, Teacher, Club Admin, Student), Cloudinary media hosting, rate limiting, and standard responsive Tailwind CSS dashboards with dark/light themes.

---

## Folder Structure

```text
school-club-portal/
├── backend/             # Node/Express API Server
│   ├── config/          # DB & Cloudinary configs
│   ├── controllers/     # Controller logics
│   ├── middleware/      # Auth, uploads, errors
│   ├── models/          # Mongoose collections
│   ├── routes/          # Express routing endpoints
│   ├── services/        # Cloudinary buffer upload services
│   ├── utils/           # Seed, token generation, loggers
│   └── validations/     # Joi validation rules
└── frontend/            # React Client SPA (Vite)
    ├── src/
    │   ├── components/  # Shared layouts, cards, modals
    │   ├── context/     # Auth, Toast, and Theme context states
    │   ├── hooks/       # Custom hooks (e.g. useToast)
    │   ├── layouts/     # Auth / Dashboard layouts
    │   ├── pages/       # Login, dashboard view, clubs profile
    │   ├── services/    # Central Axios API endpoints mapping
    │   └── utils/       # Date/size helpers
    └── vercel.json      # Vercel deployment rewrites
```

---

## Environment Variables Configuration

Create a `.env` file inside the `backend/` directory based on the following template (reference [backend/.env.example](file:///C:/Users/akash/.gemini/antigravity/scratch/school-club-portal/backend/.env.example)):

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_secure_jwt_secret_key
JWT_EXPIRES_IN=7d

# Cloudinary Integration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Default Principal Account Configuration (Seeded automatically)
SUPER_ADMIN_EMAIL=admin@school.edu
SUPER_ADMIN_PASSWORD=AdminSecurePass123!

# Frontend CORS
FRONTEND_URL=http://localhost:5173
```

Inside the `frontend/` directory, create a `.env` (or let Vite fall back to `http://localhost:5000/api`):

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Setup & Installations

### Prerequisites
* Node.js (v18 or newer recommended)
* MongoDB (Local instance or MongoDB Atlas cluster)
* Cloudinary Account (Free tier is sufficient)

### 1. Database Setup (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. Create a new shared cluster (free tier).
3. Under **Database Access**, create a user with read/write privileges.
4. Under **Network Access**, whitelist `0.0.0.0/30` or your deployment IP ranges.
5. Retrieve your cluster connection URI and replace `<username>` and `<password>` with your database user credentials. Paste it as `MONGODB_URI` in `backend/.env`.

### 2. Cloudinary Setup
1. Go to [Cloudinary](https://cloudinary.com/) and register.
2. In the dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**.
3. Paste these values into the Cloudinary variables inside `backend/.env`.

### 3. Local Installation & Development

```bash
# Clone the repository and navigate inside the folder
cd school-club-portal

# Install backend dependencies
cd backend
npm install

# Run backend verification test script
node verify_api.js

# Start backend dev server (runs on http://localhost:5000)
npm run dev

# (Open new terminal) Install frontend dependencies
cd ../frontend
npm install --legacy-peer-deps

# Start frontend dev server (runs on http://localhost:5173)
npm run dev
```

On server startup, the backend automatically seeds the default Super Admin/Principal account if none exists, using your configured `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` (defaults to `admin@school.edu` / `AdminPass123!`).

---

## Deployment Instructions

### Frontend → Vercel
1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` inside `frontend/` directory.
3. Configure the environment variable: `VITE_API_URL` pointing to your deployed backend API URL (e.g. `https://school-club-portal-api.onrender.com/api`).
4. The custom `vercel.json` ensures frontend client-side routing works without 404 errors.

### Backend → Render
1. Connect your Github Repository to [Render](https://render.com/).
2. Create a new **Web Service**.
3. Select **Node** environment. Set **Root Directory** to `backend`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add the required Environment Variables in the **Environment** tab:
   * `MONGODB_URI`
   * `JWT_SECRET`
   * `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   * `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`
   * `FRONTEND_URL` (Set this to your deployed Vercel URL to enable CORS)

---

## Permissions Matrix

| Permission | Super Admin (Principal) | Teacher | Club Admin | Student |
| :--- | :---: | :---: | :---: | :---: |
| Login / Register | ✔ (Seeded) | ✔ (Pending Approval) | ✔ (Assigned) | ✔ (Instant Active) |
| Manage Clubs (CRUD) | ✔ | ✘ | ✘ | ✘ |
| Assign Club Teacher | ✔ | ✘ | ✘ | ✘ |
| Manage Club Members | ✔ | ✘ | ✔ | ✘ |
| Review Join Requests | ✔ | ✘ | ✔ | ✘ (Can apply) |
| Upload media (.jpg, .mp4, .pdf) | ✔ | ✘ | ✔ | ✔ (Members only) |
| Delete club posts | ✔ | ✘ | ✔ (Member posts) | ✔ (Own posts) |
| System logs (Audit trails) | ✔ | ✘ | ✘ | ✘ |
| Like Posts | ✘ | ✘ | ✘ | ✔ |
| Edit account profile | ✔ | ✔ | ✔ | ✔ |
| Notifications center | ✔ | ✔ | ✔ | ✔ |
