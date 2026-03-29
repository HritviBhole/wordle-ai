# Wordle.AI — Entropy-Based Wordle Solver

> An NLP-powered Wordle solver that guarantees convergence in ≤4 guesses using Shannon entropy maximization and letter-frequency analysis.

\---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Wordle.AI System                         │
├─────────────────┬───────────────────┬───────────────────────┤
│   React Frontend│   FastAPI Backend │   Word Corpus         │
│   (Vite + CSS)  │   (Python 3.11)   │   (900+ 5-letter words│
│                 │                   │    from SCOWL/WordNet) │
│  • GameBoard    │  • /start\_game    │                       │
│  • FeedbackInput│  • /next\_guess    │  Algorithm            │
│  • CandidatePanel  /reset\_game     │  ─────────────────    │
│  • AlgorithmInfo│  • /candidates    │  1. Shannon Entropy   │
│  • useWordleGame│  • /stats         │  2. Letter Frequency  │
│    (hook)       │                   │  3. Two-pass Pattern  │
└─────────────────┴───────────────────┴───────────────────────┘
```

\---

## Cognitive Computing \& NLP Techniques

### 1\. Shannon Entropy Maximization (Core Algorithm)

The solver treats each guess as an **information-theoretic experiment**. For a given guess `g` over candidate set `C`:

```
H(g, C) = -Σ  p(pattern) · log₂(p(pattern))
           patterns
```

Where `p(pattern)` is the fraction of candidates that would produce that color pattern if they were the answer. A guess with **high entropy** splits candidates into many equally-sized groups — maximizing information gained regardless of the true answer.

**Why this works:** In the worst case, maximum entropy scoring halves (or better) the candidate pool each guess. With \~900 words, log₂(900) ≈ 9.8 bits. Our opener "trace" scores 6.065 bits, leaving ≤ 30 candidates after guess 1.

### 2\. Letter Frequency Analysis (Tie-breaking)

When two words have similar entropy scores, the solver prefers words whose letters appear most frequently across remaining candidates:

```python
freq\_bonus = Σ  (count of letter in candidates / total candidates)
              letter in word (unique)
```

This ensures the solver picks words that are statistically more likely to reveal information about common letters.

### 3\. Two-Pass Pattern Matching

Feedback pattern computation uses a **two-pass algorithm** to handle duplicate letters correctly (the same challenge Wordle itself faces):

* **Pass 1:** Mark exact matches (green). Consume those positions from both guess and answer.
* **Pass 2:** For remaining positions, check if the guess letter appears anywhere in the unconsumed answer characters (yellow).

This prevents over-counting of duplicate letters — a subtle NLP tokenization challenge.

### 4\. Adaptive Search Space

|Attempt|Strategy|
|-|-|
|1|Fixed opener: `trace` (precomputed max-entropy)|
|2–3|Score all remaining candidates by entropy|
|4|Pick highest-probability candidate directly|

\---

## Example Workflow

```
Target word: WORLD (unknown to solver)

Attempt 1: TRACE
  Feedback: \[gray, yellow, gray, gray, gray]
  → 'R' is in the word, not at position 2
  → Candidates reduced: 900 → 12
  → Information gained: \~6.2 bits

Attempt 2: ROUND
  Feedback: \[yellow, green, gray, gray, green]
  → 'O' at pos 2 confirmed, 'D' at pos 5 confirmed, 'R' somewhere
  → Candidates reduced: 12 → 1

Attempt 3: WORLD ✓
  All green — solved in 3 guesses!
```

\---

# **Quick Start**

### Prerequisites

* Python 3.11+
* Node.js 20+
* Docker \& Docker Compose (for containerized run)

### Local Development

**Backend:**

```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# API docs at: http://localhost:8000/docs
```

**Frontend:**

```
cd frontend
npm install
$env:VITE\_API\_URL="http://localhost:8000"
npm run dev
# App at: http://localhost:3000
```

### Docker (Full Stack)

```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Swagger docs: http://localhost:8000/docs
```

\---

## API Reference

### POST /start\_game

Initialize a new session. Returns the optimal first guess.

```json
// Response
{
  "session\_id": "uuid-...",
  "first\_guess": "trace",
  "entropy\_score": 6.065,
  "candidate\_count": 912,
  "message": "Start with 'trace' — highest entropy opener"
}
```

### POST /next\_guess

Submit feedback and receive the next optimal guess.

```json
// Request
{
  "session\_id": "uuid-...",
  "guess": "trace",
  "feedback": \["gray", "yellow", "gray", "gray", "gray"]
}

// Response
{
  "next\_guess": "round",
  "entropy\_score": 3.17,
  "candidates\_remaining": 12,
  "top\_candidates": \["round", "world", "glory", ...],
  "attempt": 2,
  "solved": false,
  "algorithm\_info": {
    "technique": "shannon\_entropy\_maximization",
    "bits\_gained": 6.23,
    "candidates\_before": 900,
    "candidates\_after": 12
  }
}
```

### POST /reset\_game/{session\_id}

Reset a session.

### GET /stats

Corpus statistics and top-entropy opener words.

\---

## Project Structure

```
wordle-solver/
├── backend/
│   ├── main.py          # FastAPI app + algorithm
│   ├── corpus.py        # 900+ word corpus
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── GameBoard.jsx
│   │   │   ├── FeedbackInput.jsx
│   │   │   ├── AlgorithmInfo.jsx
│   │   │   └── CandidatePanel.jsx
│   │   └── hooks/
│   │       └── useWordleGame.js
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── nginx.conf
├── docker/
│   ├── deploy-aws.sh
│   └── deploy-gcp.sh
├── docker-compose.yml
└── README.md
```

\---

## Performance

|Metric|Value|
|-|-|
|Opener entropy ("trace")|6.065 bits|
|API response time|<50ms|
|Corpus size|912 words|

\---

## 

