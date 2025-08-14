
# 📚 AI-Powered Academic Support Platform

A full-stack educational assistant built with the **MERN stack** (MongoDB, Express, React, Node.js), designed to help school and college students with AI-generated notes, academic content management, resume analysis, and PDF summarization.

---

## 📂 Project Structure

```bash
root/
├── client/    # React frontend
└── server/    # Express + Node.js backend
````

---

## 🚀 Features

### 1. 📁 Academic Organizer

Organize your academic life with folders structured as:

> **Year → Subject → Chapter**

Each chapter allows:

* 📝 **AI-Powered Notes**: Generate or ask questions through text input using Gemini.
* 💬 **Contextual Chatbot**: Get detailed explanations per chapter.
* 📄 **PDF & Image Upload**: Add PDFs and images to any chapter (stored via Cloudinary).
* 📑 **AI Summarization**: Summarize any uploaded PDF with one click.

**Coming Soon**:

* 💻 Add and manage code snippets.
* 📂 Upload personal documents like resumes and files.

---

### 2. 🧠 Jobs-Prep Section

Improve your job readiness with:

* ✅ **Resume Analysis**: Find strong points in your uploaded resume.
* ⚠️ **Weak Point Detection**: Know what needs improvement.
* 🧭 **Guided Suggestions**: AI feedback on skills and areas to work on.

---

## 🖼️ Screenshots

### 📊 Dashboard
![Dashboard](assets/dashboard.png)

### 📂 Folder Structure
![Folder Structure](assets/folder-structure.png)

### 📝 AI-Powered Notes
![AI Notes](assets/ai-notes.png)

### 📄 PDF Summarizer
![PDF Summarizer](assets/pdf-summarizer.png)

> All screenshots are from the live application. Images are stored in the `assets/` folder of this repository.

---

---

### 3. 📄 PDF Summarizer + Q\&A

* 📚 Upload PDFs
* 🧠 Get:

  * AI-generated summaries
  * Smart **Q\&A pairs** based on document content
  * Auto-evaluation to test understanding

---

## 🛠️ Tech Stack

* **Frontend**: React + CSS
* **Backend**: Node.js + Express
* **Database**: MongoDB (Mongoose)
* **AI Engine**: Gemini API
* **File Uploads**: Cloudinary
* **Authentication**: Simple login (no role-based restrictions)

---

## 🧪 How to Run

```bash
# Clone the repository
git clone https://github.com/yourusername/project-name.git
cd project-name

# Start the backend
cd server
npm install
npm run dev

# Start the frontend
cd ../client
npm install
npm start
```

---

## 📃 License

MIT License. See `LICENSE` file for details.

```

---