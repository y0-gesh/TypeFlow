# User Stories & Acceptance Criteria — TypeFlow

This document presents user stories mapped to TypeFlow's 12 development phases. Core stories feature detailed acceptance criteria and verification parameters.

---

## Phase 1: Foundation

### Story 1: Basic App Shell
**As a** new visitor,  
**I want to** load the TypeFlow homepage instantly in light or dark mode,  
**so that** I can see the application shell and understand how the platform works.

* **Acceptance Criteria**:
  * Home page loads in $\le 2.0$ seconds on standard networks.
  * Theme switcher toggle successfully switches between light and dark CSS variables without page refreshes.
  * Design styling uses modern monospace layouts and components matching the shadcn spec.
* **Verification**:
  * Execute `npm run build` and run Lighthouse audit. Verify CSS variable changes in Chrome DevTools inspector.

### Story 2: Account Creation & Login
**As an** aspiring user,  
**I want to** sign up and log in using an email/password or OAuth (GitHub/Google),  
**so that** I can create a secure account and save my library.

* **Acceptance Criteria**:
  * Email confirmation is sent upon registration.
  * Logged-in state is persistent across browser sessions using Supabase session storage.
  * Validation rules enforce strong passwords (minimum 8 characters, number, special character).
* **Verification**:
  * Try creating a duplicate email address and verify the server validation message. Confirm session cookies are written to the browser.

---

## Phase 2: Database Schema & RLS

### Story 3: Secure Personal Library Data
**As a** registered user,  
**I want to** store my documents and statistics securely in a private database,  
**so that** nobody else can view, modify, or delete my learning files.

* **Acceptance Criteria**:
  * Row-Level Security (RLS) is active on the `libraries`, `documents`, `chapters`, `lessons`, and `typing_sessions` tables.
  * Authenticated user sessions are verified via Supabase auth checks.
  * Any direct database query attempts on other users' IDs return empty arrays or access denied errors.
* **Verification**:
  * Attempt an SQL select query on the database using a different user ID token and confirm access is denied.

---

## Phase 3: Library Management

### Story 4: Organize Uploads
**As a** student or developer,  
**I want to** create distinct folders (libraries) and search through them,  
**so that** I can organize my uploads by subject (e.g., "Biology Study Guides" vs. "JavaScript Code").

* **Acceptance Criteria**:
  * Users can perform CRUD operations on library folders.
  * Real-time search filter filters documents by folder title and tags.
* **Verification**:
  * Create a library, verify it displays on the dashboard, search for it, and then delete it. Confirm children documents are deleted or unlinked.

---

## Phase 4: Document Ingestion

### Story 5: Multi-Format Uploads
**As a** researcher or student,  
**I want to** upload `.txt`, `.md`, `.pdf`, and `.docx` files, or paste raw text,  
**so that** I can practice typing on my files regardless of file format.

* **Acceptance Criteria**:
  * Drag-and-drop file target accepts all specified extensions.
  * Paste text field handles inputs up to 100,000 characters without crashing the browser.
  * File processing queue updates states: `Uploaded` $\rightarrow$ `Queued` $\rightarrow$ `Processing` $\rightarrow$ `Completed`.
* **Verification**:
  * Upload a 5MB PDF document. Confirm status updates correctly and file is stored in the Supabase Storage bucket.

---

## Phase 5: Document Processor Pipeline

### Story 6: Readable Ingestion (Content Engineer Agent)
**As a** reader practicing typing,  
**I want** my uploaded documents split into clean, logical chapters and readable 80-200 character chunks,  
**so that** my typing flow is natural and free from weird formatting blocks.

* **Acceptance Criteria**:
  * Consecutive whitespaces and newlines are normalized to single characters.
  * Typing chunks are between 80 and 200 characters, splitting at sentence boundaries.
  * Words are not truncated at the beginning or end of a chunk.
  * Each chunk receives a difficulty score between 1 and 5.
* **Verification**:
  * Ingest a messy text file with line breaks and trailing spaces. Verify generated lesson strings in the database are between 80-200 characters and contain clean punctuation.

---

## Phase 6: Core Typing Engine

### Story 7: Smooth Typing Input (Typing Engine Agent)
**As a** typist,  
**I want** a highly responsive text box with key feedback highlights, a smooth caret, sounds, and live metrics,  
**so that** I can practice typing with standard feedback (similar to Monkeytype).

