# Typing Trainer Platform — Implementation Plan

## Objective

Build a typing platform where users upload their own content (books, text files) and practice typing on dynamically generated lessons, with UX similar to TypingClub and typing logic inspired by Monkeytype.

---

# 1. Scope Definition (MVP)

## Included

* Upload `.txt` files
* Parse and clean text
* Generate typing chunks
* Typing interface (real-time feedback)
* WPM & accuracy calculation
* Basic progression system
* Local storage for progress

## Excluded (for now)

* Authentication
* PDF/EPUB support
* AI features
* Cloud storage
* Social features

---

# 2. System Architecture

```
[Upload System]
      ↓
[Content Processor]
      ↓
[Chunk Generator]
      ↓
[Difficulty Classifier]
      ↓
[Lesson Engine]
      ↓
[Typing Engine]
      ↓
[Progress Tracker]
```

---

# 3. Tech Stack

## Frontend

* React (Next.js)
* Tailwind CSS
* Zustand (state management)

## Backend (Phase 2)

* FastAPI
* MongoDB

---

# 4. Folder Structure

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

# 5. Phase-wise Implementation

---

## Phase 1: File Upload & Parsing

### Goal

Load user text into the system.

### Implementation

```js
function handleFileUpload(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    processText(text);
  };
  reader.readAsText(file);
}
```

---

## Phase 2: Text Cleaning

### Goal

Normalize raw text.

```js
export function cleanText(text) {
  return text
    .replace(/\r/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
}
```

---

## Phase 3: Sentence Splitting

```js
export function splitSentences(text) {
  return text.split(/[.!?]+/);
}
```

---

## Phase 4: Chunk Generation

### Rules

* 80–200 characters per chunk
* Preserve readability

```js
export function createChunks(sentences) {
  const chunks = [];
  let current = "";

  for (let sentence of sentences) {
    if ((current + sentence).length < 180) {
      current += sentence + " ";
    } else {
      chunks.push(current.trim());
      current = sentence + " ";
    }
  }

  if (current) chunks.push(current.trim());

  return chunks;
}
```

---

## Phase 5: Difficulty Scoring

```js
export function getDifficulty(text) {
  const lengthScore = text.length / 100;
  const punctuationScore = (text.match(/[.,!?;:]/g) || []).length;
  const capsScore = (text.match(/[A-Z]/g) || []).length;

  return Math.min(
    5,
    Math.ceil(lengthScore + punctuationScore * 0.5 + capsScore * 0.3)
  );
}
```

---

## Phase 6: Typing Engine

### Input Comparison

```js
export function compareInput(expected, actual) {
  let correct = 0;

  for (let i = 0; i < actual.length; i++) {
    if (actual[i] === expected[i]) correct++;
  }

  return {
    correct,
    incorrect: actual.length - correct
  };
}
```

---

### WPM Calculation

```js
export function calculateWPM(charsTyped, timeInSeconds) {
  return (charsTyped / 5) / (timeInSeconds / 60);
}
```

---

### Accuracy

```js
export function calculateAccuracy(correct, total) {
  return (correct / total) * 100;
}
```

---

## Phase 7: Typing UI

### Requirements

* Highlight correct characters
* Highlight incorrect characters
* Cursor tracking

### Rendering Strategy

```js
expectedText.split("").map((char, i) => {
  let className = "";

  if (i < userInput.length) {
    className = userInput[i] === char ? "correct" : "incorrect";
  }

  return <span className={className}>{char}</span>;
});
```

---

## Phase 8: Lesson Flow

### Rules

* One chunk at a time
* Move forward only if accuracy ≥ 90%

```js
if (accuracy >= 90) {
  goToNextChunk();
} else {
  retryChunk();
}
```

---

## Phase 9: Progress Tracking

### Local Storage

```js
localStorage.setItem("progress", JSON.stringify({
  completedChunks: [],
  stats: []
}));
```

### Track

* WPM
* Accuracy
* Attempts per chunk

---

## Phase 10: UI/UX (TypingClub Style)

### Required Elements

* Centered typing box
* Minimal UI
* Progress bar
* Smooth transitions

### Avoid

* Over-design
* Complex dashboards

---

# 6. State Management (Zustand Example)

```js
import { create } from "zustand";

export const useTypingStore = create((set) => ({
  chunks: [],
  currentIndex: 0,
  userInput: "",
  
  setChunks: (chunks) => set({ chunks }),
  
  nextChunk: () => set((state) => ({
    currentIndex: state.currentIndex + 1,
    userInput: ""
  })),
  
  updateInput: (input) => set({ userInput: input })
}));
```

---

# 7. Milestone Timeline

## Week 1

* File upload
* Text cleaning
* Chunk generation

## Week 2

* Typing engine
* Input comparison
* WPM + accuracy

## Week 3

* Lesson flow
* Progress tracking

## Week 4

* UI polish
* Performance fixes

---

# 8. Success Criteria (MVP)

You are done ONLY if:

* User uploads text
* Text is chunked correctly
* Typing works in real-time
* Accuracy + WPM are correct
* Progression works (next/retry)

---

# 9. Common Failure Points

## 1. Overengineering early

Avoid adding:

* AI features
* Multi-format support
* Backend too early

## 2. Poor chunking

Bad chunking = bad UX

## 3. Mixing logic layers

Keep:

* Content engine separate
* Typing engine separate

## 4. Copy-pasting Monkeytype blindly

Extract logic, not architecture

---

# 10. Next Step

Start implementation in this exact order:

1. Upload → Display raw text
2. Clean text
3. Split into chunks
4. Show first chunk
5. Add typing input

Do not proceed until each step works correctly.

---

# Final Note

This project succeeds or fails based on:

* Chunk quality
* Difficulty control
* Typing feedback accuracy

Everything else is secondary.
