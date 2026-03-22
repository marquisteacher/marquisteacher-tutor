# 🤖 MarquisTeacher AI Tutor

> *"Your personal English tutor — available anytime, anywhere."*

An AI-powered English language tutoring web application featuring structured exercises, free conversation practice, voice input, and a personalised student dashboard. Powered by Google Gemini and connected to the MarquisTeacher Academy ecosystem.

---

## 🌍 Live App

```
https://marquisteacher.github.io/marquisteacher-tutor
```

---

## 📸 Overview

The MarquisTeacher AI Tutor is **Phase 3** of the MarquisTeacher Academy ecosystem. Students who complete the English assessment on the main platform can sign up for personalised 15-minute AI tutoring sessions with **Marq** — a friendly, encouraging AI tutor tailored to their exact CEFR level and skill gaps.

---

## ✨ Features

### 🔐 Authentication
- Secure registration and login
- JWT token-based sessions
- CEFR level selection on signup
- Connected to MarquisTeacher Academy backend

### 📊 Student Dashboard
- Personalised greeting and level badge
- Session history and statistics
- Day streak tracking 🔥
- Skill snapshot from exam results
- Minutes practiced counter

### 🎓 15-Minute AI Tutor Sessions
Sessions are structured in two phases:

**Phase 1 — Structured Exercises (8 minutes)**
- Grammar drills tailored to CEFR level
- Vocabulary building exercises
- Reading comprehension practice
- Idioms and expressions

**Phase 2 — Free Conversation (7 minutes)**
- Natural English conversation
- Inline grammar corrections
- New expressions introduced naturally
- Encouraging, patient responses

### 🎤 Voice + Text Input
- Web Speech API integration
- Toggle voice on/off during sessions
- Speak or type — student's choice
- Real-time speech to text

### ⏱️ Session Timer
- Live 15-minute countdown
- Phase transition at 8 minutes
- Urgent warning in final minute
- Auto-ends and shows summary

### 🏁 Session Complete Screen
- Total exchanges count
- Session duration
- Current CEFR level
- AI-generated session summary
- Option to start another session

---

## 🤖 Meet Marq

```
Name:        Marq
Personality: Friendly and encouraging
Style:       Patient — never judges mistakes
Method:      Correct errors gently inline
Goal:        Build confidence and fluency
Engine:      Google Gemini AI
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5 · CSS3 · Vanilla JavaScript |
| AI Engine | Google Gemini API |
| Voice | Web Speech API (browser native) |
| Auth | JWT via MarquisTeacher Backend |
| Fonts | Syne · DM Sans · Space Mono |
| Hosting | GitHub Pages |
| Future AI | Claude API (Anthropic) |

---

## 📁 File Structure

```
marquisteacher-tutor/
├── index.html       ← Login / Register page
├── dashboard.html   ← Student dashboard
├── tutor.html       ← Live AI tutor session
├── style.css        ← Complete stylesheet
├── auth.js          ← Login/Register logic
├── dashboard.js     ← Dashboard and stats
├── tutor.js         ← AI tutor session engine
├── LICENSE          ← MIT License
└── .gitignore       ← Protects secrets
```

---

## 🔗 Connected Ecosystem

```
MarquisTeacher Academy    →  Take the English exam
        ↓
MarquisTeacher Backend    →  Auth · Database · Email
        ↓
MarquisTeacher AI Tutor   →  Personalised sessions
        ↓
Phase 2 (Coming Soon)     →  PDF Learning Plans
```

---

## ⚙️ Local Setup

### Prerequisites
- Google Gemini API key (free at aistudio.google.com)
- MarquisTeacher Backend running

### 1. Clone the repository
```bash
git clone https://github.com/marquisteacher/marquisteacher-tutor.git
cd marquisteacher-tutor
```

### 2. Create your local config file
Create a file called `config.js` (never commit this!):
```javascript
var GEMINI_API_KEY = 'your-gemini-api-key-here';
```

### 3. Add config.js to tutor.html
```html
<script src="config.js"></script>
<script src="tutor.js"></script>
</body>
</html>
```

### 4. Open locally
Open `index.html` in your browser — no build step required! ✅

---

## 🔒 API Key Security

```
✅ config.js is in .gitignore
✅ API key never appears in GitHub
✅ Key stays on your local machine only
✅ Production key embedded in tutor.js URL
   (move to backend in Version 2)
```

**Future improvement:** Move Gemini API calls to the backend so the key lives in `.env` and never touches the frontend.

---

## 🗺️ Roadmap

```
Version 1 (Current) ✅
├── Login / Register
├── Student Dashboard
├── 15-minute AI sessions
├── Voice + Text input
└── Session history

Version 2 (Coming Soon) 🔜
├── API key moved to backend
├── Session data saved to Firebase
├── PDF Learning Plan download
├── Progress tracking over time
└── Retake exam → measure growth

Version 3 (Future) 🚀
├── Claude API integration
├── Native voice (Text-to-Speech)
├── Multi-language support
├── Fine-tuned MarquisTeacher AI model
└── Mobile app
```

---

## 🌍 The MarquisTeacher Ecosystem

| Repository | Description | Status |
|-----------|-------------|--------|
| [marquisteacher-academy](https://github.com/marquisteacher/marquisteacher-academy) | Landing page + Assessment | ✅ Live |
| [marquisteacher-backend](https://github.com/marquisteacher/marquisteacher-backend) | API + Database | ✅ Live |
| [marquisteacher-tutor](https://github.com/marquisteacher/marquisteacher-tutor) | AI Tutor App | ✅ Live |

---

## 📬 Contact

**Marquis Williams**
📧 MarquisTeacher@gmail.com
🌐 [MarquisTeacher Academy](https://marquisteacher.github.io/marquisteacher-academy)

---

## 📜 License

MIT License — Copyright © 2025 Marquis Williams & MarquisTeacher Academy

See [LICENSE](./LICENSE) for full details.

---

> Built with 💙 by Marquis Williams · MarquisTeacher Academy · 2025
