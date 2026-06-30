[⬅️ Back to Documentation Home](../../README.md)

# Technology Stack

InsightFlow is built on a modern, scalable architecture designed for data processing and AI integration.

## Frontend
The user interface is built for performance and a premium user experience.
- **Vite**: Next-generation frontend tooling for fast build times.
- **React.js**: Core UI library.
- **TypeScript**: For type-safe frontend development.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **shadcn/ui**: Accessible and customizable component system.
- **Recharts**: For rendering data visualizations within the app.

## Backend
The backend is optimized for data manipulation and API serving.
- **Python**: Primary backend language.
- **Django & Django REST Framework**: Robust framework for building scalable APIs.
- **Pandas**: Core library for data manipulation and profiling.
- **NumPy**: Used for numerical computations.

## Database
- **PostgreSQL**: Relational database for storing user data, metadata, and application state.

## AI Layer
- **LM Studio**: Used for running Local Large Language Models (LLMs) locally, powering the natural language AI Analytics Assistant and complex reasoning tasks while maintaining data privacy.
- **Rule-Based Analytics Engine**: For deterministic data profiling, modeling recommendations, and baseline metrics.

### Recommended Models for LM Studio
Since the application heavily involves data analysis, code generation, and DAX generation, the following models are recommended to be loaded into LM Studio:
- **Llama 3 (8B/70B Instruct)**: Excellent general-purpose reasoning and instruction following.
- **DeepSeek Coder V2 / DeepSeek LLM**: Highly optimized for code generation, data manipulation, DAX, and SQL.
- **Mistral Instruct / Mixtral**: Great balance of performance and resource efficiency for analytical reasoning.
- **Qwen 2.5 Coder**: Strong performance in technical and structured data tasks.
