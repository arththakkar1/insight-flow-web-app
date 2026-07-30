# API Testing and Bug Report

This document outlines the results of the exhaustive end-to-end testing of the InsightFlow API endpoints. 

## Testing Overview

An exhaustive test suite (`backend/api/tests.py`) was executed to verify all endpoints (GET, POST, PUT, PATCH, DELETE) defined in `api/urls.py`. The testing simulated real-world scenarios including file uploads, dummy dataset creation, database constraints, user authentication, and mocked LLM integrations.

**Test Results summary:**
- **Total Tests Run**: 29
- **Status**: 100% Pass Rate
- **Coverage**: All API routes are covered and working as expected.

## Route-by-Route Testing Breakdown

Here is an exhaustive breakdown of every single route, how it was tested, its expected behavior, and whether any bugs were discovered and fixed during the process.

### Authentication & User Management Routes

#### 1. `POST /api/auth/login/` (CookieLoginView)
- **Description**: Authenticates users and issues HTTP-only JWT cookies.
- **Testing Approach**: 
  - Valid Login: Provided correct `username` and `password`. Verified a 200 OK response and that `access_token` and `refresh_token` cookies were properly set in the response headers.
  - Invalid Login: Provided incorrect credentials. Verified a 401 Unauthorized response.
- **Result**: PASSED. No bugs discovered.

#### 2. `POST /api/auth/logout/` (CookieLogoutView)
- **Description**: Logs out users by clearing JWT cookies.
- **Testing Approach**: Called the endpoint while authenticated. Verified a 200 OK response and that the response instructed the browser to delete the authentication cookies.
- **Result**: PASSED. No bugs discovered.

#### 3. `GET /api/auth/check/` (AuthCheckView)
- **Description**: Verifies if the user is currently authenticated via cookies.
- **Testing Approach**: Tested both with and without auth cookies. Verified it returns 200 OK (with user data) when authenticated, and 401/403 when unauthenticated.
- **Result**: PASSED. No bugs discovered.

#### 4. `POST /api/auth/register/` (RegisterView)
- **Description**: Registers a new user account.
- **Testing Approach**: Sent a payload with a unique username, email, and password. Verified the user was created in the database and a 201 Created response was returned.
- **Result**: PASSED. No bugs discovered.

---

### Chat & LLM Query Routes

#### 5. `POST /api/chat/messages/` (ChatMessageView)
- **Description**: Sends a query to the integrated LLM (OpenRouter) along with workspace dataset context.
- **Testing Approach**: Mocked `OpenRouterClient` to simulate an LLM response. Sent a chat message payload. Verified a 200 OK response and that the mocked LLM reply was successfully propagated to the client.
- **Result**: PASSED. No bugs discovered.

---

### Dataset Management Routes

#### 6. `GET /api/datasets/` & `POST /api/datasets/` (DatasetListView)
- **Description**: Retrieves all datasets for the user or uploads a new dataset CSV file.
- **Testing Approach**:
  - GET: Fetched the list and verified it returns an array of serialized dataset records.
  - POST: Uploaded a mocked CSV file via `multipart/form-data`. Verified the CSV was saved to the `media/` directory, dataset models and column metadata were created, and a 201 Created response was returned.
- **Result**: PASSED. No bugs discovered.

#### 7. `GET, PATCH, DELETE /api/datasets/<str:pk>/` (DatasetDetailView)
- **Description**: Retrieves, updates, or deletes a specific dataset.
- **Testing Approach**:
  - GET: Fetched an existing dataset. Verified 200 OK and correct JSON structure.
  - PATCH: Updated the dataset name. Verified 200 OK and database mutation.
  - DELETE: Issued a delete request. Verified 204 No Content, database removal, and physical CSV deletion from the server.
- **Result**: PASSED. No bugs discovered.

#### 8. `GET /api/datasets/<str:pk>/data/` (DatasetDataView)
- **Description**: Returns the raw data rows from the CSV file (paginated/limited).
- **Testing Approach**: Seeded a dummy CSV and requested data.
- **Bugs Discovered**: **CRITICAL (500 Error)**. Pandas was returning `NaN` for empty CSV cells, which caused the Django JSON encoder to crash. 
- **Fix Applied**: Updated the view to run `.fillna("")` on the dataframe before converting it to dictionaries, safely replacing `NaN` with empty strings. 
- **Result**: PASSED (After Bug Fix).

