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

InsightFlow uses a client-side router (like `react-router-dom`) with nested routes to represent the logical flow of the analytics process. The application is divided into several key routes:

### 1. Public Routes
- **`/` (Landing Page)**
  - **Contents**: Product vision, feature overview, and call-to-action buttons for Login/Signup.
- **`/login` & `/signup`**
  - **Contents**: Authentication forms for user access.

### 2. Main Application Routes (Protected)
- **`/dashboard`**
  - **Contents**: The user's main hub. Displays a list of recent projects, datasets, and a button to "Start New Analysis."

### 3. Project Workspace Routes
These routes are nested under a specific project ID (`/projects/:projectId`) to maintain context.

- **`/projects/:projectId/data` (Data Ingestion)**
  - **Contents**: File upload zone (CSV/Excel) or database connection forms. Shows a preview table of the uploaded raw data.
  
- **`/projects/:projectId/profiling` (Data Profiling & Cleaning)**
  - **Contents**: Displays the profiling report (missing values, data types). Contains interactive panels to apply the AI's cleaning recommendations.

- **`/projects/:projectId/modeling` (Data Modeling)**
  - **Contents**: A visual canvas or structured list showing detected tables, proposed Primary/Foreign keys, and the suggested Star/Snowflake schema.

- **`/projects/:projectId/dax` (DAX Generator)**
  - **Contents**: A dual-pane interface where the user selects metrics on one side, and the AI presents the generated DAX formulas and explanations on the other.

- **`/projects/:projectId/visualizations` (Dashboard Blueprint)**
  - **Contents**: A grid layout recommending specific charts (rendered via Recharts) based on the dataset, effectively serving as a blueprint for Power BI.

### 4. Global UI Elements
- **AI Analytics Assistant Widget**
  - **Contents**: A persistent chat interface (e.g., a floating side panel) available across all `/projects/*` routes, powered by LM Studio, allowing users to ask natural language questions about their data at any step.
