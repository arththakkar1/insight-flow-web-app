# Frontend Architecture

The InsightFlow frontend is built as a Single Page Application (SPA) using **Vite**, **React.js**, and **TypeScript**. It is designed with a strict separation of concerns to ensure scalability, maintainability, and a highly responsive user experience.

## Separation of Concerns

The project structure is organized by feature and technical responsibility:

```text
src/
├── assets/          # Static files (images, fonts, global CSS)
├── components/      # Reusable UI components (buttons, modals, shadcn/ui elements)
├── pages/           # Page-level components that correspond directly to routes
├── hooks/           # Custom React hooks containing business logic (e.g., useDataProfile)
├── services/        # API communication layer (Axios instances, Django endpoints)
├── store/           # Global state management (e.g., Zustand or React Context for active datasets)
├── types/           # Global TypeScript interfaces and type definitions
└── utils/           # Helper functions, formatters, and pure logic utilities
```

This structure ensures that our **pages** only handle layout and routing, our **components** handle presentation, our **hooks** handle state, and our **services** handle data fetching.

## Routing Strategy

InsightFlow uses a client-side router (like `react-router-dom`) structured exactly as follows to provide a clean and intuitive user experience:

### 1. Public Routes
- **`/` (Landing Page)**: Product vision and call-to-actions.
- **`/login`**: User authentication and sign-in.
- **`/register`**: New user registration.

### 2. Core Application Routes (Protected)

- **`/chat` (AI Assistant Hub)**
  - **`/chat`**: Main chat interface to start a new natural language analysis with the AI Analytics Assistant.
  - **`/chat/:chatId`**: A specific, saved conversation history with the assistant.

- **`/datasets` (Data Management)**
  - **`/datasets`**: A list or grid of all datasets the user has uploaded, including basic metadata and profiling summaries.
  - **`/datasets/:datasetId`**: Detailed view of a specific dataset, showing data profiling, cleaning recommendations, and data modeling status.

- **`/reports` (Insights & Visualizations)**
  - **`/reports/:reportId`**: A detailed, specific report containing the visualization blueprint, generated DAX measures, and related analytical metrics for a dataset or query.

### 3. User & Settings Routes
- **`/settings`**: Application and user preferences (e.g., connected database configurations, theme toggles).
- **`/profile`**: User account details and personal information.
