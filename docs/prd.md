# Product Requirements Document (PRD) — TypeFlow

## 1. Product Vision
TypeFlow is a content-driven, dynamic typing learning platform. Traditional typing tutors restrict users to rigid, prefabricated lessons (e.g., repeating "asdf" or typing random, disconnected vocabulary). TypeFlow transforms typing practice into a medium for learning and knowledge ingestion. By enabling users to upload their own books, articles, code snippets, and study notes, they can train their muscle memory while reading, reviewing, and absorbing information they are already motivated to learn.

---

## 2. Product Goals
* **Knowledge-Driven Practice**: Connect motor skill development with cognitive learning.
* **Frictionless Ingestion**: Instantly turn messy raw text, Markdown, PDF, and DOCX documents into clean, readable typing exercises.
* **Monkeytype-Grade Engine**: Provide a modern, responsive, zero-latency typing engine with beautiful aesthetics and smooth character caret animations.
* **TypingClub-Grade Progression**: Break documents into logical chapters and chunks, providing clear milestones and progression limits (e.g., retry chunks if performance criteria are not met).
* **Deep Analytics**: Map typing stats (WPM, accuracy, error hotspots) over time and display visual feedback (e.g., keyboard heatmaps) to target weak keys.
* **AI-Assisted Personalization**: Introduce adaptive difficulty adjustments, in-app vocabulary generation, summaries, and explanations to enrich the reading and typing experience.

---

## 3. Target Audience
* **Students**: Practice typing while studying notes, textbook chapters, or literature.
* **Software Developers**: Build muscle memory for programming language syntax, brackets, operators, and naming conventions by uploading source code files.
* **Writers & Bloggers**: Practice typing drafts, classic novels, or essays to build creative flow, vocabulary, and rhythm.
* **Professionals & Researchers**: Upload academic papers, legal documents, or industry reports to absorb content during typing training.
* **Language Learners**: Ingest texts written in foreign languages to master spelling, punctuation layouts, and sentence structure.

---

## 4. Success Metrics (KPIs)

### Engagement Metrics
* **Daily Active Users (DAU) & Monthly Active Users (MAU)**: Growth in user volume.
* **Session Length**: Target average of 15–20 minutes per training session.
* **Documents Uploaded**: Number of files processed per user per month.
* **Total Words Typed**: Aggregate platform throughput indicating active system usage.

### Learning & Performance Metrics
* **WPM Improvement**: Average increase of 15% in user typing speed over 30 days of active use.
* **Accuracy Consistency**: Growth in average typing accuracy target (aiming for $\ge 96\%$).
* **Chunk Completion Rate**: Percentage of started chapters or documents that users finish typing.

### Technical Performance Metrics
* **Typing Caret Latency**: Input validation and rendering response times must remain under 16ms (60 FPS refresh standard) to feel instantaneous.
* **Text Processing Pipeline Duration**: Processing a 100,000-character document from upload to generated lessons must take less than 3.0 seconds.
* **System Uptime**: 99.9% uptime on backend database services and static page hosting.

---

## 5. Out-of-Scope Features (Post-MVP and Phased Roadmap)
To maintain project discipline, the following features are explicitly out of scope for the core 12 phases:
* **Multiplayer Duels**: Real-time racing against other users (e.g., TypeRacer style) is reserved for post-MVP.
* **Mobile-Optimized Typing Practice**: Practicing typing on virtual mobile keyboards is excluded. Mobile layout support will focus exclusively on reading text, editing libraries, viewing analytics, and managing settings.
* **Collaborative Writing / Text Editor**: TypeFlow will not act as a full-featured writing environment. Text remains read-only once ingested into the lesson processor.
* **Social Feed & Community Forums**: General community features will not be built during the core development phase. Focus remains strictly on individual user progression and gamified leaderboards.

---

## 6. Risks and Assumptions

### Assumptions
1. **Physical Keyboards**: Users have access to physical keyboards (QWERTY, Dvorak, Colemak, etc.) to practice typing effectively.
2. **Text Normalization Feasibility**: Text documents can be parsed programmatically into standard UTF-8 text strings without critical loss of context or structure.
3. **Continuous Local State (MVP)**: For the MVP, users are comfortable practicing on a single device, storing progress in `LocalStorage` without account synchronization.

### Key Risks & Mitigation Strategies

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Parsing Errors in Complex PDFs/DOCX** | High | Implement a fallback raw text cleaner that strips layout elements (headers, footers, page numbers) and provides a "Preview & Edit" box before the document is generated into lessons. |
| **Next.js Edge Function Timeouts on Large Files** | Medium | Use client-side web workers or split large documents into smaller background tasks before database saving. Limit initial document size to 10MB. |
| **Typing Latency and Lag** | Critical | Keep the `Typing Engine Agent` free of heavy state computations. Do not execute database updates or complex statistics recalculations on keydown events; defer them to chunk completion. |
| **Data Loss in LocalStorage (MVP Phase)** | Medium | Provide an "Export Progress" JSON utility and actively display warning banners before browser cache clearing. Move to Supabase database sync in Phase 2. |
| **Flat Chunk Difficulty Scoring** | Low | Enhance the `Difficulty Engine Agent` to account for vocabulary frequency (Zipf's law) alongside punctuation density and length. |
