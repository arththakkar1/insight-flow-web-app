[⬅️ Back to Documentation Home](../../README.md)

# API Endpoints Specification

This reference guide details the endpoints, request parameters, and response structures for the InsightFlow REST API. All requests/responses communicate using the `application/json` content type unless uploading multipart form-data.

---

## 1. Authentication Endpoints

### Register User
*   **Endpoint:** `POST /api/auth/register/`
*   **Payload:**
    ```json
    {
      "username": "johndoe",
      "email": "john@example.com",
      "password": "SecurePassword123"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "token": "jwt_token_string",
      "user": {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com"
      }
    }
    ```

### Login User
*   **Endpoint:** `POST /api/auth/login/`
*   **Payload:**
    ```json
    {
      "username": "johndoe",
      "password": "SecurePassword123"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "token": "jwt_token_string",
      "user": {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com"
      }
    }
    ```

---

## 2. Dataset Endpoints

### Upload Dataset
*   **Endpoint:** `POST /api/datasets/`
*   **Content-Type:** `multipart/form-data`
*   **Payload:**
    *   `file`: (CSV, XLSX, or XLS file)
*   **Response (201 Created):**
    ```json
    {
      "id": "ds_98765",
      "name": "sales_data_2023.csv",
      "rows_count": 14500,
      "columns_count": 8,
      "status": "uploaded",
      "uploaded_at": "2026-06-18T23:00:00Z"
    }
    ```

### Get Dataset List
*   **Endpoint:** `GET /api/datasets/`
*   **Response (200 OK):**
    ```json
    [
      {
        "id": "ds_98765",
        "name": "sales_data_2023.csv",
        "rows_count": 14500,
        "status": "cleaned",
        "uploaded_at": "2026-06-18T23:00:00Z"
      }
    ]
    ```

### Trigger Data Profiling
*   **Endpoint:** `POST /api/datasets/<dataset_id>/profile/`
*   **Response (200 OK):**
    ```json
    {
      "dataset_id": "ds_98765",
      "total_rows": 14500,
      "total_columns": 8,
      "missing_values": 243,
      "duplicate_rows": 12,
      "columns": [
        {
          "name": "CustomerID",
          "type": "integer",
          "unique_values": 4500,
          "missing_count": 0
        },
        {
          "name": "Age",
          "type": "float",
          "unique_values": 80,
          "missing_count": 45
        }
      ]
    }
    ```

### Get AI Cleaning Recommendations
*   **Endpoint:** `GET /api/datasets/<dataset_id>/cleaning/`
*   **Response (200 OK):**
    ```json
    {
      "dataset_id": "ds_98765",
      "data_quality_score": 85,
      "recommendations": [
        {
          "id": "clean_age_median",
          "column": "Age",
          "issue": "45 missing values",
          "recommendation": "Fill missing values with median age (34)",
          "action_type": "fill_median"
        },
        {
          "id": "clean_drop_duplicates",
          "column": "all",
          "issue": "12 duplicate rows found",
          "recommendation": "Remove duplicate entries",
          "action_type": "drop_duplicates"
        }
      ]
    }
    ```

### Apply Cleaning Recommendation
*   **Endpoint:** `POST /api/datasets/<dataset_id>/cleaning/apply/`
*   **Payload:**
    ```json
    {
      "recommendation_id": "clean_age_median"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "dataset_id": "ds_98765",
      "message": "Filled missing values in 'Age' with median (34)."
    }
    ```

---

## 3. Analytics & Modeling Endpoints

### Get Data Modeling Suggestions
*   **Endpoint:** `POST /api/datasets/model-suggestions/`
*   **Payload:**
    ```json
    {
      "dataset_ids": ["ds_98765", "ds_43210"]
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "recommended_schema": "Star Schema",
      "fact_tables": ["ds_98765"],
      "dimension_tables": ["ds_43210"],
      "relationships": [
        {
          "from_table": "ds_98765",
          "from_column": "CustomerID",
          "to_table": "ds_43210",
          "to_column": "ID",
          "cardinality": "many_to_one"
        }
      ]
    }
    ```

### Generate DAX Measure
*   **Endpoint:** `POST /api/analytics/dax-generator/`
*   **Payload:**
    ```json
    {
      "dataset_id": "ds_98765",
      "target_metric": "Sales",
      "aggregation": "sum",
      "time_intelligence": "YTD"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "measure_name": "Sales YTD",
      "formula": "Sales YTD = TOTALYTD(SUM('Sales_Data_2023'[Sales]), 'Sales_Data_2023'[Date])",
      "explanation": "Calculates the cumulative sum of sales from the start of the current calendar year up to the current date."
    }
    ```

---

## 4. AI Analytics Assistant Endpoints

### Start / Send Assistant Message
*   **Endpoint:** `POST /api/chat/messages/`
*   **Payload:**
    ```json
    {
      "chat_id": "chat_555",
      "message": "How do I calculate Year-over-Year profit margin growth?"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "chat_id": "chat_555",
      "reply": "To calculate Year-over-Year profit margin growth, you should first calculate the Profit Margin for the current period and the prior year period. Here is the DAX formula:\n\n`Profit Margin YoY Growth = [Profit Margin] - [Profit Margin LY]`\n\nWhere LY uses `SAMEPERIODLASTYEAR`.",
      "timestamp": "2026-06-18T23:05:00Z"
    }
    ```
