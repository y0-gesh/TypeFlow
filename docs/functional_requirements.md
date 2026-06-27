# Functional Requirements — TypeFlow

This document outlines the functional requirements of the TypeFlow platform, structured across the 12 development phases defined in [plan.md](../plan.md).

---

## 1. System Architecture & Agent Alignment

TypeFlow operates on a strict modular agent architecture defined in [AGENTS.md](../AGENTS.md). The table below lists the core agents, their primary functions, and how they map to the technical implementation.

| Agent | Responsibility | Core Functions | Phase Mapping |
| :--- | :--- | :--- | :--- |
| **Content Engineer** | Text extraction, cleaning, normalisation, sentence splitting, and chunking. | `cleanText(text)`<br>`splitSentences(text)`<br>`createChunks(sentences)` | Phase 4, Phase 5 |
| **Difficulty Engine** | Assigns complexity rating (1 to 5) to lessons. | `getDifficulty(text)` | Phase 5 |
| **Typing Engine** | Real-time keystroke tracking, caret position, and typing metrics. | `compareInput(expected, actual)`<br>`calculateWPM(chars, time)`<br>`calculateAccuracy(correct, total)` | Phase 6 |
| **Lesson Engine** | Lesson flow control, gating progression, retry logic. | `evaluateLesson(performance)` | Phase 7 |
| **Progress Tracker** | Database write operations, progress persistence (local and cloud). | `saveSession(data)`<br>`retrieveProgress()` | Phase 2, Phase 7, Phase 8 |
| **UI Agent** | Interactive front-end views, typing boxes, dashboards, analytics charts. | React components (e.g., `TypingBox`, `ProgressBar`) | Phase 1, Phase 8, Phase 9, Phase 10 |
| **State Management** | Centralised Zustand store linking UI events to underlying engines. | Zustand state slices & actions | Phase 1, Phase 6 |

---

## 2. Requirements by Phase

### Phase 1: Foundation (Infrastructure & Shell)
* **1.1 Web App Shell**: Initialise Next.js application with TypeScript, Tailwind CSS, and shadcn/ui.
* **1.2 Multi-Theme Setup**: Provide global dark and light mode stylesheets using CSS variables.
* **1.3 Supabase Authentication Integration**:
  * Users must be able to sign up, sign in, and reset passwords via Supabase Auth.
  * Standard OAuth integration (e.g., Google, GitHub) should be configured.
* **1.4 Landing Page**: A visually compelling hero section outlining the product vision, features, and a "Try Demo" call to action.
* **1.5 Dashboard Shell**: Create a sidebar-based dashboard layout with placeholders for Library, Analytics, Settings, and Profile.

### Phase 2: Database Schema & Row-Level Security
* **2.1 Database Provisioning**: Define and build the PostgreSQL database schema in Supabase with the following entities:
  * `profiles`: User account metadata (username, avatar, streak counts).
  * `libraries`: Folders grouping documents (user-defined or default).
  * `documents`: Core files containing text contents (linked to libraries).
  * `chapters`: Structural splits of a document (e.g., parts, chapters).
  * `lessons`: Generated typing chunks (80–200 characters) with a foreign key to `chapters`.
  * `lesson_progress`: Track user attempts, completion status, and scores per lesson.
  * `typing_sessions`: Keystroke details, speed, accuracy, and date of every practice run.
  * `statistics`: Consolidated user-level performance over time (WPM, accuracy, active days).
  * `achievements`: List of earned user milestones.
  * `bookmarks`: References to favorite lessons or documents.
* **2.2 Row-Level Security (RLS)**: Enforce RLS on all tables, ensuring users can only read/write their own records.
* **2.3 Migration Control**: Manage all database changes through SQL migration files.

### Phase 3: Library Management
* **3.1 CRUD Libraries**: Users can create, rename, and delete custom library collections (e.g., "University", "Novels", "JavaScript Code").
* **3.2 Library Dashboard View**: Group documents by library folder with cover icons, document counts, and progress bars.
* **3.3 Library Search**: Enable real-time client-side search filtering libraries by name or tags.
* **3.4 Favorite Libraries**: Pin specific libraries to the top of the dashboard for quick access.

### Phase 4: Document Ingestion & Management
* **4.1 Document Ingestion Formats**: Implement file upload forms supporting:
  * Raw text (`.txt`)
  * Markdown (`.md`)
  * Adobe PDF (`.pdf`)
  * Microsoft Word (`.docx`)
  * Paste Raw Text area.
* **4.2 Processing Status Indicator**: Provide live visual feedback on the state of processing:
  * `Uploaded` $\rightarrow$ `Queued` $\rightarrow$ `Processing` $\rightarrow$ `Completed` (or `Failed`).
* **4.3 Document Storage**: Save uploaded documents into Supabase Storage buckets, linking file URIs to document tables.

### Phase 5: Document Processor Pipeline
* **5.1 Text Clean & Normalize (Content Engineer Agent)**:
  * Remove redundant whitespace, line breaks, carriage returns (`\r`), and unsupported unicode characters.
  * Standardize apostrophes, quotation marks, and spacing.
* **5.2 Structural Segmenter**:
  * Identify manual chapter headers (`Chapter 1`, `# Header`) or split text into roughly equal chapters if structural indicators are missing.
  * Split paragraphs based on double line breaks.
  * Extract sentences using sentence boundary detection regex.
