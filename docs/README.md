# TypeFlow Documentation

Welcome to the TypeFlow system documentation. TypeFlow is a content-driven, dynamic typing learning platform designed to help users improve their typing speed, accuracy, and muscle memory by practicing on content they actually care about (e.g., books, articles, code files, and custom notes).

This documentation outlines the functional requirements, architectural principles, user personas, stories, and non-functional goals of the platform as it transitions from a local-only MVP into a fully-fledged SaaS application.

## Documentation Index

Explore the specifications by category:

1. **[Product Requirements Document (PRD)](prd.md)**
   * Outlines the product vision, core goals, target audience, success metrics, and key risks & assumptions.
2. **[Functional Requirements](functional_requirements.md)**
   * Describes the platform features phase-by-phase (Phases 1–12) and maps them to TypeFlow's strict **Agent Architecture**.
3. **[Non-Functional Requirements](non_functional_requirements.md)**
   * Establishes the technical constraints, performance standards, accessibility guidelines, security, and scalability metrics.
4. **[User Personas](user_personas.md)**
   * Profiles the key user archetypes (Developers, Students, Authors, Language Learners) driving product decisions.
5. **[User Stories & Acceptance Criteria](user_stories.md)**
   * Details the developer-ready user stories categorized by phase, ensuring testable criteria for release.

---

## Architectural Philosophy

All code in TypeFlow follows the strict **Agent-Based Architecture** defined in [AGENTS.md](../AGENTS.md). The application flow is unidirectional and prevents tight coupling between components:

```mermaid
graph LR
    Upload[Upload System] --> ContentEngine[Content Engineer Agent]
    ContentEngine --> DifficultyEngine[Difficulty Engine Agent]
    DifficultyEngine --> LessonEngine[Lesson Engine Agent]
    LessonEngine --> TypingEngine[Typing Engine Agent]
    TypingEngine --> ProgressTracker[Progress Tracker Agent]
    ProgressTracker --> UI[UI Agent]
    UI -.-> StateManagement[State Management Agent]
```

By decoupling typing validation, text chunking, progress tracking, and UI rendering, TypeFlow ensures that each engine can be built, updated, and unit-tested in isolation without creating regression cascades.
