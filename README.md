# Piano with Aaron — Phase 1 & 2

**Phase 1** gives you a working, testable foundation:

- PostgreSQL schema for the full LMS (User, Course, Section, Lesson, Enrollment, LessonProgress, Payment)
- Express backend with signup / login / forgot-password / reset-password / `me`
- JWT authentication + role-based access control (STUDENT vs ADMIN), proven with a `/api/admin/ping` route
- Next.js frontend with Signup, Login, and Forgot Password pages wired to the API

Nothing here depends on Paystack yet — that's Phase 3. The `Course`, `Section`,
`Lesson`, `Enrollment`, and `Payment` tables exist in the schema now so the
database doesn't need to change shape later, but there are no course-related
API routes yet — that's Phase 2.

## 1. Prerequisites

- Node.js 18+
- A PostgreSQL database (any of these work — pick whichever is easiest for you):
  - Local Postgres (`brew install postgresql` / `apt install postgresql`)
  - A free hosted instance: [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app)

You don't need Paystack keys yet for this phase.

## 2. Backend setup

```bash
cd backend
cp .env.example .env
```

Open `.env` and set:
- `DATABASE_URL` — your Postgres connection string
- `JWT_SECRET` — any long random string (e.g. run `openssl rand -hex 32`)

Then install and migrate:

```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

The API will run at `http://localhost:4000`. Check it's alive:

```bash
curl http://localhost:4000/health
# {"status":"ok"}
```

### Try the auth flow

```bash
# Sign up
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Ama Owusu","email":"ama@example.com","password":"supersecret1"}'

# Log in
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ama@example.com","password":"supersecret1"}'

# Use the token from login to call the protected /me route
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Making an admin user

There's no admin signup route on purpose (you don't want the public creating
admin accounts). For now, promote a user directly in the database:

```bash
npx prisma studio
```

This opens a GUI at `http://localhost:5555` — find your user row and change
`role` from `STUDENT` to `ADMIN`. Then:

```bash
curl http://localhost:4000/api/admin/ping \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
# {"message":"Welcome, admin ama@example.com"}
```

## 3. Frontend setup

```bash
cd web
cp .env.local.example .env.local
npm install
npm run dev
```

Visit `http://localhost:3000`. You'll see a placeholder homepage with working
**Sign up**, **Log in**, and **Forgot Password** pages that talk to the backend.

## 4. Phase 2: Courses & Curriculum

