<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=700&size=34&pause=900&color=6366F1&center=true&vCenter=true&width=760&lines=DocuMind;AI-Powered+Document+Intelligence;Ask+your+PDFs.+Get+grounded+answers." alt="Animated DocuMind title" />

<p><strong>Turn documents into answers with Retrieval-Augmented Generation (RAG).</strong></p>

<a href="https://docu-mind-wine.vercel.app/"><img src="https://img.shields.io/badge/🚀_Live_Demo-Open_DocuMind-6366F1?style=for-the-badge" alt="Live Demo"></a>
<a href="https://documind-backend-latest-v4zu.onrender.com/docs"><img src="https://img.shields.io/badge/API-Swagger_Docs-16A34A?style=for-the-badge&logo=fastapi&logoColor=white" alt="API Docs"></a>

<p>
<img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=flat-square&logo=react&logoColor=20232A" alt="React">
<img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI">
<img src="https://img.shields.io/badge/Python-3.x-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python">
<img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
<img src="https://img.shields.io/badge/Google_Gemini-LLM-8E75B2?style=flat-square&logo=googlegemini&logoColor=white" alt="Gemini">
<img src="https://img.shields.io/badge/RAG-AI_Pipeline-F59E0B?style=flat-square" alt="RAG">
</p>
</div>

---

## ✨ Overview

**DocuMind** is an AI-powered document intelligence platform that lets users upload PDF documents and ask questions in natural language. It retrieves relevant document content and uses the Gemini API to generate context-grounded answers through a **Retrieval-Augmented Generation (RAG)** workflow.

## 🚀 Live Links

