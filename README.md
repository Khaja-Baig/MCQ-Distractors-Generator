# DistractorLab

A clean, modern web platform for generating high-quality MCQ distractors with AI-powered reasoning.

## Quick Start

### 1. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Configure AI (optional)

```bash
cp server/.env.example server/.env
# Edit server/.env and add your OpenAI API key
```

Without an API key, the app runs in **demo mode** with mock data.

### 3. Start both servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Open **http://localhost:5173** in your browser.

## Features

- **Smart distractor generation** — AI creates 3 plausible wrong answers with reasoning
- **Difficulty levels** — Easy / Medium / Hard affect distractor complexity
- **Strict Maths Mode** — Rule-based error patterns for numerical questions
- **Regenerate single option** — Refresh one distractor without regenerating all
- **History** — Previous generations stored in localStorage
- **Export** — Copy formatted MCQ or download as CSV

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Vite + React |
| Styling | Vanilla CSS |
| Backend | Express.js |
| AI | OpenAI GPT-4o-mini (pluggable) |
# MCQ-Distractors-Generator
