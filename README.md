<div align="center">
  <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop" alt="EduKids Banner" width="100%" style="border-radius:20px"/>
  <br/><br/>
  <h1>🚀 EduKids Platform</h1>
  <p><strong>A Modern, Gamified, Multi-tenant School Management Architecture</strong></p>
</div>

---

## 📖 Overview
EduKids is an all-in-one educational platform engineered to bridge the gap between learning, administration, and parent involvement. Designed from the ground up to be scalable, responsive, and delightful, EduKids abandons boring LMS tropes in favor of a gamified, beautiful interface.

Our modular monolith architecture effectively segregates functionalities across four distinct user portals dynamically managed by a robust FastAPI backend.

---

## 🔥 Key Features

### 🎓 For Students (Gamified Learning)
- **Real-time Dashboards:** Track assignments, quiz scores, and daily schedules.
- **Engaging UI:** A vibrant, kid-friendly interface encouraging continued exploration.
- **Multilingual Support:** One-click language switching between English, French, and Arabic.

### 👩‍🏫 For Teachers (Digital Toolings)
- **Quiz Builders:** Create rich tests and assignments using dynamic form builders.
- **GradeBooks & Attendance:** Manage class rosters and submit scores effortlessly.
- **Course Distribution:** Upload syllabi and supplementary materials logically linked to cohorts.

### 👨‍👩‍👦 For Parents (Deep Insights)
- **Instant Communication:** Live messaging threads directly to teachers and administration.
- **Performance Tracking:** Downloadable, auto-generated PDF report cards mapped across semesters.
- **School Bulletins:** Stay synchronized with the school's global timetable and broadcast announcements.

### 🛡️ For Administrators (Complete Control)
- **RBAC Orchestration:** Approve teachers, onboard parents, and administer global role privileges.
- **Scheduling Engines:** Construct global school timetables visually mapped via drag-and-drop mechanics.
- **Platform Management:** Oversee the unified health of the database infrastructure.

---

## 🛠️ Technology Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | High-performance client compiling with HMR via SWC. |
| **Styling** | Tailwind CSS + Lucide | Utility-first styling coupled with pristine iconography. |
| **State & i18n** | React Router + i18next| Client-side routing and localized phrasing dictionaries. |
| **Backend** | FastAPI (Python) | Blazing fast Python web server running via Uvicorn. |
| **Database** | SQLite + SQLAlchemy | Strict ORM mapping preventing SQL injections natively. |
| **Security** | Passlib, JWT | Bcrypt password hashing + JSON Web Token stateless auth. |

---

## 🤖 AI-Assisted Development Disclosure

*This project was developed and orchestrated holistically in collaboration with advanced large language models (LLMs) working autonomously within an Agentic coding environment.*

While the conceptual vision, architectural constraints, and UX philosophy were rigidly defined by human intent, the execution—from configuring relational SQLAlchemy schemas to crafting responsive Tailwind CSS components—was dynamically pair-programmed and compiled using Artificial Intelligence. This process represents the absolute bleeding edge of prompt-driven software engineering and agentic workflows.

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
npm install
npm run dev
```

Your React application will spawn on `http://localhost:5173` pointing natively to your Python API on `http://localhost:8000`. Keep both terminals alive!

---
<div align="center">
  <p>Built for the Future of Education.</p>
</div>
