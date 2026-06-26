# AI Competitor Feature Comparison Brief Generator

A complete, production-ready full-stack SaaS web application designed for **NETHI MALLIKARJUN GUPTA** to empower retail sales professionals. Floor staff can input competitor product details and customer concerns to instantly generate a persuasive, factual comparison brief leveraging **OpenAI GPT-4o**.

---

## 🚀 Tech Stack

* **Frontend:** React (Vite) + TypeScript + Tailwind CSS (v4) + Recharts (telemetry analytics) + Lucide Icons + custom Toast system.
* **Backend:** Node.js + Express.js with Helmet security, CORS, Rate Limiters, and Input Sanitization.
* **Database:** PostgreSQL managed via **Prisma ORM**.
* **AI:** OpenAI `gpt-4o` (with Google Gemini as a secondary fallback).

---

## 📂 Project Structure

```text
ai-competitor-comparison/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma   # PostgreSQL relational data definitions
│   │   └── seed.js         # Database seeder (products, templates, prompts, admin user)
│   ├── middleware/
│   │   └── auth.js         # JWT Authentication verification
│   ├── ai.js               # OpenAI gpt-4o structured JSON connector
│   ├── db.js               # Prisma Client initialization helper
│   ├── index.js            # Express API endpoint registry & controllers
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   └── Toast.tsx       # Toast notifications context provider
│   │   │   ├── Layout.tsx          # Responsive Sidebar layout
│   │   │   └── BriefView.tsx       # AI Comparison output rendering & PDF export
│   │   ├── pages/
│   │   │   ├── Login.tsx           # Authentication view (Remember Me, Role redirect)
│   │   │   ├── Register.tsx        # Registration view
│   │   │   ├── Dashboard.tsx       # Analytics-driven summary & presets page
│   │   │   ├── Generate.tsx        # Specification inputs, preset loader & product search
│   │   │   ├── History.tsx         # Paginated & filtered list of reports
│   │   │   ├── Analytics.tsx       # Telemetry charts panel (admin only)
│   │   │   ├── AdminPanel.tsx      # Central admin panels tab panel (admin only)
│   │   │   └── Settings.tsx        # Store profile & guidelines
│   │   ├── types/
│   │   │   └── index.ts            # Global TypeScript types declarations
│   │   ├── api.ts                  # Typed client fetch wrappers
│   │   ├── App.tsx                 # Route Guards & screen layouts
│   │   └── main.tsx                # Entry point
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
├── package.json                    # Root workspace manager
└── README.md
```

---

## 🛠️ Local Installation & Development

### 1. Database Setup
Ensure you have a PostgreSQL database running (e.g. locally or a cloud DB on Supabase).

### 2. Configure Environment Variables
* Copy `backend/.env.example` to `backend/.env` and supply:
  * `DATABASE_URL` (with your PostgreSQL connection string)
  * `JWT_SECRET` (a secure random string)
  * `OPENAI_API_KEY` (your OpenAI API key for `gpt-4o` brief generation)
* Copy `frontend/.env.example` to `frontend/.env` and set:
  * `VITE_API_URL=http://localhost:5000`

### 3. Install Dependencies
Run the workspace installer script from the root directory:
```bash
npm run install-all
```

### 4. Run Relational Database Migrations & Seeding
From the `backend/` directory, initialize PostgreSQL tables and seed starting configurations:
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```
> **Default Admin Credentials:** The seed script automatically registers:
> * **Email:** `admin@nethigupta.com`
> * **Password:** `AdminPass123!`
> * **Role:** `admin`

### 5. Start Servers
Run concurrently or separately:
* **Backend:**
  ```bash
  npm run dev-backend
  ```
* **Frontend:**
  ```bash
  npm run dev-frontend
  ```
Navigate your browser to the URL output by Vite (usually `http://localhost:5173`).

---

## 🔐 Security Standards Implemented

1. **Helmet Security:** Adds HTTP response headers to safeguard against hijacking and cross-site scripting.
2. **CORS Configuration:** Restricts cross-origin resource sharing to specified domains.
3. **API Rate Limiter:** Protects resources against brute force requests (200 requests/15 minutes per IP).
4. **Input Sanitization:** Strips HTML tag markers from request payloads to counteract HTML injection.
5. **Secure Authentication:** Utilizes standard JSON Web Tokens (JWT) and hashes credentials using `bcryptjs`.
6. **SQL Injection Protection:** Avoids raw dynamic queries by utilizing Prisma client's query engine under the hood.

---

## 📦 Deployment Instructions

### Frontend (Vercel)
Deploy `frontend/` as a static Vite application:
1. Link your repository.
2. Set build directory command: `npm run build`.
3. Set output directory path: `dist`.
4. Configure environment variable: `VITE_API_URL` (pointing to Render backend server URL).

### Backend (Render)
Deploy `backend/` as a Node web service:
1. Select Web Service.
2. Specify build command: `npm install && npx prisma generate`.
3. Specify start command: `node index.js`.
4. Add environment variables: `DATABASE_URL`, `JWT_SECRET`, and `OPENAI_API_KEY`.

### Database (Supabase)
Provide the transaction pooling connection string of your Supabase database inside Render's `DATABASE_URL` config.
