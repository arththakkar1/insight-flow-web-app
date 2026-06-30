[Back to Documentation Home](../../README.md)

# How to Build Machine Learning Models

InsightFlow's **ML Builder** allows you to quickly train, evaluate, and utilize predictive machine learning models directly on your cleaned datasets without writing any code.

## Prerequisites

- You must have uploaded a dataset.
- It is highly recommended that you complete the **Data Cleaning** stage first to ensure the model trains on high-quality data (e.g., no missing values).

## Step-by-Step Guide

### 1. Access the ML Builder
Navigate to the **Datasets** view and select a specific dataset. From the dataset details page, click on the **ML Builder** tab to initialize the machine learning interface.

### 2. Select Your Target Variable
The platform will automatically parse the dataset's columns.
- **Target Variable:** Select the column you want the model to predict (e.g., `Churn`, `Sales_Revenue`, `House_Price`).
- **Features (Predictors):** By default, InsightFlow uses all other available columns as predictors. You can optionally exclude columns that aren't relevant (like `Customer_ID` or `Name`) to improve model accuracy.

### 3. Train the Model
Click the **Train Model** button. Behind the scenes, InsightFlow will:
- Determine whether to use a Regression model (if the target is continuous numerical data) or a Classification model (if the target is categorical data).
- Split the data into training and testing sets.
- Train the model using the built-in Scikit-learn engine.

### 4. Evaluate Performance
Once training is complete, an **Evaluation Report** will be generated.
- For **Classification**, review metrics like Accuracy, Precision, Recall, and F1-Score.
- For **Regression**, review metrics like Mean Absolute Error (MAE) and R-Squared ($R^2$).
InsightFlow's AI Analytics Assistant will also provide a natural language summary explaining whether the model is reliable.

### 5. Run Predictions
With a trained model, navigate to the **ML Models** tab.
Here you can input new data values into a form. Click **Predict** to receive a real-time prediction based on your custom model. You can also export the complete ML analysis report for sharing.

> [!TIP]
> If you're unsure which columns to use as predictors, you can ask the **AI Analytics Assistant** for feature selection advice based on your dataset's profile.