* **Acceptance Criteria**:
  * Typing input triggers visual color changes on keys instantly ($\le 16\text{ms}$).
  * Input is compared with the target text letter-by-letter.
  * Correct keys are green; incorrect keys are red with underlines.
  * Accuracy and WPM metrics update in real-time.
  * Pressing `Tab` resets the current chunk.
* **Verification**:
  * Run unit tests on the `compareInput`, `calculateWPM`, and `calculateAccuracy` functions. Manually test key rendering and backspacing behavior.

---

## Phase 7: Progression & Learning Flow

### Story 8: Progression Gate (Lesson Engine Agent)
**As a** learning typist,  
**I want to** advance to the next chunk only if I achieve at least 90% accuracy,  
**so that** I can master the current section before moving on.

* **Acceptance Criteria**:
  * If $\text{Accuracy} \ge 90\%$ on chunk completion, show a success transition and unlock the next chunk.
  * If $\text{Accuracy} < 90\%$, lock progression and present a "Retry Chunk" dialog.
  * User's current location index in the document is bookmarked.
* **Verification**:
  * Complete a chunk with 85% accuracy and verify that progression is blocked. Complete a chunk with 95% accuracy and confirm the next chunk loads.

---

## Phase 8: User Dashboard

### Story 9: Dashboard Summary
**As a** returning user,  
**I want to** see a dashboard with my daily goal status, weekly streak calendar, and overall stats,  
**so that** I can stay motivated and resume practice with one click.

* **Acceptance Criteria**:
  * Dashboard displays streak counts and a daily time tracking ring.
  * The "Continue Learning" button redirects directly to the next pending chunk of the last active document.
* **Verification**:
  * Complete 5 minutes of practice. Verify that the daily tracking widget updates. Logout, log back in, click "Continue Learning", and confirm it loads the correct lesson.

---

## Phase 9: Analytics & Keyboard Heatmap

### Story 10: Performance Analytics
**As a** competitive typist,  
**I want to** view line charts of my WPM/accuracy and a keyboard error heatmap,  
**so that** I can identify which keys slow me down or cause mistakes.

* **Acceptance Criteria**:
  * Linear WPM progress charts render with filters for 7 days, 30 days, and 12 months.
  * The keyboard layout heatmap highlights keys in shades of red based on high error rate inputs.
* **Verification**:
  * Verify heatmap highlights specific keys after deliberate typing tests with intentional errors.

---

## Phase 10: Personalization & Customization

### Story 11: Personalize Practice Space
**As a** picky keyboard enthusiast,  
**I want to** customize the typing themes, fonts, font sizes, keyboard layouts (Colemak, Dvorak), and caret styles,  
**so that** the environment matches my preferences.

* **Acceptance Criteria**:
  * Switching theme updates global CSS variables instantly.
  * Custom font sizes (14px, 16px, 20px, 24px) scale the container without breaking layouts.
  * Virtual keyboard maps change key layouts to match Colemak/Dvorak.
* **Verification**:
  * Change font to JetBrains Mono, layout to Colemak, and theme to Monokai. Verify styling modifications are stored in settings.

---

## Phase 11: Gamification & Engagement

### Story 12: Leveling & XP Rewards
**As a** gamification fan,  
**I want to** earn XP, unlock achievements, and climb local leaderboards,  
**so that** typing feels fun and competitive.

* **Acceptance Criteria**:
  * Earn XP based on characters typed, with multiplier bonuses for speed and high accuracy.
  * Display a "Level Up" toast with animation when XP target is met.
  * User achievements (badges) unlock when specific conditions are met.
* **Verification**:
  * Complete a chunk with 100% accuracy and verify XP bonus and badge triggers.

---

## Phase 12: AI-Assisted Features

### Story 13: Vocabulary Trainer
**As a** user struggling with specific keys,  
**I want** an AI generator to analyze my weak keys and build custom drill lessons,  
**so that** I can practice typing words containing those key combinations.

* **Acceptance Criteria**:
  * System identifies the top 3 most error-prone keys from historical sessions.
  * AI creates a 150-character typing lesson focusing on those characters.
* **Verification**:
  * Induce mistakes on keys `Z` and `Q` over multiple sessions. Confirm that the AI-generated drills target those characters.