* **5.3 Readability Chunking**:
  * Assemble sentences into sequential lessons ranging between 80 to 200 characters.
  * Keep sentences intact where possible; do not truncate middle words.
* **5.4 Difficulty Scoring (Difficulty Engine Agent)**:
  * Run the `getDifficulty` function on each lesson chunk based on text length, capitalization, and punctuation density.
  * Assign a scale score from 1 (very easy) to 5 (difficult).
* **5.5 Save Pipeline Output**: Write the generated chapters and lessons back to the database in transactional blocks.

### Phase 6: Core Typing Engine
* **6.1 Caret Navigation**: Implement a blinking, smooth caret highlighting the active character.
* **6.2 Input Character Highlighting**:
  * Typewriter-style display of expected text.
  * Highlight correctly typed characters (e.g., muted green), incorrect characters (e.g., bright red with underline), and uncompleted characters (e.g., grey).
  * Allow backspacing of incorrect characters, but restrict backspacing past the current sentence or chunk boundary.
* **6.3 Real-Time Metric Evaluators**:
  * Calculate live WPM: $\text{WPM} = \frac{\text{Correct Characters} / 5}{\text{Time in Minutes}}$.
  * Calculate accuracy: $\text{Accuracy} = \left(\frac{\text{Correct Keys Typed}}{\text{Total Keys Pressed}}\right) \times 100$.
* **6.4 Session Controls**:
  * Support Restart (hotkey `Tab`), Pause (when focus is lost), and Resume (on keypress).
  * Sound effects: Keyboard click sound (optional toggle) and error buzz.
  * Focus Mode: Hide dashboard panels and metrics while typing to minimize distractions.

### Phase 7: Progression & Learning Flow
* **7.1 Chunk Progression Gate (Lesson Engine Agent)**:
  * Evaluate typing metrics on chunk completion.
  * If $\text{Accuracy} \ge 90\%$, unlock the next chunk and update state.
  * If $\text{Accuracy} < 90\%$, display a "Retry Chunk" dialog.
* **7.2 Resume Lesson**: Automatically bookmark the last successfully completed lesson index in the document, allowing users to return and start exactly where they left off.
* **7.3 Metric Records (Progress Tracker Agent)**:
  * Record attempts count, completion times, accuracy, and WPM for each session in the `lesson_progress` and `typing_sessions` tables.

### Phase 8: User Dashboard
* **8.1 Widget - Continue Learning**: Highlight the most recently accessed document with a large "Play" button showing completion progress.
* **8.2 Widget - Daily Goal**: Show user's progress toward their daily typing time target (e.g., 15 minutes).
* **8.3 Widget - Weekly Calendar Streak**: Display a visual grid (Github heatmap style) of typing activity over the past 7 days, maintaining a consecutive day count.
* **8.4 Widget - General Statistics**: Displays high-level stats: Lifetime Average WPM, Peak WPM, Average Accuracy, and Total Time Spent Typing.

### Phase 9: Analytics & Keyboard Heatmap
* **9.1 Daily Performance Charts**: Interactive line charts showing WPM and accuracy trends over selected periods (last 7 days, 30 days, 12 months).
* **9.2 Character Analytics**: Track specific keys with high error rates.
* **9.3 Keyboard Heatmap**: A visual representation of a keyboard layout where keys change color based on typing speed (green = fast, red = slow/error-prone).

### Phase 10: Personalization & Customization
* **10.1 Typing Space Personalization**:
  * Themes: Monokai, Dracula, Gruvbox, Nord, Minimal, High Contrast.
  * Typography: Customize font styles (Roboto Mono, JetBrains Mono, Inter) and font sizes (14px, 16px, 20px, 24px).
  * Caret Style: Block, Line, Underline, or Hidden.
* **10.2 Keyboard Layout Adjustments**: Allow users to configure virtual keyboard layouts (QWERTY, Dvorak, Colemak, AZERTY) to align keycap maps with physical typing styles.
* **10.3 Zen Mode**: Disable visual guides, metrics, timers, and visual keyboards entirely, showing only the text and cursor.

### Phase 11: Gamification & Engagement
* **11.1 XP & Level System**: Award Experience Points (XP) based on characters typed, with bonus points for high accuracy ($\ge 98\%$) and speed milestones.
* **11.2 Achievements & Badges**: Trigger rewards for milestones: "First 10,000 Words", "Streak Master (30 Days)", "Perfect 100% Accuracy Lesson", "Century Club (100 WPM)".
* **11.3 Challenges**: Provide daily or weekly quests (e.g., "Type 5 pages of a library novel", "Maintain $\ge 95\%$ accuracy for 3 lessons in a row").
* **11.4 Leaderboards**: Enable opt-in global and cohort-based competitive rankings (e.g., "This Week's Top Typer").

### Phase 12: AI-Assisted Features
* **12.1 AI Lesson Generator**: Prompt-to-lesson generation (e.g., "Create a lesson containing commonly confused programming syntax in TypeScript").
* **12.2 AI Summaries & Explanations**: Select a paragraph from the uploaded document to generate a quick summary or clear explanation in a sidebar.
* **12.3 AI Vocabulary Trainer**: Analyze user error patterns and generate custom vocabulary lessons focusing on words or characters where the user struggles.
* **12.4 Adaptive Lesson Adjustment**: Dynamically alter chunk sizes or punctuation density depending on real-time typing speed and accuracy.
