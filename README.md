# Algo-Learn

**Interactive algorithms learning platform with step-by-step visualizations, an AI tutor, and an AI-powered exam generator.**

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-latest-EF008F?style=flat-square&logo=framer&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## Overview

Algo-Learn is a full-stack web app that makes algorithms tangible. Every algorithm ships with four dedicated tabs:

| Tab | What it does |
|-----|-------------|
| **Explain** | Goal, input/output, pseudocode, and key notes |
| **Animation** | Step-by-step visualization on a live graph canvas |
| **Complexity** | Visual complexity bars and a cross-algorithm comparison table |
| **Quiz** | Auto-graded multiple-choice questions with explanations |

---

## Features

### ▶ Algorithm Visualizations

Sixteen algorithms are fully animated via a shared `GraphCanvas` component. Every step highlights active nodes, edges, and internal state in real time.

| Group | Algorithms |
|-------|-----------|
| Graph Traversal | BFS, DFS, Topological Sort, SCC |
| Minimum Spanning Tree | Kruskal, Prim |
| Shortest Paths | Dijkstra, Bellman-Ford, Floyd-Warshall, DAG-SP, A\* |
| Greedy | Huffman Coding |
| Network Flow | Ford-Fulkerson, Edmonds-Karp |
| Sorting | Merge Sort |

### 🤖 AI Personal Tutor

A persistent chat panel powered by the **Claude API** answers questions about any algorithm. The tutor is page-aware — it knows which algorithm is currently open and tailors explanations to that context.

### 📝 AI Exam Generator

Generate a custom practice exam in seconds. Configure:
- Which algorithms to include
- Number of questions (5 / 10 / 15 / 20)
- Difficulty (easy / medium / hard)

Questions are generated in real time via the Claude API, presented one at a time with instant feedback, and followed by a scored summary screen.

### 🎓 Moodle Integration

The exam generator can ingest course materials directly from a Moodle instance. A headless Playwright browser scrapes the course page, extracts PDFs and presentations via `pdf-parse` and `officeparser`, and feeds the parsed text into the exam prompt — producing questions grounded in your actual course materials.

---

## Tech Stack

| | Technology |
|--|-----------|
| Framework | [Next.js 14](https://nextjs.org) — App Router, server components, API routes |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + CSS custom properties (dark / light theme) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| State | [Zustand](https://zustand-demo.pmnd.rs/) |
| AI | [Anthropic Claude](https://www.anthropic.com) via `@anthropic-ai/sdk` |
| Automation | [Playwright](https://playwright.dev/) |
| File parsing | `pdf-parse`, `officeparser` |

---

## Project Structure

```
├── app/
│   ├── page.tsx                    # Landing page
│   ├── [algorithm]/page.tsx        # Dynamic algorithm page (all 4 tabs)
│   ├── exam/page.tsx               # Exam generator
│   └── api/
│       ├── chat/route.ts           # AI tutor endpoint
│       ├── generate-exam/route.ts  # Exam generation endpoint
│       └── moodle-scraper/route.ts # Moodle scraping endpoint
├── components/
│   ├── animations/                 # One animation component per algorithm
│   ├── tabs/                       # ExplainTab, AnimationTab, ComplexityTab, QuizTab
│   ├── layout/                     # Sidebar, Header
│   └── ui/                         # AITutor, PseudoCode, ThemeToggle
├── data/
│   ├── algorithms.ts               # Algorithm metadata (slugs, groups, colors)
│   └── content/                    # Per-algorithm content (pseudocode, questions)
├── store/quizStore.ts              # Zustand quiz state
├── types/index.ts                  # Shared TypeScript types
└── lib/
    ├── file-extractor.ts           # PDF / Office parsing utilities
    └── moodle-browser.ts           # Playwright scraper
```

---

## Getting Started

**Prerequisites:** Node.js 18+, an [Anthropic API key](https://console.anthropic.com/)

```bash
git clone https://github.com/Talb2907/Algo-Website.git
cd Algo-Website
npm install
```

Create `.env.local`:

```env
ANTHROPIC_API_KEY=your_api_key_here

# Optional — only needed for Moodle integration
MOODLE_URL=https://moodle.example.com
MOODLE_USERNAME=your_username
MOODLE_PASSWORD=your_password
MOODLE_COURSE_ID=your_course_id
```

```bash
npm run dev       # http://localhost:3000
npm run build     # production build
npm start         # serve production build
```
