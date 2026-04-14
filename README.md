# TypeFlow — Dynamic Typing Trainer

## Overview

TypeFlow is a typing practice platform that converts **user-provided content** into structured typing lessons.

Unlike traditional platforms like TypingClub, where lessons are fixed, TypeFlow allows users to:

* Upload their own text (books, notes, articles)
* Practice typing on meaningful, personalized content
* Improve typing speed while reading real material

The typing engine is inspired by Monkeytype, ensuring accurate and real-time performance tracking.

---

## Core Idea

> Turn any text into a structured typing experience.

This is not a typing test tool.
This is a **content-driven typing learning system**.

---

## Key Features (MVP)

### 1. Custom Content Upload

* Upload `.txt` files
* Instantly process content into typing-ready format

### 2. Intelligent Chunking

* Automatically splits text into readable chunks (80–200 characters)
* Ensures smooth typing flow

### 3. Real-Time Typing Engine

* Character-by-character validation
* Live feedback (correct/incorrect highlighting)
* Accurate WPM and accuracy calculation

### 4. Guided Learning Flow

* One chunk at a time
* Progression based on performance (≥ 90% accuracy)

### 5. Progress Tracking

* Tracks:

  * WPM
  * Accuracy
  * Completed chunks
* Stored locally (no account required)

---

## System Architecture

```text
Upload → Clean → Chunk → Difficulty → Lesson → Typing → Progress
```

### Core Modules

* **Content Engine** → Processes raw text
* **Difficulty Engine** → Assigns complexity levels
* **Lesson Engine** → Controls progression
* **Typing Engine** → Handles input + metrics
* **Progress Tracker** → Stores user performance

---

## Tech Stack

### Frontend

* React (Vite / Next.js)
* Tailwind CSS
* Zustand (state management)

### Backend (Future)

* FastAPI
* MongoDB

---

## Project Structure

```
src/
├── components/
|   ├── pages/
|   │   ├── Home.jsx
|   │   ├── Practice.jsx
|   |
|   ├── sections/
|   ├── layouts/
|   |
│   ├── TypingBox.jsx
│   ├── ProgressBar.jsx
│   ├── Upload.jsx
│
├── engines/
│   ├── typingEngine.js
│   ├── contentEngine.js
│
├── utils/
│   ├── textCleaner.js
│   ├── chunkGenerator.js
│   ├── difficulty.js
│
├── store/
│   ├── useTypingStore.js
│
└── app/page.jsx
```

---

## How It Works

### Step 1: Upload Content

User uploads a `.txt` file.

### Step 2: Processing Pipeline

* Text is cleaned
* Split into sentences
* Grouped into chunks
* Difficulty is assigned

### Step 3: Typing Session

* User types one chunk at a time
* Real-time feedback is shown

### Step 4: Evaluation

* WPM and accuracy are calculated
* Progression is controlled

---

## Typing Logic

### WPM Formula

```text
WPM = (characters / 5) / (time in minutes)
```

### Accuracy

```text
Accuracy = (correct characters / total characters) × 100
```

---

## Development Setup

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd typeflow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

---

## MVP Constraints

Strictly enforced:

* Only `.txt` support
* No authentication
* No AI features
* No backend dependency

Breaking these will delay the project unnecessarily.

---

## Roadmap (Post-MVP)

### Phase 2

* User accounts
* Cloud sync
* Save uploaded content

### Phase 3

* EPUB support
* AI-based text simplification
* Adaptive difficulty

### Phase 4

* Weak key detection
* Personalized drills
* Analytics dashboard

---

## Known Limitations

* No support for PDFs or EPUB (yet)
* Content quality depends on input text
* No cross-device sync

---

## Anti-Patterns to Avoid

* Copying full Monkeytype codebase
* Overengineering chunk logic early
* Mixing UI with business logic
* Expanding scope before MVP completion

---

## Contribution Guidelines

* Follow modular architecture
* Keep engines isolated
* Write testable functions
* Avoid tight coupling between components

---

## Definition of Done

The MVP is complete only when:

* Text upload works
* Content is chunked correctly
* Typing feedback is real-time
* WPM and accuracy are accurate
* Progression logic is enforced

---

## Final Note

TypeFlow is not about typing random words.
It is about **learning typing through meaningful content**.

If content processing is weak, the product fails.
If typing feedback is inaccurate, the product fails.

Everything depends on execution discipline.
