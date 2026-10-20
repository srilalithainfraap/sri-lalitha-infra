# Sri Lalitha Infra — Backend Audit

**Date:** 2026-10-19  
**Auditor:** Lead Full-Stack Architect

---

## Current State

Pure React + Vite SPA. All persistence via `localStorage`. Passwords obfuscated with `btoa()` (not hashed). No API, no database, no server.

---

## Feature Inventory

### 1. Authentication & Users
| Aspect | Current | Required backend |
|---|---|---|
| Registration | localStorage array + btoa() | POST /api/auth/register → MongoDB, bcrypt hash |
| Login | btoa() comparison | POST /api/auth/login → bcrypt.compare, return JWT |
| Session | localStorage JSON | HttpOnly cookie or Authorization header with JWT |
| Current user | localStorage lookup | GET /api/auth/me (token-gated) |
| Logout | clear localStorage | POST /api/auth/logout (token revocation optional) |
| Role enforcement | `session.role` from localStorage — trivially forgeable | Server-side middleware checks `req.user.role` |
| Admin seed | Hardcoded demo user | Env-var seeded admin on first run |

**Security gap:** `btoa()` is base64 encoding, not hashing. Any role can be forged by editing localStorage.

---

### 2. Plots
| Aspect | Current | Required backend |
|---|---|---|
| Data source | `src/data/plots.js` static array | MongoDB Plot collection, seeded from static data |
| Read all | localStorage / static | GET /api/plots (public, paginated/filtered) |
| Read one | array.find() | GET /api/plots/:id (public) |
| Filtering | client-side | Server-side query params: status, facing, minArea, maxArea |
| Status update | setItem() | PATCH /api/plots/:id/status (admin-only) |
| Create/Delete | not implemented | POST/DELETE /api/plots (admin-only) |

---

### 3. Enquiries
| Aspect | Current | Required backend |
|---|---|---|
| Submit | push to localStorage array | POST /api/enquiries |
| List (admin) | localStorage array | GET /api/enquiries (admin-only, paginated) |
| Mark read | localStorage update | PATCH /api/enquiries/:id/status (admin) |
| Delete | localStorage filter | DELETE /api/enquiries/:id (admin) |
| User's own | not implemented | GET /api/enquiries/mine (authenticated user) |

---

### 4. Site Visits
| Aspect | Current | Required backend |
|---|---|---|
| Book | push to localStorage | POST /api/visits |
| List (admin) | localStorage | GET /api/visits (admin-only) |
| User's own | filtered from all | GET /api/visits/mine (authenticated) |
| Status update | localStorage update | PATCH /api/visits/:id/status (admin) |
| Conflict check | none | Server validates no duplicate userId+date |

---

### 5. Gallery
| Aspect | Current | Required backend |
|---|---|---|
| Upload | FileReader → localStorage | POST /api/gallery (admin, multipart → Cloudinary) |
| List | localStorage items | GET /api/gallery (public) |
| Delete | localStorage filter | DELETE /api/gallery/:id (admin, + Cloudinary destroy) |
| Storage | dataURL in localStorage (2 MB limit) | Cloudinary URL in MongoDB |

**Critical:** localStorage gallery is lost on browser clear. Cloudinary provides persistent CDN URLs.

---

### 6. Dashboard
| Aspect | Current | Required backend |
|---|---|---|
| User stats | localStorage counts | GET /api/dashboard/user (authenticated) |
| Admin stats | localStorage counts | GET /api/dashboard/admin (admin-only) |
| Saved plots | localStorage array | Stored on User document or separate SavedPlot collection |

---

### 7. Static / Frontend-only (no backend needed)
- Navbar, Footer layout
- Amenities page (static list)
- About page
- Projects page
- Homepage sections (cinematic hero, why-choose, how-to-buy)
- Config (company name, phone, address)

---

## Selected Stack

| Component | Choice | Reason |
|---|---|---|
| Runtime | Node.js 20+ / Express 4 | Standard, well-supported, no new learning curve |
| Database | MongoDB + Mongoose | Document model fits plot/enquiry/user data well; Atlas free tier available |
| Auth | JWT (jsonwebtoken) via Authorization header | Stateless, works with SPA; stored in memory/sessionStorage on client |
| Passwords | bcryptjs | Standard, no native bindings needed |
| File uploads | multer + cloudinary SDK | Cloudinary free tier, CDN delivery, persistent URLs |
| Validation | express-validator | Declarative, chainable |
| Security | helmet + cors + express-rate-limit | Standard hardening |
| Logging | morgan | Zero-config HTTP logging |
| Testing | Jest + Supertest | Standard Node test stack |

---

## Database Collections

```
users        { name, email, mobile, passwordHash, role, savedPlots[], createdAt }
plots        { number, area, dimensions, facing, road, price, status, features[], col, row }
enquiries    { name, email, mobile, message, plotId, plotNumber, userId?, status, createdAt }
visits       { name, email, mobile, preferredDate, preferredTime, message, userId?, status, createdAt }
galleryitems { title, caption, category, imageUrl, publicId, uploadedBy, uploadedAt }
```

---

## API Surface (summary)

```
POST   /api/auth/register          public
POST   /api/auth/login             public
GET    /api/auth/me                authenticated
POST   /api/auth/logout            authenticated

GET    /api/plots                  public  ?status= &facing= &minArea= &maxArea= &search=
GET    /api/plots/:id              public
PATCH  /api/plots/:id/status       admin
POST   /api/plots                  admin
DELETE /api/plots/:id              admin

POST   /api/enquiries              public (or authenticated)
GET    /api/enquiries              admin
GET    /api/enquiries/mine         authenticated
PATCH  /api/enquiries/:id/status   admin
DELETE /api/enquiries/:id          admin

POST   /api/visits                 public (or authenticated)
GET    /api/visits                 admin
GET    /api/visits/mine            authenticated
PATCH  /api/visits/:id/status      admin

GET    /api/gallery                public
POST   /api/gallery                admin  (multipart/form-data)
DELETE /api/gallery/:id            admin

GET    /api/dashboard/admin        admin
GET    /api/dashboard/user         authenticated

GET    /api/health                 public
```

---

## External Services Required

| Service | Purpose | Status |
|---|---|---|
| MongoDB Atlas (or local) | Database | Requires MONGODB_URI env var |
| Cloudinary | Image storage | Requires CLOUDINARY_* env vars |
| SMTP (optional) | Email confirmation | Not in scope for MVP |

---

## Acceptance Tests

See `backend/tests/` for automated test suites covering:
- Auth registration/login/me/logout
- Plot CRUD and filtering
- Enquiry submission and admin management
- Visit booking
- Gallery upload/list/delete (mocked Cloudinary)
- Admin-only endpoint protection
- Input validation rejection