Adds:
- Public endpoints: `GET /api/courses` (search/filter), `GET /api/courses/categories`, `GET /api/courses/:slug` (full curriculum, video URLs hidden unless the lesson is a preview or you're enrolled)
- Admin endpoints (all under `/api/admin`, require an ADMIN token): full CRUD for courses, sections, and lessons, plus `GET /api/admin/courses/:courseId/enrollments`
- Course Catalog page (`/courses`) with search and category/subcategory filters
- Course Detail page (`/courses/[slug]`) showing curriculum, locked/unlocked lessons, and an Enroll button (Paystack checkout comes in Phase 3)
- Homepage now shows the 4 category cards and featured courses
- Seed script that populates all 8 subcategory courses with sample sections/lessons

### Seed the database

```bash
cd backend
npm run seed
```

This is safe to re-run — it upserts courses and replaces their curriculum each time.

### Try the new endpoints

```bash
# Public catalog
curl http://localhost:4000/api/courses

# Filter by category
curl "http://localhost:4000/api/courses?category=Beginners%20Corner"

# Course detail (video URLs hidden unless you pass a token for an enrolled user)
curl http://localhost:4000/api/courses/piano-basics

# Admin: create a course (use an ADMIN token from Phase 1)
curl -X POST http://localhost:4000/api/admin/courses \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Course","description":"A test","price":100,"currency":"GHS","category":"Beginners Corner","subcategory":"Piano Basics","published":true}'
```

Then visit `http://localhost:3000/courses` in the browser to see the catalog,
and click into any course to see its curriculum page.

## 6. Phase 3: Paystack Payments

Adds:
- `POST /api/payments/initialize` — creates a PENDING payment record, starts a Paystack transaction, returns the checkout URL
- `GET /api/payments/verify/:reference` — server-side verification, called by the frontend after redirect back from Paystack
- `POST /api/payments/webhook` — the authoritative source of truth; Paystack calls this directly, independent of whether the student's browser makes it back to your site
- Enrollment is granted exactly once per successful payment, whichever path (verify or webhook) confirms it first — the other is a no-op
- The Enroll button now redirects to a real Paystack checkout, and `/payment/callback` handles the return trip

### 6.1 Get your Paystack keys

Log in to the [Paystack dashboard](https://dashboard.paystack.com) → **Settings → API Keys & Webhooks**. You'll need:
- **Secret key** (`sk_test_...` for testing, `sk_live_...` for real charges)
- **Public key** (not used by the backend yet, but you'll need it if you later add Paystack Inline on the frontend)

**Security note:** never commit a secret key to git or paste it into a chat/ticket that isn't your own private `.env` file. If a live secret key is ever exposed, rotate it immediately from the same dashboard page.

Put it in `backend/.env`:

```
PAYSTACK_SECRET_KEY="sk_test_or_live_your_key_here"
PAYSTACK_PUBLIC_KEY="pk_test_or_live_your_key_here"
```

Start with a **test** key while you're developing — Paystack test mode lets you simulate successful/failed mobile money and card payments without moving real money. Switch to the live key only when you're ready to accept real payments.

### 6.2 Set up the webhook

In the Paystack dashboard, under **Settings → API Keys & Webhooks**, set the webhook URL to:

```
https://YOUR_DOMAIN/api/payments/webhook
```

While developing locally, Paystack can't reach `localhost` directly — use a tunnel like [ngrok](https://ngrok.com):

```bash
ngrok http 4000
```

Then set the webhook URL to `https://YOUR_NGROK_SUBDOMAIN.ngrok.io/api/payments/webhook`.

### 6.3 Try the flow end to end

```bash
npm install   # picks up the new axios dependency
npm run dev
```

1. Log in as a student on the web app (`http://localhost:3000/login`)
2. Go to any course and click **Enroll now**
3. You'll be redirected to Paystack's checkout — for `GHS` courses you'll see Mobile Money and Card options; for `USD` courses, Card only
4. Complete the test payment using [Paystack's test card/mobile money numbers](https://paystack.com/docs/payments/test-payments)
5. You'll land back on `/payment/callback`, which verifies the transaction and confirms enrollment
6. Check the webhook fired too — you should see a `charge.success` log line in your backend terminal

### 6.4 Currency note

Course prices are stored as whole units (e.g. `150` for GHS 150). Paystack expects amounts in the smallest currency unit (pesewas/cents), so the backend multiplies by 100 automatically — you don't need to do anything extra when creating courses.

## 8. Phase 4: Lesson Player & Progress Tracking

Adds:
- `GET /api/courses/:slug/learn` — the real access boundary for lesson content. Requires auth; returns full curriculum **only** if the user is enrolled (or admin). Non-enrolled users get preview lessons only, nothing else.
- `GET /api/lessons/:lessonId` — fetches a single lesson's video/PDF URL, enrollment-checked independently (so even a crafted request can't pull a paid lesson's video URL without access)
- `POST /api/lessons/:lessonId/complete` — marks a lesson complete for the current user (enrollment-checked)
- `/learn/[slug]` — the lesson player page: collapsible curriculum sidebar with progress checkmarks, video player (auto-detects YouTube/Vimeo/direct file URLs), PDF download link, Previous/Next navigation, and a "Mark as complete" button that updates the progress bar live

### Try it

```bash
# As an enrolled student (or admin), this returns the full curriculum + progress:
curl http://localhost:4000/api/courses/piano-basics/learn \
  -H "Authorization: Bearer YOUR_TOKEN"

# Mark a lesson complete
curl -X POST http://localhost:4000/api/lessons/LESSON_ID/complete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Then visit `http://localhost:3000/learn/piano-basics` after enrolling (via
Phase 3's checkout, or by manually creating an enrollment row in Prisma
Studio while testing) to see the full player.

### Security note

Enrollment gating is enforced **again** here at the API level, independent of
the course-detail endpoint from Phase 2. A student can't bypass access by
hitting `/api/lessons/:id` directly — only preview lessons or lessons in a
course they're enrolled in will ever return a real `videoUrl`.

## 10. Phase 5: Admin Dashboard

Adds:
- `GET /api/admin/categories` — the fixed category/subcategory taxonomy, shared by the frontend so it's never hardcoded twice
- `GET /api/admin/courses/:id` — full curriculum for the course editor
- Enhanced `GET /api/admin/courses/:courseId/enrollments` — now returns each student's completed-lesson count, completion %, and a course-wide average completion rate
- `/admin` — full dashboard UI:
  - **Courses list** (`/admin/courses`) — publish/unpublish toggle, edit, delete, enrollment counts
  - **New Course** (`/admin/new`) — create with category/subcategory dropdowns pulled from the API
  - **Course editor** (`/admin/courses/[id]`) — edit course details; add/rename/delete sections; add/edit/delete lessons (title, video URL, PDF URL, preview toggle, duration)
  - **Enrollments** (`/admin/courses/[id]/enrollments`) — student list with per-student and course-wide completion rates

### Access control

`/admin/*` checks the JWT client-side (decoding the token, no signature
verification) just to decide whether to show the dashboard UI at all — this
is a UX convenience, **not** the real security boundary. Every actual admin
API call is independently re-checked server-side by `requireRole("ADMIN")`,
so a non-admin can't get real access no matter what the frontend does.

### About "uploading" PDFs and videos

The spec calls for uploading video/PDF files, but there's no file storage
service (S3, etc.) wired up — doing that requires AWS credentials I don't
have. So for now, lessons take a **URL** for both video and PDF, matching
the tech stack's own file-storage note ("Support Vimeo, YouTube unlisted, or
AWS S3 video URLs"). In practice: upload your video to Vimeo/YouTube
(unlisted) and your PDF to any file host or S3 bucket, then paste the URL in
here. If you want real in-browser file upload later, that's a well-defined
next step once you have an S3 bucket and credentials — say the word and
I'll wire it up.

### Try it

1. Promote your test user to `ADMIN` in Prisma Studio (see Phase 1 instructions) if you haven't already
2. Log in as that user, then visit `http://localhost:3000/admin`
3. Create a course, add a section, add a lesson with a video URL
4. Publish it and check it shows up in `/courses`
5. Enroll a different (student) user via Phase 3's checkout, mark a lesson complete via the player, then check `/admin/courses/[id]/enrollments` — you should see their progress

## 12. Phase 6: React Native Mobile App

Adds a full Expo/React Native app in `mobile/` covering:

- **Home** — hero, category cards, featured courses
- **Browse** — search + category filter chips, course list
- **Course Detail** — curriculum, locked/unlocked lessons, Enroll button
- **Payment Checkout** — Paystack checkout inside a WebView; detects the redirect back and verifies server-side (same backend endpoints as web)
- **Lesson Player** — video player (auto-detects YouTube/Vimeo/direct file), curriculum sidebar (as a slide-up sheet), progress tracking, previous/next navigation
- **My Courses** — enrolled courses, pulled from a new `GET /api/courses/me/enrolled` endpoint
- **Profile** — user info, account type, log out

It shares the exact same backend as the web app — no new API was built except
the one convenience endpoint above (also now available to the web app too).

### Design decisions worth knowing

- **Browsing is public, enrolling requires login** — you can view Home, Browse,
  and Course Detail without an account, matching the web app. Tapping Enroll
  (or opening My Courses/Profile) prompts login if you're not signed in.
- **Video/PDF are URLs, not uploads** — same as the web admin dashboard; there's
  no file storage service connected.
- **Paystack checkout uses a WebView**, not a native SDK. This keeps the mobile
  app using the exact same `/api/payments/initialize` and `/verify` endpoints
  as the web app, with no separate mobile-specific payment code to maintain.
  A native Paystack SDK integration is possible later if you want a more
  native-feeling checkout, but it's a separate piece of work.

### Setup

```bash
cd mobile
npm install
```

Set your backend URL in `app.json` under `expo.extra.apiUrl` — see
`mobile/.env.example` for guidance on `localhost` vs Android emulator vs
physical device addressing.

```bash
npx expo start
```

Scan the QR code with Expo Go (iOS/Android), or press `i`/`a` for a
simulator/emulator, assuming you have Xcode or Android Studio set up.

### Try it end to end

1. Sign up or log in
2. Browse to a course, tap Enroll — completes a real Paystack checkout in
   the in-app WebView (use test mode while developing)
3. After it redirects back, you'll see a success screen and can jump into
   the lesson player
4. Mark lessons complete and watch the progress bar update
5. Check My Courses — the course now appears there

## 13. All phases complete

The full platform is built:

1. ✅ Auth + database
2. ✅ Courses + curriculum + catalog
3. ✅ Paystack payments + webhooks
4. ✅ Lesson player + progress tracking
5. ✅ Admin dashboard
6. ✅ React Native mobile app

### Natural next steps, if you want to keep going

- Real file upload for videos/PDFs (needs an S3 bucket + credentials)
- Email delivery for password reset (SMTP config is already in `.env.example`, just needs a provider wired in)
- Push notifications for new lessons
- A native Paystack SDK integration on mobile instead of the WebView flow
- Automated tests
- Production deployment (the backend, web app, and a built mobile app all need hosting — happy to help with any of these when you're ready)