| Resource | Link |
|---|---|
| **Live application** | [docu-mind-wine.vercel.app](https://docu-mind-wine.vercel.app/) |
| **Backend API** | [Render backend](https://documind-backend-latest-v4zu.onrender.com/) |
| **Interactive API documentation** | [Swagger UI](https://documind-backend-latest-v4zu.onrender.com/docs) |
| **Database** | PostgreSQL hosted on Neon |

## 🎯 Features

- 📄 Upload and manage PDF documents.
- 💬 Ask natural-language questions about document content.
- 🧠 RAG workflow retrieves relevant text before answer generation.
- ✨ Gemini-powered answers based on retrieved context.
- 💾 PostgreSQL-backed persistent conversation history.
- 🗂️ React dashboard for document management and AI assistant workflows.
- 🔌 FastAPI REST backend with interactive Swagger documentation.
- ☁️ Deployed frontend, backend, and database services.

## 🧰 Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) ![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) |
| Backend | ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white) ![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white) ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=flat&logo=sqlalchemy&logoColor=white) |
| Database | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white) ![Neon](https://img.shields.io/badge/Neon-00E599?style=flat&logo=neon&logoColor=111111) |
| AI | ![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat&logo=googlegemini&logoColor=white) ![RAG](https://img.shields.io/badge/RAG-Retrieval--Augmented_Generation-F59E0B?style=flat) |
| Deployment | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white) ![Render](https://img.shields.io/badge/Render-46E3B7?style=flat&logo=render&logoColor=111111) |
| Tools | ![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white) ![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white) |

## 🏗️ System Architecture

```mermaid
flowchart TD
    U[User] --> UI[React + Vite Frontend]
    UI -->|REST API / HTTPS| API[FastAPI Backend]
    API --> PDF[PDF Text Extraction]
    PDF --> CHUNK[Text Chunking]
    CHUNK --> RET[Relevant Context Retrieval]
    RET --> GEM[Google Gemini API]
    GEM --> ANSWER[Context-Grounded Answer]
    ANSWER --> UI
    API <--> DB[(Neon PostgreSQL)]
    DB --> CHAT[Persistent Chat History]
```

## 🧠 RAG Workflow

```mermaid
flowchart LR
    A[Upload PDF] --> B[Extract Text]
    B --> C[Split into Chunks]
    C --> D[Retrieve Relevant Content]
    Q[User Question] --> D
    D --> E[Build Context]
    E --> F[Gemini API]
    F --> G[Answer in UI]
```

1. **Upload:** The user uploads a PDF.
2. **Extract:** The backend extracts readable text.
3. **Chunk:** Text is split into smaller sections.
4. **Retrieve:** Relevant content is selected for the user's question.
5. **Generate:** The question and retrieved context are sent to Gemini.
6. **Respond:** The answer is returned to the React interface.
7. **Persist:** Chat history is stored in PostgreSQL where supported by the chat workflow.

> This documents the high-level implemented workflow. A specific embedding model or vector database/index is not claimed here.

## 📁 Project Structure

```text
DocuMind/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Pages/views (if separated this way)
│   │   ├── services/         # API helpers (if separated this way)
│   │   ├── App.jsx
│   │   └── App.css
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── app/
│   │   ├── api/              # API routes (if organized by module)
│   │   ├── db/               # Database configuration
│   │   ├── models/           # Database models
│   │   └── main.py           # FastAPI entry point
│   └── requirements.txt
├── .github/workflows/        # CI workflows, if configured
└── README.md
```

> Adjust folder names to match your current repository if your local structure differs.

## ⚙️ Run Locally

### Prerequisites
- Node.js and npm
- Python (use the version configured by your project)
- PostgreSQL database (Neon can be used)
- Google Gemini API key

### 1. Clone your repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd DocuMind
```

### 2. Start the backend

```bash
cd backend
python -m venv .venv
```

Activate the environment:

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate
```

Install dependencies and configure environment variables:

```bash
pip install -r requirements.txt
```

Create the environment file expected by your backend (commonly `.env`). Example values:

```env
DATABASE_URL=your_postgresql_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

Use the exact variable names read by your application. Start the API from the backend directory if your entry point is `app.main:app`:

```bash
uvicorn app.main:app --reload
```

API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Ensure your frontend API client uses `VITE_API_URL`, then run:

```bash
npm run dev
```

Vite prints the local URL, usually [http://localhost:5173](http://localhost:5173).

## 🔐 Environment Variables

| Variable | Purpose | Example |
|---|---|---|
| `VITE_API_URL` | Frontend API base URL | `http://127.0.0.1:8000` |
| `DATABASE_URL` | PostgreSQL connection string | Configure privately |
| `GEMINI_API_KEY` | Gemini API access | Configure privately |

Variable names must match your code. Never commit API keys, database passwords, tokens, or private `.env` files.

## 🔌 API Documentation

Explore and test the deployed routes using [DocuMind Swagger UI](https://documind-backend-latest-v4zu.onrender.com/docs). Endpoint names and schemas may change as the project evolves.

## ☁️ Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Neon PostgreSQL

Set production environment variables in the hosting dashboards. Point `VITE_API_URL` to the deployed backend URL and rebuild/redeploy the frontend after changing Vite environment variables.

## 🛡️ Security Checklist

- Keep Gemini and database credentials on the backend.
- Validate uploaded files and enforce upload-size limits.
- Apply authentication and authorization to user documents and conversations.
- Configure CORS for trusted frontend origins only.
- Avoid logging secrets or sensitive document contents.

## 🗺️ Roadmap

- [ ] Improve retrieval quality and evaluate answer grounding.
- [ ] Add richer source references in generated answers.
- [ ] Add document search and filtering.
- [ ] Add automated frontend and backend tests.
- [ ] Improve observability for API latency and deployment health.

## 👨‍💻 Author

**Pranav Amale**

- [GitHub](https://github.com/Pranavamale1)
- [LinkedIn](https://www.linkedin.com/in/pranav-amale-210b2b342)

---

<div align="center">

**DocuMind — Ask your documents, not just your search bar.**

<sub>Built with React, FastAPI, PostgreSQL, and Google Gemini.</sub>

</div>
