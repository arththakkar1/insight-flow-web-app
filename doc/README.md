# InsightFlow Documentation

> [!NOTE]
> This directory is the single source of truth for all technical and conceptual documentation for the InsightFlow platform. It is organized according to the **Diátaxis documentation framework**, a principled approach that separates documentation by the distinct needs it serves.

## Table of Contents

1. [What is Diátaxis?](#1-what-is-diataxis)
2. [Directory Structure](#2-directory-structure)
3. [Folder Descriptions](#3-folder-descriptions)
   - [explanation/](#31-explanation)
   - [reference/](#32-reference)
   - [tutorials/](#33-tutorials)
   - [how-to/](#34-how-to)

---

## 1. What is Diátaxis?

Diátaxis is a systematic framework for structuring technical documentation. It identifies four distinct user needs and assigns each a dedicated documentation type:

| Mode | Answers the Question | Oriented Towards | Practical / Theoretical |
|---|---|---|---|
| **Explanation** | Why does this work this way? | Understanding | Theoretical |
| **Reference** | What is the exact specification of X? | Information lookup | Theoretical |
| **Tutorial** | How do I get started from zero? | Learning | Practical |
| **How-to Guide** | How do I accomplish a specific goal? | Problem-solving | Practical |

---

## 2. Directory Structure

- **[Explanation](./explanation/)** (Theoretical understanding - the "Why")
  - [Problem Statement](./explanation/problem-statement.md) - The bottlenecks in data analytics that InsightFlow solves
  - [System Overview](./explanation/system-overview.md) - High-level overview of the InsightFlow vision
  - [Core Features](./explanation/core-features.md) - Deep dive into the AI analytics engines
  - [User Workflows](./explanation/user-workflows.md) - End-to-end data processing workflows
  - [Frontend Architecture](./explanation/frontend-architecture.md) - Frontend routes and separation of concerns

- **[Reference](./reference/)** (Technical specifications - the "What")
  - [Technology Stack](./reference/technology-stack.md) - Details on frontend, backend, DB, and AI layers
  - [API Endpoints](./reference/api-endpoints.md) - Backend API endpoints
  - [Backend Architecture](./reference/backend-architecture.md) - Backend system design

- **[Tutorials](./tutorials/)** (Getting-started guides - the "How to begin")
  - [Getting Started](./tutorials/getting-started.md) - End-to-end walkthrough of uploading and analyzing data

- **[How-to Guides](./how-to/)** (Goal-oriented guides - the "How to do X")
  - [Generate DAX Measures](./how-to/generate-dax-measures.md) - Guide to using the DAX recommendation engine
  - [Build Machine Learning Models](./how-to/build-machine-learning-models.md) - Guide to training predictive models with the ML Builder

---

## 3. Folder Descriptions

### 3.1 `explanation/`
Documents focused on **building deep understanding** of the system, such as project vision and feature breakdowns.

### 3.2 `reference/`
Technical specifications and lists, like the architecture and technology stack details.

### 3.3 `tutorials/`
Step-by-step guides for learning how to use InsightFlow from scratch.

### 3.4 `how-to/`
Problem-oriented guides focused on accomplishing specific tasks, like generating a dashboard blueprint.