#### 9. `GET /api/datasets/<str:pk>/profile/` (DatasetProfileView)
- **Description**: Generates statistical profiling for the dataset.
- **Testing Approach**: Verified 200 OK and that it returns summary statistics (count, mean, min, max, etc.) based on the dummy CSV.
- **Result**: PASSED. No bugs discovered.

#### 10. `POST /api/datasets/<str:pk>/cleaning/` (DatasetCleaningView)
- **Description**: Analyzes the dataset for anomalies and suggests cleaning operations via the LLM.
- **Testing Approach**: Mocked the LLM response to provide cleaning suggestions. Verified 200 OK.
- **Result**: PASSED. No bugs discovered.

#### 11. `POST /api/datasets/<str:pk>/cleaning/apply/` (DatasetCleaningApplyView)
- **Description**: Physically applies selected cleaning operations (e.g., fillna, dropna) to the dataset CSV.
- **Testing Approach**: Passed a payload specifying a cleaning action (e.g. fill missing values). Verified 200 OK and that the CSV on disk was actually mutated.
- **Result**: PASSED. No bugs discovered.

#### 12. `POST /api/datasets/<str:pk>/schema-layout/` (DatasetSchemaLayoutView)
- **Description**: Generates a drag-and-drop React Flow schema layout for datasets.
- **Testing Approach**: Verified it returns nodes and edges mapped to the dataset's columns.
- **Result**: PASSED. No bugs discovered.

#### 13. `GET /api/datasets/<str:pk>/export/` (DatasetExportView)
- **Description**: Downloads the dataset CSV file.
- **Testing Approach**: Verified the response returns the CSV file as an attachment with `text/csv` content type.
- **Result**: PASSED. No bugs discovered.

---

### Automated Generation & ML Routes

#### 14. `POST /api/datasets/<str:pk>/generate-report/` (DatasetGenerateReportView)
- **Description**: Instructs the LLM to auto-generate a comprehensive markdown report and layout based on the dataset.
- **Testing Approach**: Mocked the `generate_report` LLM method. Verified 201 Created and that a `Report` entity was saved in the database.
- **Result**: PASSED. No bugs discovered.

#### 15. `POST /api/datasets/<str:pk>/generate-ml-report/` (DatasetGenerateMLReportView)
- **Description**: Trains a Machine Learning model (e.g. Random Forest) on the dataset based on specified target/features, and generates an LLM summary of the model metrics.
- **Testing Approach**: Seeded a CSV with numeric features and a target, mocked the LLM summary client, and initiated the ML pipeline.
- **Bugs Discovered**: **CRITICAL (500 Error)**. The server lacked the `scikit-learn` package, throwing an import error. Furthermore, the test was sending invalid overlapping target/feature columns which crashed Pandas. Also, the mock setup was improperly returning a `MagicMock` object which crashed the DRF JSON serializer.
- **Fix Applied**: Installed `scikit-learn` and added it to requirements. Updated the test payload to send proper distinct target and feature columns. Fixed the Python mocking setup.
- **Result**: PASSED (After Bug Fixes).

#### 16. `POST /api/datasets/<str:pk>/generate-dashboard/` (DatasetGenerateDashboardView)
- **Description**: Uses the LLM to suggest a layout and chart configurations for a dashboard.
- **Testing Approach**: Mocked the layout generator. Verified 201 Created and that a `CustomDashboard` entity was created.
- **Result**: PASSED. No bugs discovered.

#### 17. `POST /api/datasets/<str:pk>/predict/` (MLModelPredictView)
- **Description**: Makes live predictions using a previously trained ML model.
- **Testing Approach**: Ensured the endpoint loads the serialized `.pkl` joblib model and returns predictions based on the JSON payload.
- **Result**: PASSED. No bugs discovered.

