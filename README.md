# YuktiVerse — The AI-powered Learning & Coding Universe 

**YuktiVerse** (from *Yukti* — Sanskrit for “reason/strategy” + *Universe*) is a MERN-stack web app that brings together four interconnected AI-first productivity worlds for learners and developers:

* **Notebook / Academic (Notebook Verse)** — AI-augmented freeform notes, hierarchical file organizer, sharing & search
* **Resume Verse** — AI resume analyzer, versioned history, shareable feedback
* **PDF Verse** — Topic-wise PDF summarizer, MCQ generator, and test mode
* **Code Verse** — Lightweight code editor with AI features (generate, debug, optimize, explain, improve) + AI-generated coding contests

This README gives an overview, architecture, installation & deployment steps, key features, security & performance notes, and next steps.

---

## Table of Contents

* [Demo / Landing page](#demo--landing-page)
* [Key features](#key-features)
* [Code Editor — five core AI capabilities (organized)](#code-editor---five-core-ai-capabilities-organized)
* [Architecture & Tech Stack](#architecture--tech-stack)
* [Schemas & Data modeling](#schemas--data-modeling)
* [Security & Auth](#security--auth)
* [Performance & Optimization](#performance--optimization)
* [Running locally](#running-locally)
* [Environment variables (example)](#environment-variables-example)
* [Deployment](#deployment)
* [API / Routes (high-level)](#api--routes-high-level)
* [Known limitations](#known-limitations)
* [Keywords / Tags](#keywords--tags)
* [Contributing](#contributing)
* [License & Contact](#license--contact)

---

## Demo / Landing page

The landing page presents the **Yutivars universe** and the four feature "verses" as modules of the ecosystem. Each route is protected (JWT) and the app emphasizes the AI-first product vision.

> *Screenshots and GIFs go well here — include landing, notebook, resume-analyzer, pdf summarizer, and code-editor views.*
![Landing Page](./assets/landing-page.png)
![Notebook Verse Example](./assets/notebook-verse.png)

---
### Live Demo (public)

Try the live demo: **[🔗 Live Demo — Yutivars](https://yukti-verse.vercel.app/)**

Use these demo credentials (read-only):

| Role | Email | Password |
|---|---|---|
| Demo Student | ab2@gmail.com | 123! |

> ⚠️ These credentials are for demo purposes only. Demo accounts are limited, non-admin, and may be periodically reset. Do **not** use these credentials for production data.

---
## Key features

### 1. Notebook / Academic Organizer (Notebook Verse)

* **Hierarchical file organizer (Keeper)**: organize files by `Year → Subject → Chapter`.
* Supports three file types:

  * **AI Notebook** — freeform text boxes on a notebook-paper-like background. Each textbox can request AI responses (short help, expand to full explanation, chat on topic).
  * **PDF documents** — upload and reference PDFs.
  * **Images** — upload scanned notes or images.
* File operations: set importance, rename, delete, share/unshare (revoke link), file searching, recent/important/shared tabs.
* **Sharing**: generate public share links; revoke at any time; track views per shared item.
* **Local caching**: files and state cached in `localStorage` to speed searches and reduce API calls.

### 2. Resume Verse

* Upload a resume (PDF/DOCX/TXT) and get an AI-powered critique:

  * Strengths, weaknesses, missing keywords, formatting tips, role-fit suggestions.
* Save analyzed resumes to DB and view a versioned history.
* Export/share analysis reports.

### 3. PDF Verse (PDF Summarizer + MCQ Generator)

* Upload PDFs and receive **topic-wise summaries**: the PDF is split by topics/sections and each gets a concise summary.
* **MCQ generation** from topic summaries.
* **Quiz/Test mode**: take tests based on generated MCQs to estimate retention.
* Save summarized PDFs, MCQs, and test history to DB.

### 4. Code Verse (for developers & learners)

* Create & store code files across languages (JavaScript, C, C++, Java, HTML, etc.) with standard file operations and importance flags.
* Lightweight code editor with five AI capabilities (detailed below).
* **History & versioning**: Every AI action (debug/optimize/etc.) is recorded with a description + AI response; users can modify and save.
* **AI-generated coding contests**: generate problems by topic (arrays, strings, trees, maps, etc.), difficulty level, and language preference; solution verification is automatically assisted by the AI.

---

## Code Editor — five core AI capabilities (organized & explained)

1. **Code Generation**

   * Generate starter code from a problem description or prompt in the selected language. Useful for scaffolding functions, templates, or complete solutions.

2. **Debug**

   * Provide targeted debugging help: highlight likely errors, explain cause, and suggest or produce fixes. The editor can run through the failure points returned by the AI.

3. **Optimize**

   * Suggest or produce performance or memory improvements (complexity reductions, better algorithms, or idiomatic language patterns).

4. **Explain**

   * Produce human-friendly explanations of code blocks, algorithm rationale, and step-by-step analysis to aid learning or code review.

5. **Improve (Refactor)**

   * Refactor for readability, maintainability, or modern style (naming, modularization), and optionally apply recommended changes to the stored version.

Each action is stored as an item in the file’s **history**, labeled (e.g., `debug`, `optimize`, `explain`, etc.) and can be re-applied, revised, or reverted.

---

## Architecture & Tech Stack

* **Frontend**: React , client-side state caching, theme support . Deployed on **Vercel**.
* **Backend**: Node.js + Express, controllers structured & reused for maintainability. Deployed on **Render**.
* **Database**: MongoDB (Mongoose Atlas).
* **Authentication**: JWT for route protection; bcrypt for password hashing.
* **AI integration**: Gemini API used for summarization, resume analysis, code assistance, and MCQ generation.
* **File storage**: Cloudinary for images and files.
* **Other services**: Multer for file handling , environment variables to hold secrets, CORS configured.
* **Caching**: `localStorage` + React state caching to reduce API calls.

---

## Schemas & Data modeling (high-level)

Main Mongoose schemas/models included:

* `YearSchema`
* `SubjectSchema` (references Year)
* `ChapterSchema` (references Subject)
* `NotebookSchema` (references User, Chapter)
* `PDFDocumentSchema` / `PdfFileSchema`
* `ResumeSchema`
* `MCQSchema`
* `SharedNotebookSchema`

**Design notes**

* Referential documents are used to reduce query load and duplication — e.g., `Subject` references `Year`, `Notebook` references `User` and `Chapter`. This minimizes data duplication and lets queries fetch just the necessary objects.
* Controllers are shared and refactored to avoid code repetition and reduce backend complexity.

---

## Security & Auth

* **Passwords** hashed with **bcrypt** before storage.
* **JWT** used for authentication and protecting routes (access tokens; refresh token pattern optional).
* Secrets, API keys, DB URIs are stored in **environment variables** (never commit `.env` to repo).
* **CORS** implemented to allow safe cross-origin requests between frontend (Vercel) and backend (Render).
* Role-based access and share link revocation enforced server-side for shared content.

---

## Performance & Optimization

* **Referential data modeling** reduces data duplication and query complexity.
* **Local caching**: `localStorage` + React state caching for files and recent responses to reduce repeated network requests and speed up search.
* **Controller reuse** & modular controllers in the backend to minimize code and duplicated DB queries.
* **Reduced API traffic**: store AI responses and only re-request when needed; batch smaller requests where appropriate.

---

## Running locally

1. **Clone**

```bash
git clone https://github.com/<your-org>/yutivars.git
cd yutivars
```

2. **Install**

```bash
# in project root or separate frontend/backend folders depending on repo layout
cd backend
npm install

cd ../frontend
npm install
```

3. **Environment**
   Create `.env` files for frontend and backend using the example below.

4. **Run**

```bash
# Backend
cd backend
npm run dev   # (or `node index.js` / `nodemon`)

# Frontend
cd ../frontend
npm start
```

5. Open the front-end at `http://localhost:3000` (or port configured).

---

## Environment variables (example)

Place these in `backend/.env` (and analogous frontend variables in `frontend/.env`):

```
# Backend
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/yutivars?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
BCRYPT_SALT_ROUNDS=10
GEMINI_API_KEY=your_gemini_or_llm_api_key
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
CLOUDINARY_UPLOAD_PRESET=...
FRONTEND_URL=https://your-frontend-url.vercel.app
```

**Important**: keep `.env` out of version control.

---

## Deployment

* **Frontend**: deployed to **Vercel** — static React build with environment variables provided in the Vercel dashboard.
* **Backend**: deployed to **Render** (or Heroku/another server) — use environment variables for DB connection and API keys.
* Configure CORS to allow the frontend domain.
* Use HTTPS and production JWT secret rotation.

---

## API / Routes (high-level)

* `POST /api/auth/register` — register (bcrypt + store)
* `POST /api/auth/login` — login (returns JWT)
* `GET /api/user` — protected profile
* `CRUD /api/years`, `/api/subjects`, `/api/chapters` — hierarchical organizer
* `CRUD /api/notebooks` — notebook items; AI interactions per textbox
* `POST /api/upload` — file upload (Cloudinary)
* `POST /api/pdf/summarize` — PDF summarization & topic split
* `POST /api/pdf/mcq` — generate MCQs
* `POST /api/resume/analyze` — resume analyzer
* `CRUD /api/codefiles` — store code files & history
* `POST /api/code/ai` — endpoints for generation/debug/optimize/explain/improve and contest generation
* `POST /api/share` — create/ revoke share links; track views

(Adjust endpoints for your implementation; include validation & rate-limiting in production.)

---

## Known limitations

* The UI is **not optimized for mobile** — desktop-first design.
* Some AI features are rate-limited by upstream LLM provider usage / costs.
* File storage relies on Cloudinary — setup required.

---

## Keywords / Tags (recommended)

`MERN` · `React`  · `Node.js` · `Express` · `MongoDB` · `Mongoose` · `JWT` · `bcrypt` · `AI` · `Gemini API` · `PDF Summarizer` · `Resume Analyzer` · `MCQ Generator` · `Code Editor` · `Cloudinary` · `EdTech` · `LocalStorage Caching` · `Vercel` · `Render`

---
##  Authors / Developers

**Akash Bera**  

- GitHub: https://github.com/akashbera009
- LinkedIn: https://www.linkedin.com/in/akash-bera-5a3009250/

**Subhayan Kapas**  

- GitHub: https://github.com/Subhayan009kapas
- LinkedIn :https://www.linkedin.com/in/subhayan-kapas-003009250/

---
## Contributing

Thanks for your interest! Suggested workflow:

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/<feature-name>`
3. Commit & push: `git push origin feat/<feature-name>`
4. Open a pull request with a description of changes
5. Ensure linting/tests pass (add tests where applicable)

---

## Future ideas / Roadmap

* Mobile responsive redesign
* Real-time collaborative notebooks (WebSocket-based)
* User roles (students, instructors) & classroom features
* CI/CD for tests & automatic deployment
* Fine-grained rate-limiting and usage analytics for AI calls
* More contest features: leaderboards, test-case runner, time-limited contests

---

## License & Contact

Include your license (MIT/Apache/etc.) and a contact email or link to your portfolio/GitHub.

---

If you want, I can:

* produce a ready-to-drop `README.md` file in markdown formatted exactly as above (ready to copy),
* create badges (CI / license / build),
* generate short marketing blurbs for the landing page (3 variants),
* or craft the `ENV` and `Procfile` examples for Render/Vercel.

Which of those would you like next?