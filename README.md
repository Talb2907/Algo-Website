# Algo-Learn — פלטפורמת לימוד אלגוריתמים אינטראקטיבית

> An interactive, Hebrew-language algorithms learning platform built for course **636017**. Step-by-step visualizations, an AI personal tutor, an AI-powered exam generator, and direct Moodle integration — all in one place.

---

## Overview

Algo-Learn is a full-stack web application designed to help students master the algorithms covered in course 636017. Every algorithm ships with four dedicated learning tabs:

| Tab | Description |
|-----|-------------|
| **הסבר** (Explain) | Detailed breakdown — goal, input/output, pseudocode, and key notes |
| **הדמיה** (Animation) | Step-by-step animated visualization on a live graph canvas |
| **סיבוכיות** (Complexity) | Visual complexity bars and a full comparison table across all algorithms |
| **חידון** (Quiz) | Auto-graded multiple-choice questions with explanations |

---

## Key Features

### Animated Algorithm Visualizations
Thirteen algorithms are fully animated, rendered on an interactive canvas using a shared `GraphCanvas` component. Each step highlights active nodes, edges, and state changes in real time.

**Algorithms covered:**

| Group | Algorithms |
|-------|-----------|
| Graph traversal | BFS, DFS, Topological Sort, SCC |
| Minimum spanning tree | Kruskal, Prim |
| Shortest paths | Dijkstra, Bellman-Ford, Floyd-Warshall, DAG-SP, A\* |
| Greedy | Huffman Coding |
| Network flow | Ford-Fulkerson, Edmonds-Karp |
| Sorting | Merge Sort |

---

### AI Personal Tutor
A persistent chat panel powered by **Claude (Anthropic)** answers any question about course material. The tutor is context-aware — it knows which algorithm page the student is currently viewing and tailors its explanations accordingly.

---

### AI Exam Generator
Students configure a custom exam by selecting:
- Which algorithms to include
- Number of questions (5 / 10 / 15 / 20)
- Difficulty level (easy / medium / hard)

Questions are generated in real time via the Claude API, presented one at a time with instant feedback and a final summary screen.

---

### Moodle Integration
The exam generator can pull course materials directly from the university Moodle platform. A headless Playwright browser scrapes the course page, extracts PDFs and presentations, and feeds the parsed content into the exam prompt — producing questions that are specific to the actual course slides and assignments.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org) (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + CSS custom properties (dark/light theme) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| State management | [Zustand](https://zustand-demo.pmnd.rs/) |
| AI | [Anthropic Claude API](https://www.anthropic.com) (`@anthropic-ai/sdk`) |
| Browser automation | [Playwright](https://playwright.dev/) |
| File parsing | `pdf-parse`, `officeparser` |

---

## Project Structure

```
algo-learn/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── [algorithm]/page.tsx      # Dynamic algorithm page (all 4 tabs)
│   ├── exam/page.tsx             # Exam generator UI
│   └── api/
│       ├── chat/route.ts         # AI tutor endpoint
│       ├── generate-exam/route.ts# Exam generation endpoint
│       └── moodle-scraper/route.ts
├── components/
│   ├── animations/               # One animation component per algorithm
│   ├── tabs/                     # ExplainTab, AnimationTab, ComplexityTab, QuizTab
│   ├── layout/                   # Sidebar, Header
│   └── ui/                       # AITutor, PseudoCode, ThemeToggle
├── data/
│   ├── algorithms.ts             # Algorithm metadata (slugs, groups, colors)
│   └── content/                  # Per-algorithm content (pseudocode, questions, etc.)
├── store/
│   └── quizStore.ts              # Zustand store for quiz state
├── types/
│   └── index.ts                  # Shared TypeScript types
└── lib/
    ├── file-extractor.ts         # PDF/Office parsing utilities
    └── moodle-browser.ts         # Playwright Moodle scraper
```

---

## Running Locally

### Prerequisites
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)
- (Optional) Moodle credentials for the course integration

### 1. Clone and install

```bash
git clone https://github.com/Talb2907/Algo-Website.git
cd Algo-Website
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
ANTHROPIC_API_KEY=your_api_key_here

# Optional — required only for Moodle integration
MOODLE_URL=https://moodle.your-university.ac.il
MOODLE_USERNAME=your_username
MOODLE_PASSWORD=your_password
MOODLE_COURSE_ID=636017
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production

```bash
npm run build
npm start
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## Course

This project was built for **course 636017 — Algorithms** at the Open University of Israel.