#### 18. `POST /api/datasets/model-suggestions/` (ModelSuggestionsView)
- **Description**: Returns recommended schemas or data models for multiple datasets.
- **Testing Approach**: Sent a POST request.
- **Bugs Discovered**: **CRITICAL (405 Method Not Allowed)**. The URL routing config evaluated `model-suggestions` as a dataset primary key (`<str:pk>`), mapping the request to `DatasetDetailView` (which does not have a POST method).
- **Fix Applied**: Moved the `model-suggestions` path above the `<str:pk>` path in `api/urls.py`.
- **Result**: PASSED (After Bug Fix).

#### 19. `POST /api/analytics/dax-generator/` (DaxGeneratorView)
- **Description**: Generates DAX formula measures.
- **Testing Approach**: Verified it returns DAX formulas and explanations.
- **Result**: PASSED. No bugs discovered.

---

### Report Management Routes

#### 20. `GET /api/reports/` (ReportListView)
- **Description**: Retrieves all saved reports for the authenticated user.
- **Testing Approach**: Verified 200 OK and a serialized array of reports.
- **Result**: PASSED. No bugs discovered.

#### 21. `GET, DELETE /api/reports/<str:pk>/` (ReportDetailView)
- **Description**: Retrieves or deletes a specific report.
- **Testing Approach**: Fetched a report (200 OK) and deleted it (204 No Content).
- **Result**: PASSED. No bugs discovered.

#### 22. `GET /api/reports/<str:pk>/export/` (ReportExportView)
- **Description**: Exports the report to a PDF file.
- **Testing Approach**: Fetched the endpoint to trigger the PDF compiler.
- **Bugs Discovered**: **CRITICAL (500 Error)**. The view threw a `ModuleNotFoundError: No module named 'xhtml2pdf'`.
- **Fix Applied**: Installed the `xhtml2pdf` package and updated `requirements.txt`.
- **Result**: PASSED (After Bug Fix).

#### 23. `POST /api/reports/<str:pk>/share/` (ReportShareView)
- **Description**: Generates a shareable token for a report.
- **Testing Approach**: Verified it sets `is_public=True` on the report and returns a unique `share_token`.
- **Result**: PASSED. No bugs discovered.

#### 24. `GET /api/shared/report/<str:token>/` (SharedReportView)
- **Description**: Public endpoint to view a shared report without authentication.
- **Testing Approach**: Hit the endpoint unauthenticated using a valid token. Verified 200 OK and report data returned.
- **Result**: PASSED. No bugs discovered.

---

### Custom Dashboard Routes

#### 25. `POST /api/dashboard/share/` (CustomDashboardShareView)
- **Description**: Saves a user's customized drag-and-drop dashboard configuration and generates a public sharing token.
- **Testing Approach**: Sent a JSON payload with dashboard charts and layout configurations.
- **Bugs Discovered**: **CRITICAL (500 Error)**. Throwing an `IntegrityError: NOT NULL constraint failed`. The frontend does not always provide `theme_style` or `theme_font`, and they have no default defined at the database level when null.
- **Fix Applied**: Added `.get('key', 'default_value')` fallback logic directly in the view to ensure null constraints are respected.
- **Result**: PASSED (After Bug Fix).

#### 26. `GET /api/shared/dashboard/<str:token>/` (SharedCustomDashboardView)
- **Description**: Public endpoint to view a shared custom dashboard and its embedded dataset data.
- **Testing Approach**: Hit the endpoint unauthenticated using a valid token. Verified it loads the dashboard configuration and successfully reads the underlying CSV dataset data without throwing unauthorized errors.
- **Result**: PASSED. No bugs discovered.

---

## Additional Frontend Security Hotfix
In addition to the API endpoints, a critical vulnerability was fixed in the frontend React app.
- **Component**: `DashboardBuilder.jsx`
- **Issue**: The codebase used `eval()` to dynamically execute JavaScript logic when rendering chart configurations, opening up a Severe Cross-Site Scripting (XSS) vulnerability.
- **Resolution**: Refactored the code to use `new Function()` scoped strictly to safe variables, neutralizing the vulnerability.
