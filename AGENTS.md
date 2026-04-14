# AGENTS.md — Typing Trainer Platform

## Purpose

Define specialized AI agents to build and maintain a dynamic typing trainer platform that combines:

* TypingClub-like UX (guided learning, progression)
* Monkeytype-like typing engine (real-time accuracy, speed tracking)
* Custom content ingestion (user-uploaded text)

Each agent has strict responsibilities. Do not overlap roles.

---

# 1. System Overview

```text
User Upload → Content Engine → Chunking → Difficulty Scoring
→ Lesson Engine → Typing Engine → Progress Tracker → UI
```

---

# 2. Agent Definitions

---

## 2.1 Content Engineer Agent

### Responsibility

Owns all text processing logic.

### Inputs

* Raw `.txt` content

### Outputs

* Cleaned text
* Sentence arrays
* Structured chunks

### Tasks

* Normalize text
* Split into sentences
* Generate chunks (80–200 chars)
* Ensure readability

### Constraints

* No UI logic
* No typing logic
* Must produce deterministic output

### Key Functions

```js
cleanText(text)
splitSentences(text)
createChunks(sentences)
```

### Failure Conditions

* Chunks too long/short
* Broken sentences
* Inconsistent formatting

---

## 2.2 Difficulty Engine Agent

### Responsibility

Assign difficulty scores to chunks.

### Inputs

* Chunk text

### Outputs

* Difficulty level (1–5)

### Tasks

* Analyze:

  * Text length
  * Punctuation density
  * Capitalization

### Key Function

```js
getDifficulty(text)
```

### Constraints

* Must be fast (runs on every chunk)
* No external dependencies

### Failure Conditions

* Flat difficulty (all chunks same level)
* Unusable scaling

---

## 2.3 Typing Engine Agent

### Responsibility

Core typing logic (inspired by Monkeytype).

### Inputs

* Expected text
* User input stream

### Outputs

* Correct/incorrect characters
* WPM
* Accuracy

### Tasks

* Character-by-character validation
* Real-time feedback
* Metrics calculation

### Key Functions

```js
compareInput(expected, actual)
calculateWPM(chars, time)
calculateAccuracy(correct, total)
```

### Constraints

* No content processing
* No lesson logic

### Failure Conditions

* Laggy input
* Incorrect metrics
* Misaligned cursor logic

---

## 2.4 Lesson Engine Agent

### Responsibility

Controls learning flow.

### Inputs

* Chunk list
* Difficulty scores
* User performance

### Outputs

* Current chunk
* Next/retry decision

### Tasks

* Sequential progression
* Enforce completion rules
* Manage retries

### Logic Rule

```js
if (accuracy >= 90) → nextChunk
else → retryChunk
```

### Constraints

* No UI rendering
* No typing logic

### Failure Conditions

* Skipping chunks
* No progression control
* Infinite retry loops

---

## 2.5 Progress Tracker Agent

### Responsibility

Track and store user performance.

### Inputs

* Session results

### Outputs

* Stored progress data

### Tasks

* Save:

  * WPM
  * Accuracy
  * Completed chunks

### Storage

* LocalStorage (MVP)
* DB (future)

### Data Structure

```js
{
  completedChunks: [],
  stats: []
}
```

### Constraints

* Must be lightweight
* No UI logic

### Failure Conditions

* Data loss
* Incorrect stats aggregation

---

## 2.6 UI Agent

### Responsibility

Implements TypingClub-style user experience.

### Inputs

* Current chunk
* Typing feedback
* Progress data

### Outputs

* Rendered interface

### Components

* TypingBox
* ProgressBar
* Upload

### Tasks

* Render text with highlights
* Display progress
* Handle user input

### Constraints

* No business logic
* No content processing

### Failure Conditions

* Laggy rendering
* Poor readability
* UI clutter

---

## 2.7 State Management Agent

### Responsibility

Centralized state control.

### Tool

* Zustand

### State

```js
{
  chunks: [],
  currentIndex: 0,
  userInput: ""
}
```

### Tasks

* Sync UI and engines
* Manage transitions

### Constraints

* No heavy computation
* No side effects

### Failure Conditions

* State inconsistency
* Race conditions

---

# 3. Agent Communication Rules

## Allowed Flow

```text
Content → Difficulty → Lesson → Typing → Progress → UI
```

## Forbidden

* UI calling Content Engine directly
* Typing Engine modifying chunks
* Progress Tracker controlling flow

---

# 4. Execution Order

## Step 1

Content Engineer Agent

## Step 2

Difficulty Engine Agent

## Step 3

Typing Engine Agent

## Step 4

Lesson Engine Agent

## Step 5

Progress Tracker Agent

## Step 6

UI Agent

---

# 5. Development Protocol

## Rule 1

Each agent must be implemented and tested independently.

## Rule 2

No agent should depend on incomplete modules.

## Rule 3

Integration only after all agents are stable.

---

# 6. Testing Strategy

## Content Engine

* Input: messy text
* Output: clean chunks

## Typing Engine

* Simulate typing input
* Validate metrics

## Lesson Engine

* Test progression logic

## UI

* Manual validation

---

# 7. Future Agents (Post-MVP)

* AI Simplification Agent
* Weak Key Detection Agent
* Adaptive Difficulty Agent
* Cloud Sync Agent

---

# 8. Anti-Patterns (Strictly Avoid)

* Monolithic architecture
* Mixing UI with logic
* Direct mutation of shared state
* Copy-pasting Monkeytype codebase

---

# 9. Definition of Done

The system is complete when:

* User uploads text
* Chunks are generated correctly
* Typing works in real-time
* Metrics are accurate
* Progression is enforced

---

# Final Directive

Do not optimize prematurely.
Do not expand scope.
Do not merge agent responsibilities.

Build each agent as an isolated, testable unit.
