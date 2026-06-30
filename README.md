# InsightFlow – AI-Powered Data Analytics Assistant(WIP)

**InsightFlow** is a SaaS platform that automates the most time-consuming stages of the data analytics workflow. It helps data analysts, Power BI developers, students, and business users transform raw datasets into actionable insights by providing intelligent recommendations for data cleaning, data modeling, DAX measures, visualizations, and dashboard design.

## Documentation

All technical and conceptual documentation for InsightFlow is structured according to the **Diátaxis framework** and is located in the `doc/` directory.

**[Go to InsightFlow Documentation](./doc/README.md)**

The documentation is organized into four main sections:

- **[Tutorials](./doc/tutorials/)**: Step-by-step guides to get started with the platform.
- **[How-To Guides](./doc/how-to/)**: Practical guides for accomplishing specific tasks (e.g., Generating DAX measures).
- **[Reference](./doc/reference/)**: Technical specifications and lists (e.g., Technology Stack).
- **[Explanation](./doc/explanation/)**: Deep dives into the system architecture and core features.

## Core Features

- **Data Profiling**: Comprehensive summary and analysis of uploaded datasets.
- **Data Cleaning Assistant**: AI-driven suggestions for handling missing values, duplicates, and standardizing formats.
- **Data Modeling Assistant**: Automatic relationship detection and schema recommendations (Star/Snowflake).
- **DAX Measure Generator**: Intelligent suggestions for business metrics and time-intelligence DAX formulas.
- **Visualization & Dashboard Builder**: Recommends charts and generates full dashboard blueprints based on data types.
- **AI Analytics Assistant**: A natural language chat interface to ask questions about your data and analytics workflow.

## Technology Stack

InsightFlow is built with a modern technology stack:

- **Frontend**: Vite, React.js, TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **Backend**: Python, Django, Django REST Framework, Pandas, NumPy
- **Database**: PostgreSQL
- **AI Layer**: LM Studio (Local LLMs) & Rule-Based Analytics Engine

## Installation & Running Locally

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **PostgreSQL** running locally
- **LM Studio** installed with a recommended model (e.g., Qwen 2.5 Coder)

### 1. Clone the Repository
```bash
git clone https://github.com/arththakkar1/insight-flow-web-app.git
cd insight-flow-web-app
```

### 2. Backend Setup
Navigate to the backend directory, set up your virtual environment, and install dependencies:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```
Configure your `.env` file with database credentials, apply migrations, and start the server:
```bash
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, install dependencies, and start the Vite development server:
```bash
cd frontend
npm install
npm run dev
```

### 4. AI Engine Setup
1. Open **LM Studio**.
2. Load a suitable model (e.g., Qwen 2.5 Coder).
3. Start the Local Inference Server on Port `1234`.

---

_InsightFlow aims to become the "Copilot for Data Analytics," empowering users to focus on generating insights rather than spending hours on repetitive technical tasks._
