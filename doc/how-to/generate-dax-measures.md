[⬅ Back to Documentation Home](../../README.md)

# How to Generate DAX Measures

Writing DAX manually can be time-consuming. InsightFlow's DAX Measure Generator automates this process based on the context of your data model.

## Prerequisites

- You must have uploaded a dataset with numerical metrics and dimensions.
- (Optional) A completed data modeling step if using multiple tables.

## Steps to Generate DAX

1. **Navigate to the DAX Generator**
   From your project dashboard, click on the "DAX Recommendations" tab.

2. **Select Target Metrics**
   InsightFlow will automatically suggest standard business metrics (e.g., Total Sales, Average Order Value). You can also manually select specific numerical columns you want to aggregate.

3. **Choose Time Intelligence Options**
   If InsightFlow detects a date field, it will offer Time Intelligence measures. Toggle options like "Year-to-Date" or "Month-over-Month Growth" to have these DAX formulas generated automatically.

4. **Review and Copy**
   InsightFlow will display the full DAX formula along with a natural language explanation of what the measure calculates. Simply copy the formula into your Power BI model.

> [!TIP]
> If you need a specific DAX calculation not listed, you can ask the **AI Analytics Assistant** in plain English (e.g., "Write a DAX measure to calculate total sales only for active customers").
