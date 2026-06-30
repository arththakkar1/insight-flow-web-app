# InsightFlow – AI-Powered Data Analytics Assistant

*For detailed documentation, please refer to the **[InsightFlow Documentation](./doc/README.md)**.*

**InsightFlow** is a SaaS platform that automates the most time-consuming stages of the data analytics workflow. It helps data analysts, Power BI developers, students, and business users transform raw datasets into actionable insights by providing intelligent recommendations for data cleaning, data modeling, DAX measures, visualizations, and dashboard design.

Traditionally, analysts spend significant time understanding datasets, identifying data quality issues, creating relationships between tables, writing DAX calculations, and deciding which charts best represent the data. InsightFlow streamlines this entire process through AI-powered analysis and automation.

When a user uploads one or more datasets (CSV, Excel, or database exports), InsightFlow performs a comprehensive **Data Profiling** process. It examines column types, missing values, duplicate records, unique values, outliers, date fields, categorical variables, and numerical measures. The platform then generates a detailed report describing the overall quality and structure of the data.

Based on this analysis, InsightFlow provides **Data Cleaning Recommendations**, such as handling missing values, removing duplicates, correcting data types, standardizing formats, detecting outliers, and identifying inconsistent records. These recommendations help users prepare clean and reliable datasets before analysis.

The platform then analyzes relationships between datasets and generates **Data Modeling Suggestions**. It automatically identifies potential primary keys, foreign keys, fact tables, and dimension tables while recommending optimal schema structures such as Star Schema or Snowflake Schema. This enables users to create efficient and scalable Power BI data models with minimal manual effort.

InsightFlow also includes an intelligent **DAX Recommendation Engine**. By examining the available metrics and dimensions, it suggests relevant DAX measures along with complete formulas and explanations. Examples include Total Sales, Total Profit, Profit Margin, Average Order Value, Year-to-Date Sales, Month-over-Month Growth, Customer Count, and many other business metrics commonly used in dashboards.

To simplify dashboard creation, InsightFlow features a **Visualization Recommendation System** that suggests the most suitable charts based on the dataset and business objectives. Time-based data may generate line charts, category comparisons may generate bar charts, geographic data may generate maps, and KPI metrics may generate cards and scorecards. Each recommendation includes the required fields and a brief explanation of why the visualization is effective.

The platform further generates a **Dashboard Blueprint**, providing a complete dashboard structure with recommended pages, KPIs, visualizations, filters, slicers, and drill-down capabilities. This blueprint serves as a guide for building professional Power BI dashboards faster and more efficiently.

Additionally, InsightFlow includes an **AI Analytics Assistant** that allows users to ask questions about their data in natural language. The assistant explains data quality issues, recommends analytical approaches, describes DAX calculations, and helps users understand how to derive meaningful insights from their datasets.

---

## Core Features

### Data Profiling

* Dataset summary
* Column analysis
* Data type detection
* Missing value detection
* Duplicate detection
* Outlier analysis

### Data Cleaning Assistant

* Missing value recommendations
* Duplicate removal suggestions
* Data type correction
* Data quality scoring
* Data standardization guidance

### Data Modeling Assistant

* Relationship detection
* Fact and dimension identification
* Primary and foreign key suggestions
* Star Schema recommendations
* Snowflake Schema recommendations

### DAX Measure Generator

* KPI generation
* Business metric suggestions
* Time intelligence measures
* Profitability calculations
* Growth analysis measures

### Visualization Recommendation Engine

* KPI Cards
* Line Charts
* Bar Charts
* Pie/Donut Charts
* Scatter Plots
* Maps
* Matrices
* Dashboard layout suggestions

### Dashboard Blueprint Generator

* Executive Dashboard recommendations
* Sales Dashboard recommendations
* Customer Dashboard recommendations
* Financial Dashboard recommendations
* Interactive dashboard planning

### AI Analytics Assistant

* Dataset explanation
* Analytics guidance
* DAX explanations
* Dashboard recommendations
* Insight generation assistance

---

## Target Users

* Data Analysts
* Power BI Developers
* Business Intelligence Professionals
* Data Science Students
* Business Managers
* Consultants
* Freelancers
* Organizations building analytical dashboards

---

## Technology Stack

### Frontend

* React.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* Recharts

### Backend

* Python
* Django
* Django REST Framework
* Pandas
* NumPy

### Database

* PostgreSQL

### AI Layer

* OpenAI API or Local LLM
* Rule-Based Analytics Engine

---

## Project Vision

**InsightFlow aims to become the "Copilot for Data Analytics" by automating data preparation, modeling, metric generation, and dashboard planning. The platform reduces manual effort, accelerates analytics workflows, and empowers users to focus on generating insights rather than spending hours on repetitive technical tasks.**
