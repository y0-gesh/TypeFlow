# Non-Functional Requirements — TypeFlow

Non-functional requirements (NFRs) define the system attributes, operational envelopes, and quality standards that TypeFlow must meet. These requirements ensure that the platform is responsive, accessible, secure, and robust under load.

---

## 1. Performance & Latency

### 1.1 Typing Input Latency
* **Requirement**: The duration between a hardware keypress and the corresponding UI character highlight update must be less than **16ms** (target $\le 8\text{ms}$).
* **Rationale**: Any perceived delay in typing feedback disrupts user flow and lowers typing speed.
* **Implementation Guideline**: The `Typing Engine Agent` must not execute synchronous state updates, DB saving, or API calls on individual keydowns. It must only update a lightweight reactive state store.

### 1.2 Page Load & Time to Interactive (TTI)
* **Requirement**: Lighthouse Performance score for core landing and dashboard pages must exceed **90** on modern mobile and desktop connections.
* **Target Metrics**:
  * Largest Contentful Paint (LCP) $\le 2.5\text{s}$
  * First Input Delay (FID) $\le 100\text{ms}$ (or Interaction to Next Paint (INP) $\le 200\text{ms}$)
  * Cumulative Layout Shift (CLS) $\le 0.1$

### 1.3 Ingestion Pipeline Throughput
* **Requirement**: A document containing 100,000 characters (approx. 15,000 words) must complete extraction, cleaning, chunking, and lesson creation in less than **3.0 seconds** from upload confirmation to database write completion.
* **Implementation Guideline**: Heavy text processing operations (e.g., regex cleanups and chunk distributions) must run in optimized async loops or Edge/Serverless functions.

---

## 2. Scalability

### 2.1 Concurrent Sessions
* **Requirement**: The architecture must support up to **5,000 concurrent active typing sessions** without degradation of database performance or API request queues.
* **Implementation Guideline**: Minimize database calls during active typing. Write progress data in single batch inserts upon chunk or lesson completion, rather than per keypress or sentence.

### 2.2 File Upload Limits
* **Requirement**: Support individual document uploads up to **10MB** for text, Markdown, PDF, and DOCX files.
* **Rationale**: Protect serverless processing memory allocations from overflow while supporting full-length novels.

---

## 3. Reliability & Data Integrity

### 3.1 Offline Resiliency
* **Requirement**: If the user experiences network disruption mid-lesson, the system must cache session progress locally in `LocalStorage` or `IndexedDB`.
* **Behavior**: Upon network recovery, the system must automatically synchronize cached progress with the database without user intervention.

### 3.2 Transactional Integrity
* **Requirement**: Ingestion processing must be transactional. If a document split fails during Phase 5 (e.g., chapter creation succeeds but lesson chunking fails), all changes must roll back to avoid corrupt database states.

---

## 4. Security & Privacy

### 4.1 Data Access Controls
* **Requirement**: Implement strict Row-Level Security (RLS) policies in PostgreSQL/Supabase.
* **Constraint**: No user should be able to view, modify, or delete another user's profile, library collections, documents, or typing session history.

### 4.2 Transport Layer Security
* **Requirement**: Enforce HTTPS for all external connections. Ensure WebSocket connections (used for real-time progress synching) utilize WSS protocols.

### 4.3 GDPR and Privacy Compliance
* **Requirement**: Provide a direct user utility in settings to download all personal metrics (JSON format) or delete their user account and associated libraries permanently.

---

## 5. Accessibility (a11y)

### 5.1 Color Contrast
* **Requirement**: Standard user interface panels must maintain WCAG 2.1 AA compliant color contrast ratios ($\ge 4.5:1$).
* **Typing Visuals**: Ensure theme selections provide adequate contrast for highlighted correct/incorrect character overlays without causing eye strain.

### 5.2 Keyboard Navigation
* **Requirement**: The entire platform must be navigable using keyboard-only shortcuts.
* **Shortcuts**:
  * `Tab` to restart a lesson.
  * `Esc` to pause and open the in-lesson menu.
  * Enter / Space to navigate modal prompts.
  * Screen focus must automatically return to the typing input container upon dismissing panels.

---

## 6. Usability & UX Design Standards
* **Distraction-Free Practice**: Provide a minimal interface style where unnecessary controls fade out once the user begins typing (Zen Mode).
* **Responsive Visual Refreshes**: Ensure animations (like cursor blinking and level-up sliders) use CSS hardware-accelerated transitions to avoid layout recalculations.
* **Typographical Legibility**: Use monospace fonts optimized specifically for reading at high speeds (e.g., JetBrains Mono, Fira Code).

---

## 7. Maintainability & Code Quality

### 7.1 Agent Isolation
* **Requirement**: Strict division of responsibilities according to `AGENTS.md`. 
* **Rule**: UI files must never implement clean/split text logic directly. Content engines must remain pure JS/TS modules with no React or Zustand rendering hooks.

### 7.2 Automated Test Coverage
* **Requirement**: Maintain at least **85% unit test coverage** on core engine modules:
  * `contentEngine.js` (cleaning and chunk validation)
  * `typingEngine.js` (WPM, accuracy calculations)
  * `difficulty.js` (scaling and scoring)
  * `useTypingStore.js` (state machine transitions)
