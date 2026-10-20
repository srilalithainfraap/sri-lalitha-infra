# Sri Lalitha Infra

Premium plotted-development portal — React + Vite frontend, Node.js + Express + MongoDB backend.

---

## Project structure

```
srilalithainfra/
├── frontend/          # React 19 + Vite 8 + Tailwind CSS v4
│   ├── public/
│   │   └── lalithainfrapics/   # 300 cinematic hero frames (do not modify)
│   ├── src/
│   │   ├── api/               # fetch wrappers (client, auth, plots, …)
│   │   ├── components/        # Badge, Button, Input, Modal, …
│   │   ├── data/              # static plot data, config, demo users
│   │   ├── features/auth/     # AuthContext, RequireAuth
│   │   ├── hooks/             # useAnalytics, useGallery, useLocalStorage
│   │   ├── layouts/           # MainLayout, Navbar, Footer
│   │   ├── pages/             # 13 page components
│   │   └── utils/             # formatters, storage, validation
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/           # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/            # db.js, cloudinary.js
│   │   ├── controllers/       # auth, plot, enquiry, visit, gallery, dashboard
│   │   ├── middleware/        # auth, admin, optionalAuth, errorHandler
│   │   ├── models/            # User, Plot, Enquiry, Visit, GalleryItem
│   │   ├── routes/            # auth, plots, enquiries, visits, gallery, dashboard
│   │   └── utils/seed.js
│   ├── tests/                 # 49 integration tests (Jest + Supertest)
│   ├── docs/                  # audit reports
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Prerequisites

- Node.js 18+
- A running MongoDB instance (Atlas cluster or local) — set `MONGODB_URI`
- A Cloudinary account (for gallery image uploads) — set the three credentials

---

## Backend setup

```bash
cd backend
cp .env.example .env          # fill in all values (see comments in the file)
npm install
npm run seed                  # create admin user + 60 seed plots (first time only)
npm run dev                   # development server with hot-reload (port 5000)
npm start                     # production
npm test                      # run 49 integration tests (in-memory DB — no live MongoDB needed)
```

### Required `backend/.env` values

| Variable | Description |
|---|---|
| `MONGODB_URI` | `mongodb+srv://…` (Atlas) or `mongodb://127.0.0.1:27017/srilalithainfra` |
| `JWT_SECRET` | 64-byte random hex — `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `ADMIN_EMAIL` | Admin account email (used by seed script) |
| `ADMIN_PASSWORD` | Admin account password — minimum 8 chars, 1 uppercase, 1 digit |
| `ADMIN_NAME` | Admin display name |
| `ADMIN_MOBILE` | 10-digit Indian mobile number |
| `CLOUDINARY_CLOUD_NAME` | From your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard |
| `FRONTEND_ORIGINS` | Comma-separated allowed origins, e.g. `http://localhost:5173,https://yourdomain.com` |
| `PORT` | Optional — defaults to `5000` |
| `NODE_ENV` | `development` or `production` |

---

## Frontend setup

```bash
cd frontend
cp .env.example .env.local    # set VITE_API_URL to your backend URL
npm install
npm run dev                   # development server (http://localhost:5173)
npm run build                 # production bundle → frontend/dist/
npm run preview               # preview the production build locally
```

### Required `frontend/.env.local` values

| Variable | Description |
|---|---|
| `VITE_API_URL` | Full URL of the running backend API, e.g. `http://localhost:5000/api` |

> **Important:** always set `VITE_API_URL` before a production build. The frontend will fall back to `http://localhost:5000/api` if the variable is absent, which is incorrect in production.

---

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | User | Current user + savedPlots |
| POST | `/api/auth/logout` | User | Discard token |
| PATCH | `/api/auth/saved-plots` | User | Toggle saved plot by plotId |
| GET | `/api/plots` | — | List / filter plots |
| GET | `/api/plots/:plotId` | — | Single plot by plotId string |
| POST | `/api/plots` | Admin | Create plot |
| PATCH | `/api/plots/:id/status` | Admin | Update plot status |
| DELETE | `/api/plots/:id` | Admin | Delete plot |
| POST | `/api/enquiries` | Optional | Submit enquiry |
| GET | `/api/enquiries` | Admin | List all enquiries |
| GET | `/api/enquiries/mine` | User | Own enquiries |
| PATCH | `/api/enquiries/:id/status` | Admin | Update status |
| DELETE | `/api/enquiries/:id` | Admin | Delete enquiry |
| POST | `/api/visits` | Optional | Book site visit |
| GET | `/api/visits` | Admin | List all visits |
| GET | `/api/visits/mine` | User | Own visits |
| PATCH | `/api/visits/:id/status` | Admin | Update status |
| GET | `/api/gallery` | — | List gallery items |
| POST | `/api/gallery` | Admin | Upload image to Cloudinary |
| DELETE | `/api/gallery/:id` | Admin | Delete image |
| GET | `/api/dashboard/admin` | Admin | Admin stats |
| GET | `/api/dashboard/user` | User | User stats + saved plots |
| GET | `/health` | — | Health check |

---

## Security notes

- Passwords hashed with bcrypt (12 rounds); `passwordHash` never returned by any API
- JWT verified server-side on every protected request; role checked from DB, never trusted from request body
- Rate limiting: 200 req/15 min globally, 20 req/15 min on auth endpoints
- CORS restricted to `FRONTEND_ORIGINS` environment variable
- Helmet security headers applied globally
- Production 500 errors suppress internal messages and stack traces
- All secret files (`backend/.env`, `frontend/.env.local`) are gitignored

---

## Running tests

```bash
cd backend
npm test          # 49 tests, 6 suites — uses mongodb-memory-server (no live DB needed)
```

Test coverage includes: registration, login, JWT security, privilege escalation prevention, user data isolation, plot CRUD, enquiry/visit workflows, saved-plot toggle, and gallery authorization.
