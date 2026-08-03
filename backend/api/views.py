from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .llm_client import OpenRouterClient
from .models import Dataset, DatasetColumn, CleaningRecommendation, Report, CustomDashboard
from django.utils import timezone
import pandas as pd




from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import timedelta

ACCESS_COOKIE_AGE  = 60 * 60 * 24        # 1 day
REFRESH_COOKIE_AGE = 60 * 60 * 24 * 7    # 7 days

def _set_auth_cookies(response, user):
    """Set HttpOnly JWT cookies + a readable flag cookie for the frontend."""
    refresh = RefreshToken.for_user(user)
    cookie_kwargs = dict(httponly=False, secure=False, samesite='Lax', path='/')

    response.set_cookie('access_token',  str(refresh.access_token),
                        max_age=ACCESS_COOKIE_AGE,  httponly=True,
                        secure=False, samesite='Lax', path='/')
    response.set_cookie('refresh_token', str(refresh),
                        max_age=REFRESH_COOKIE_AGE, httponly=True,
                        secure=False, samesite='Lax', path='/')
    # Non-HttpOnly flag so JS can check auth state without an API call
    response.set_cookie('is_authenticated', '1',
                        max_age=ACCESS_COOKIE_AGE, **cookie_kwargs)
    return response

def _clear_auth_cookies(response):
    for name in ('access_token', 'refresh_token', 'is_authenticated'):
        response.delete_cookie(name, path='/')
    return response


class CookieLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        response = Response({'success': True, 'username': user.username})
        return _set_auth_cookies(response, user)


class CookieLogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response({'success': True})
        return _clear_auth_cookies(response)


class AuthCheckView(APIView):
    """Returns 200 if the request is authenticated, 401 otherwise."""
    def get(self, request):
        return Response({
            'authenticated': True, 
            'username': request.user.username,
            'email': request.user.email,
            'is_staff': request.user.is_staff
        })


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=username, password=password)
        # Auto-login after registration
        response = Response({'message': 'User created'}, status=status.HTTP_201_CREATED)
        return _set_auth_cookies(response, user)


class DatasetListView(APIView):
    def get(self, request):
        datasets = Dataset.objects.filter(user=request.user).values()
        return Response(list(datasets))

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if file_obj.name.endswith('.csv'):
                df = pd.read_csv(file_obj)
            elif file_obj.name.endswith(('.xls', '.xlsx')):
                df = pd.read_excel(file_obj)
            else:
                return Response({"error": "Unsupported file format. Please upload CSV or Excel."}, status=status.HTTP_400_BAD_REQUEST)
            
            rows_count = len(df)
            columns_count = len(df.columns)
            missing_values = int(df.isnull().sum().sum())
            duplicate_rows = int(df.duplicated().sum())
            
            new_ds = Dataset.objects.create(user=request.user, 
                id=f"ds_{timezone.now().timestamp()}",
                name=file_obj.name,
                rows_count=rows_count,
                columns_count=columns_count,
                status="Uploaded",
                missing_values=missing_values,
                duplicate_rows=duplicate_rows
            )
            
            # Save the dataframe to a media directory IMMEDIATELY
            import os
            from django.conf import settings
            media_dir = os.path.join(settings.BASE_DIR, 'media')
            os.makedirs(media_dir, exist_ok=True)
            df.to_csv(os.path.join(media_dir, f"{new_ds.id}.csv"), index=False)
            
            try:
                # Profile columns
                for col in df.columns:
                    dtype = str(df[col].dtype)
                    if 'int' in dtype:
                        col_type = 'integer'
                    elif 'float' in dtype:
                        col_type = 'float'
                    elif 'datetime' in dtype:
                        col_type = 'datetime'
                    else:
                        col_type = 'string'
                        
                    DatasetColumn.objects.create(
                        dataset=new_ds,
                        name=str(col),
                        type=col_type,
                        unique_values=int(df[col].nunique()),
                        missing_count=int(df[col].isnull().sum())
                    )
                    
                # Generate cleaning recommendations
                if missing_values > 0:
                    for col in df.columns[df.isnull().any()]:
                        missing_cnt = int(df[col].isnull().sum())
                        if 'int' in str(df[col].dtype) or 'float' in str(df[col].dtype):
                            median_val = df[col].median()
                            rec = f"Fill missing values with median ({median_val})"
                            action = "fill_median"
                        else:
                            mode_val = df[col].mode()[0] if not df[col].mode().empty else 'Unknown'
                            rec = f"Fill missing values with mode ({mode_val})"
                            action = "fill_mode"
                            
                        CleaningRecommendation.objects.create(
                            dataset=new_ds,
                            recommendation_id=f"clean_{col}_missing",
                            column=str(col),
                            issue=f"{missing_cnt} missing values",
                            recommendation=rec,
                            action_type=action
                        )
                        
                if duplicate_rows > 0:
                    CleaningRecommendation.objects.create(
                        dataset=new_ds,
                        recommendation_id="clean_drop_duplicates",
                        column="all",
                        issue=f"{duplicate_rows} duplicate rows found",
                        recommendation="Remove duplicate entries",
                        action_type="drop_duplicates"
                    )
                    
                # Advanced Profiling
                for col in df.columns:
                    if pd.api.types.is_numeric_dtype(df[col]):
                        q1 = df[col].quantile(0.25)
                        q3 = df[col].quantile(0.75)
                        iqr = q3 - q1
                        lower_bound = q1 - 1.5 * iqr
                        upper_bound = q3 + 1.5 * iqr
                        outliers_count = int(((df[col] < lower_bound) | (df[col] > upper_bound)).sum())
                        if outliers_count > 0:
                            CleaningRecommendation.objects.create(
                                dataset=new_ds,
                                recommendation_id=f"clean_{col}_outliers",
                                column=str(col),
                                issue=f"{outliers_count} outliers detected",
                                recommendation=f"Cap outliers to IQR bounds in '{col}'",
                                action_type="handle_outliers"
                            )
                    elif pd.api.types.is_string_dtype(df[col]) or pd.api.types.is_object_dtype(df[col]):
                        sample = df[col].dropna().head(20)
                        if not sample.empty:
                            try:
                                parsed = pd.to_datetime(sample, errors='coerce')
                                if parsed.notna().sum() / len(sample) >= 0.8:
                                    CleaningRecommendation.objects.create(
                                        dataset=new_ds,
                                        recommendation_id=f"clean_{col}_dates",
                                        column=str(col),
                                        issue="Raw or mixed date formats",
                                        recommendation=f"Standardize '{col}' to YYYY-MM-DD format",
                                        action_type="standardize_dates"
                                    )
                                    continue
                            except Exception:
                                pass
                                
                            unique_vals = df[col].dropna().unique()
                            if 0 < len(unique_vals) < 50:
                                lower_vals = set([str(v).lower().strip() for v in unique_vals])
                                if len(lower_vals) < len(unique_vals):
                                    CleaningRecommendation.objects.create(
                                        dataset=new_ds,
                                        recommendation_id=f"clean_{col}_labels",
                                        column=str(col),
                                        issue="Inconsistent casing/spacing in labels",
                                        recommendation=f"Standardize text labels in '{col}'",
                                        action_type="standardize_labels"
                                    )
            except Exception as e:
                print(f"Profiling error for {new_ds.id}: {e}")
                
            if new_ds.recommendations.exists():
                new_ds.status = "Needs Profiling"
            else:
                new_ds.status = "Cleaned" if new_ds.missing_values == 0 else "Needs Profiling"
            new_ds.save()
            
            return Response({"id": new_ds.id, "name": new_ds.name, "status": new_ds.status}, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({"error": f"Failed to parse file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        ids = request.data.get("ids", [])
        delete_all = request.data.get("delete_all", False)
        
        import os
        from django.conf import settings
        
        if delete_all:
            datasets = Dataset.objects.filter(user=request.user)
        else:
            datasets = Dataset.objects.filter(user=request.user, id__in=ids)
            
        for ds in datasets:
            file_path = os.path.join(settings.BASE_DIR, 'media', f"{ds.id}.csv")
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception:
                    pass
            ds.delete()
            
        return Response(status=status.HTTP_204_NO_CONTENT)

class DatasetDataView(APIView):
    def get(self, request, pk):
        try:
            dataset = Dataset.objects.get(user=request.user, pk=pk)
            
            import os
            import pandas as pd
            from django.conf import settings
            file_path = os.path.join(settings.BASE_DIR, 'media', f"{dataset.id}.csv")
            
            if os.path.exists(file_path):
                # We limit to 500 rows to ensure the browser doesn't freeze when rendering many charts
                df = pd.read_csv(file_path, nrows=500)
                # Replace NaNs with empty string so JSON serializes them without NaN errors
                df = df.fillna("")
                return Response({
                    "id": dataset.id,
                    "name": dataset.name,
                    "columns": list(df.columns),
                    "data": df.to_dict(orient='records')
                })
            else:
                return Response({"error": "Dataset CSV file not found on server"}, status=status.HTTP_404_NOT_FOUND)
        except Dataset.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

class DatasetDetailView(APIView):
    def get(self, request, pk):
        try:
            dataset = Dataset.objects.get(user=request.user, pk=pk)
            
            import os
            import pandas as pd
            from django.conf import settings
            file_path = os.path.join(settings.BASE_DIR, 'media', f"{dataset.id}.csv")
            
            preview_headers = []
            preview_rows = []
            
            if os.path.exists(file_path):
                df = pd.read_csv(file_path, nrows=5)
                preview_headers = list(df.columns)
                df = df.fillna("")
                preview_rows = df.to_dict(orient='records')
            else:
                columns = list(dataset.columns.all())
                preview_headers = [col.name for col in columns]
                for i in range(1, 6):
                    row_dict = {}
                    for col in columns:
                        if col.type == 'integer':
                            row_dict[col.name] = i * 100
                        elif col.type == 'float':
                            row_dict[col.name] = round(i * 15.75, 2)
                        else:
                            row_dict[col.name] = f"Sample_{col.name}_{i}"
                    preview_rows.append(row_dict)

            return Response({
                "id": dataset.id,
                "name": dataset.name,
                "rows_count": dataset.rows_count,
                "columns_count": dataset.columns_count,
                "missing_values": dataset.missing_values,
                "duplicate_rows": dataset.duplicate_rows,
                "status": dataset.status,
                "preview_headers": preview_headers,
                "preview_rows": preview_rows,
                "custom_measures": dataset.custom_measures
            })
        except Dataset.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk):
        try:
            dataset = Dataset.objects.get(user=request.user, pk=pk)
            if 'custom_measures' in request.data:
                dataset.custom_measures = request.data['custom_measures']
                dataset.save()
            return Response({
                "status": "updated",
                "custom_measures": dataset.custom_measures
            })
        except Dataset.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            dataset = Dataset.objects.get(user=request.user, pk=pk)
            import os
            from django.conf import settings
            file_path = os.path.join(settings.BASE_DIR, 'media', f"{dataset.id}.csv")
            if os.path.exists(file_path):
                os.remove(file_path)
            dataset.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Dataset.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

class DatasetGenerateDashboardView(APIView):
    def post(self, request, pk):
        try:
            dataset = Dataset.objects.get(user=request.user, pk=pk)
            columns = list(dataset.columns.all())
            dataset_info = f"Dataset: {dataset.name}, Rows: {dataset.rows_count}, Columns: " + ", ".join([f"{c.name} ({c.type})" for c in columns])
            
            charts = []
            num_cols = [c.name for c in columns if c.type in ['integer', 'float']]
            cat_cols = [c.name for c in columns if c.type not in ['integer', 'float']]
            
            if num_cols and cat_cols:
                charts.append({
                    "id": "1",
                    "type": "Bar",
                    "title": f"Sum of {num_cols[0]} by {cat_cols[0]}",
                    "xAxis": cat_cols[0],
                    "yAxis": num_cols[0]
                })
                charts.append({
                    "id": "2",
                    "type": "Pie",
                    "title": f"{num_cols[0]} Share by {cat_cols[0]}",
                    "xAxis": cat_cols[0],
                    "yAxis": num_cols[0]
                })
                if len(num_cols) > 1:
                    charts.append({
                        "id": "3",
                        "type": "Line",
                        "title": f"{num_cols[0]} Trend",
                        "xAxis": cat_cols[0],
                        "yAxis": num_cols[0]
                    })
                    charts.append({
                        "id": "4",
                        "type": "Scatter",
                        "title": f"{num_cols[0]} vs {num_cols[1]}",
                        "xAxis": num_cols[1],
                        "yAxis": num_cols[0]
                    })
                
            data = {
                "layout": "grid-2x2",
                "theme_style": "analytical",
                "theme_font": "sans",
                "custom_measures": [],
                "charts": charts
            }
            return Response(data)
        except Dataset.DoesNotExist:
            return Response({"error": "Dataset not found"}, status=status.HTTP_404_NOT_FOUND)

class DatasetGenerateReportView(APIView):
    def post(self, request, pk):
        try:
            dataset = Dataset.objects.get(user=request.user, pk=pk)
            from django.utils import timezone
            
            columns = list(dataset.columns.all())
            numeric_cols = [c.name for c in columns if c.type in ['integer', 'float']]
            categorical_cols = [c.name for c in columns if c.type not in ['integer', 'float']]
            
            visuals_data = []
            dax_data = []
            
            dataset_info = f"Dataset: {dataset.name}, Rows: {dataset.rows_count}, Columns: " + ", ".join([f"{c.name} ({c.type})" for c in columns])
            
            # Hardcoded logic (No AI)
            if numeric_cols and categorical_cols:
                visuals_data.append({
                    "type": "BarChart",
                    "title": f"Sum of {numeric_cols[0]} by {categorical_cols[0]}",
                    "description": f"X: {categorical_cols[0]}, Y: Sum({numeric_cols[0]})"
                })
                cat2 = categorical_cols[1] if len(categorical_cols) > 1 else categorical_cols[0]
                visuals_data.append({
                    "type": "LineChart",
                    "title": f"{numeric_cols[0]} Trend across {cat2}",
                    "description": f"X: {cat2}, Y: {numeric_cols[0]}"
                })
                visuals_data.append({
                    "type": "PieChart",
                    "title": f"Distribution by {categorical_cols[0]}",
                    "description": f"Category: {categorical_cols[0]}, Values: Count"
                })
            else:
                visuals_data = [
                    {"type": "BarChart", "title": "Data Distribution", "description": "General overview"},
                    {"type": "LineChart", "title": "Trend Analysis", "description": "Trend over index"},
                    {"type": "PieChart", "title": "Composition", "description": "Data composition"}
                ]
                    
            for num_col in numeric_cols[:3]:
                dax_data.append({
                    "name": f"Total {num_col}",
                    "formula": f"SUM('{dataset.name}'[{num_col}])"
                })
            if not dax_data:
                dax_data = [{"name": "Row Count", "formula": f"COUNTROWS('{dataset.name}')"}]
                
            # Hardcoded detailed markdown BI report (No AI)
            md_report = f"# Executive BI Summary\n\nDataset **{dataset.name}** contains {dataset.rows_count} records.\n\n"
            md_report += f"## Key Metrics\n"
            for d in dax_data:
                md_report += f"- **{d['name']}**: `{d['formula']}`\n"
                
            if visuals_data:
                if 'details' not in visuals_data[0]:
                    visuals_data[0]['details'] = {}
                visuals_data[0]['details']['markdown_report'] = md_report
                    
            report_id = f"rep_{timezone.now().timestamp()}"
            report = Report.objects.create(user=request.user, 
                id=report_id,
                title=f"{dataset.name} Dashboard",
                dataset=dataset.name,
                generated="Just now",
                visuals_count=len(visuals_data),
                dax_count=len(dax_data),
                visuals_data=visuals_data,
                dax_data=dax_data
            )
            return Response({"report_id": report.id}, status=status.HTTP_201_CREATED)
        except Dataset.DoesNotExist:
            return Response({"error": "Dataset not found"}, status=status.HTTP_404_NOT_FOUND)

class DatasetProfileView(APIView):
    def post(self, request, pk):
        # Returns column profiles
        try:
            dataset = Dataset.objects.get(user=request.user, pk=pk)
            columns = list(dataset.columns.values('name', 'type', 'unique_values', 'missing_count'))
            return Response({
                "dataset_id": dataset.id,
                "total_rows": dataset.rows_count,
                "total_columns": dataset.columns_count,
                "missing_values": dataset.missing_values,
                "duplicate_rows": dataset.duplicate_rows,
                "columns": columns
            })
        except Dataset.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

class DatasetCleaningView(APIView):
    def get(self, request, pk):
        try:
            dataset = Dataset.objects.get(user=request.user, pk=pk)
            recs = list(dataset.recommendations.values('recommendation_id', 'column', 'issue', 'recommendation', 'action_type'))
            return Response({
                "dataset_id": dataset.id,
                "data_quality_score": 85,
                "recommendations": recs
            })
        except Dataset.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

class DatasetCleaningApplyView(APIView):
    def post(self, request, pk):
        rec_id = request.data.get('recommendation_id')
        try:
            dataset = Dataset.objects.get(user=request.user, pk=pk)
            rec = CleaningRecommendation.objects.get(dataset=dataset, recommendation_id=rec_id)
            
            # Apply logic: update dataset stats and delete recommendation
            import os
            import pandas as pd
            from django.conf import settings
            file_path = os.path.join(settings.BASE_DIR, 'media', f"{dataset.id}.csv")
            
            if not os.path.exists(file_path):
                return Response({"error": "Dataset file not found on server"}, status=status.HTTP_404_NOT_FOUND)
                
            df = pd.read_csv(file_path)
                
            if rec.action_type == "fill_median":
                if rec.column in df.columns:
                    if pd.api.types.is_numeric_dtype(df[rec.column]):
                        df[rec.column] = df[rec.column].fillna(df[rec.column].median())
                    df.to_csv(file_path, index=False)
                    
            elif rec.action_type == "fill_mode":
                if rec.column in df.columns:
                    mode_val = df[rec.column].mode()[0] if not df[rec.column].mode().empty else 'Unknown'
                    df[rec.column] = df[rec.column].fillna(mode_val)
                    df.to_csv(file_path, index=False)
                    
            elif rec.action_type == "handle_outliers":
                if rec.column in df.columns:
                    q1 = df[rec.column].quantile(0.25)
                    q3 = df[rec.column].quantile(0.75)
                    iqr = q3 - q1
                    lower_bound = q1 - 1.5 * iqr
                    upper_bound = q3 + 1.5 * iqr
                    df[rec.column] = df[rec.column].clip(lower=lower_bound, upper=upper_bound)
                    df.to_csv(file_path, index=False)
                    
            elif rec.action_type == "standardize_dates":
                if rec.column in df.columns:
                    df[rec.column] = pd.to_datetime(df[rec.column], errors='coerce').dt.strftime('%Y-%m-%d')
                    df.to_csv(file_path, index=False)
                    
            elif rec.action_type == "standardize_labels":
                if rec.column in df.columns:
                    df[rec.column] = df[rec.column].astype(str).str.title().str.strip()
                    df.to_csv(file_path, index=False)
                    
            elif rec.action_type == "drop_duplicates":
                df = df.drop_duplicates()
                df.to_csv(file_path, index=False)
            
            # ACCURATELY recalculate stats
            dataset.missing_values = int(df.isnull().sum().sum())
            dataset.rows_count = len(df)
            dataset.duplicate_rows = int(df.duplicated().sum())
            
            rec.delete()
            if not dataset.recommendations.exists():
                dataset.status = "Cleaned" if dataset.missing_values == 0 else "Needs Profiling"
            dataset.save()
            
            return Response({"success": True, "dataset_id": dataset.id, "message": f"Applied {rec_id} successfully."})
        except (Dataset.DoesNotExist, CleaningRecommendation.DoesNotExist):
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

class ReportListView(APIView):
    def get(self, request):
        reports = Report.objects.filter(user=request.user).values('id', 'title', 'dataset', 'generated', 'visuals_count', 'dax_count', 'report_type')
        return Response(list(reports))

    def delete(self, request):
        ids = request.data.get("ids", [])
        delete_all = request.data.get("delete_all", False)
        
        if delete_all:
            Report.objects.filter(user=request.user).delete()
        else:
            Report.objects.filter(user=request.user, id__in=ids).delete()
            
        return Response(status=status.HTTP_204_NO_CONTENT)

class ReportDetailView(APIView):
    def get(self, request, pk):
        try:
            report = Report.objects.get(user=request.user, pk=pk)
            return Response({
                "id": report.id,
                "title": report.title,
                "dataset": report.dataset,
                "generated": report.generated,
                "report_type": report.report_type,
                "visuals_count": report.visuals_count,
                "dax_count": report.dax_count,
                "visuals_data": report.visuals_data,
                "dax_data": report.dax_data
            })
        except Report.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            report = Report.objects.get(user=request.user, pk=pk)
            report.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Report.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

class ChatMessageView(APIView):
    def post(self, request):
        user_message = request.data.get("message")
        if not user_message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Build dataset context
        datasets = Dataset.objects.filter(user=request.user)
        dataset_context = "Available datasets in the workspace:\n"
        if datasets.exists():
            for ds in datasets:
                dataset_context += f"- {ds.name} (ID: {ds.id}, Rows: {ds.rows_count}, Columns: {ds.columns_count}, Status: {ds.status})\n"
                cols = ds.columns.all()
                if cols.exists():
                    dataset_context += "  Columns: " + ", ".join([f"{c.name} ({c.type})" for c in cols]) + "\n"
        else:
            dataset_context += "- No datasets currently connected.\n"

        system_prompt = (
            "You are InsightFlow AI Analytics Assistant. Provide helpful analysis or DAX formulas.\n"
            f"Here is the context of the user's workspace:\n{dataset_context}\n\n"
            "CRITICAL INSTRUCTION:\n"
            "If the user asks you to clean, fix, or purge missing values from a dataset, you MUST physically trigger the cleaning process. "
            "To do this, you MUST append exactly this string at the very end of your response:\n"
            "[ACTION: CLEAN_DATASET: dataset_name]\n"
            "(Replace dataset_name with the exact name of the dataset, e.g. area_prices_monthly.csv). "
            "If you do not include this exact string, the cleaning will fail. Do not just list the steps."
        )

        client = OpenRouterClient()
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
        
        try:
            reply = client.generate_chat_response(messages)
            
            import re
            action_match = re.search(r'\[ACTION:?\s*CLEAN_DATASET:?\s*(.*?)\]', reply, re.IGNORECASE)
            dataset_name = None
            
            if action_match:
                dataset_name = action_match.group(1).strip()
            elif any(w in user_message.lower() for w in ['clean', 'fix', 'export']):
                # Fallback: check if a known dataset name is in the message or reply
                for ds in Dataset.objects.filter(user=request.user):
                    if ds.name.lower() in user_message.lower() or ds.name.lower() in reply.lower():
                        dataset_name = ds.name
                        break
                        
            if dataset_name:
                dataset = Dataset.objects.filter(user=request.user, name__icontains=dataset_name).first()
                if dataset:
                    # Execute cleaning
                    dataset.status = "Cleaned"
                    dataset.missing_values = 0
                    dataset.duplicate_rows = 0
                    dataset.save()
                    dataset.recommendations.all().delete()
                    
                    import os, pandas as pd
                    from django.conf import settings
                    file_path = os.path.join(settings.BASE_DIR, 'media', f"{dataset.id}.csv")
                    if os.path.exists(file_path):
                        df = pd.read_csv(file_path)
                        for col in df.columns:
                            if df[col].isnull().any():
                                if 'int' in str(df[col].dtype) or 'float' in str(df[col].dtype):
                                    df[col] = df[col].fillna(df[col].median())
                                else:
                                    df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'Unknown')
                        df.drop_duplicates(inplace=True)
                        df.to_csv(file_path, index=False)
                        
                    download_link = f"http://localhost:8000/api/datasets/{dataset.id}/export/"
                    reply = reply.replace(action_match.group(0), f"\n\n**Action Executed**: The dataset '{dataset.name}' has been automatically cleaned for you. Missing values were filled and duplicates removed!\n\n[📥 Download Cleaned CSV]({download_link})")
                
            return Response({"reply": reply})
        except Exception as e:
            import traceback
            error_details = str(e)
            # Fallback for when OpenRouter API is not accessible
            fallback_reply = f"I'm currently unable to connect to the OpenRouter AI API. Error: {error_details}\n\nYou asked: '{user_message}'. \n\nI can see you have datasets like '{datasets.first().name if datasets.exists() else 'none'}'. To calculate Year-to-Date sales, you could use: Sales YTD = TOTALYTD(SUM('Sales'[Amount]), 'Date'[Date])"
            return Response({"reply": fallback_reply})

import csv
from django.http import HttpResponse

class DatasetExportView(APIView):
    def get(self, request, pk):
        try:
            dataset = Dataset.objects.get(user=request.user, pk=pk)
            
            import os
            import pandas as pd
            from django.conf import settings
            file_path = os.path.join(settings.BASE_DIR, 'media', f"{dataset.id}.csv")
            
            response = HttpResponse(
                content_type='text/csv',
                headers={'Content-Disposition': f'attachment; filename="{dataset.name.split(".")[0]}_export.csv"'},
            )
            
            if os.path.exists(file_path):
                # Return the actual data!
                df = pd.read_csv(file_path)
                df.to_csv(path_or_buf=response, index=False)
                return response
                
            # Fallback to dummy data for pre-populated datasets that don't have a real file
            columns = list(dataset.columns.all())
            writer = csv.writer(response)
            
            if not columns:
                writer.writerow(['ID', 'Value', 'Category'])
                for i in range(1, 11):
                    writer.writerow([i, i * 10.5, 'Category A'])
                return response
            
            header = [col.name for col in columns]
            writer.writerow(header)
            
            for i in range(1, 11):
                row = []
                for col in columns:
                    if col.type == 'integer':
                        row.append(i * 100)
                    elif col.type == 'float':
                        row.append(round(i * 15.75, 2))
                    else:
                        row.append(f"Sample_{col.name}_{i}")
                writer.writerow(row)
                
            return response
            
        except Dataset.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

class ReportExportView(APIView):
    def get(self, request, pk):
        try:
            report = Report.objects.get(user=request.user, pk=pk)
            is_ml = report.report_type == 'ml'
            
            html = f"""
            <html>
            <head>
                <style>
                    body {{ font-family: Helvetica, sans-serif; font-size: 12px; color: #333; }}
                    h1 {{ font-size: 20px; color: #111; margin-bottom: 10px; }}
                    h2 {{ font-size: 16px; margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }}
                    h3 {{ font-size: 14px; margin-top: 15px; color: #222; }}
                    h4 {{ font-size: 12px; margin-top: 10px; }}
                    .meta {{ font-size: 11px; color: #666; margin-bottom: 25px; }}
                    .page-break {{ pdf-pagebreak-before: always; }}
                    table {{ width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 15px; }}
                    th, td {{ border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 11px; }}
                    th {{ background-color: #f9f9f9; font-weight: bold; }}
                    code {{ font-family: Courier, monospace; font-size: 11px; background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; }}
                    ul {{ margin-top: 5px; margin-bottom: 10px; }}
                    li {{ margin-bottom: 4px; }}
                </style>
            </head>
            <body>
                <h1>InsightFlow {'ML ' if is_ml else ''}Report: {report.title}</h1>
                <div class="meta">
                    Dataset Source: {report.dataset}<br/>
                    Generated On: {report.generated}<br/>
                    {'Models Analyzed: ' + str(report.visuals_count) + ' | Components: ' + str(report.dax_count) if is_ml else 'Total Visuals: ' + str(report.visuals_count) + ' | Total DAX: ' + str(report.dax_count)}
                </div>
                <h2>{'Model Diagnostics & Insights' if is_ml else 'Dashboard Visualizations'}</h2>
            """
            
            for i, vis in enumerate(report.visuals_data):
                html += f"<h3>{i+1}. {vis.get('title', 'Unknown')} ({vis.get('type', 'Chart')})</h3>"
                html += f"<p><strong>Description:</strong> {vis.get('description', '')}</p>"
                
                details = vis.get('details', {})
                if details:
                    metrics = details.get('metrics', {})
                    if metrics:
                        html += "<h4>Performance & Metrics:</h4><ul>"
                        for k, v in metrics.items():
                            html += f"<li><strong>{str(k).replace('_', ' ').title()}</strong>: {v}</li>"
                        html += "</ul>"
                        
                    importances = details.get('feature_importances', [])
                    if importances:
                        html += "<h4>Key Drivers (Feature Importances):</h4><ul>"
                        for imp in importances[:5]:
                            html += f"<li><strong>{imp.get('feature', '')}</strong>: {imp.get('importance', 0)}</li>"
                        html += "</ul>"
                
            html += f"<div class='page-break'></div><h2>{'Model Details & Schema' if is_ml else 'DAX Measures'}</h2>"
            for i, dax in enumerate(report.dax_data):
                html += f"<h3>{i+1}. {dax.get('name', 'Measure')}</h3>"
                html += f"<code>{dax.get('formula', '')}</code><br/>"
                
            if report.visuals_data:
                md_report = report.visuals_data[0].get('details', {}).get('markdown_report', '')
                if md_report:
                    import mistune
                    html += "<div class='page-break'></div>"
                    md = mistune.create_markdown(plugins=['table'])
                    html += md(md_report)
                    
            html += "</body></html>"
            
            from xhtml2pdf import pisa
            from io import BytesIO
            
            result = BytesIO()
            pdf = pisa.pisaDocument(BytesIO(html.encode("UTF-8")), result)
            
            if not pdf.err:
                response = HttpResponse(result.getvalue(), content_type='application/pdf')
                response['Content-Disposition'] = f'attachment; filename="Report_{report.title}.pdf"'
                return response
            else:
                return Response({"error": "Failed to generate PDF"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Report.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

class ModelSuggestionsView(APIView):
    def post(self, request):
        return Response({
            "recommended_schema": "Star Schema",
            "relationships": []
        })

class DaxGeneratorView(APIView):
    def post(self, request):
        return Response({
            "measure_name": "Sales YTD",
            "formula": "Sales YTD = TOTALYTD(SUM('Sales_Data_2023'[Sales]), 'Sales_Data_2023'[Date])",
            "explanation": "Calculates the cumulative sum of sales from the start of the current calendar year up to the current date."
        })

class DatasetGenerateMLReportView(APIView):
    def post(self, request, pk):
        try:
            dataset = Dataset.objects.get(user=request.user, pk=pk)
            features = request.data.get('features', [])
            target = request.data.get('target')
            model_type = request.data.get('model_type', 'random_forest')
            task_type = request.data.get('task_type')
            
            if not target:
                return Response({"error": "Target column is required"}, status=status.HTTP_400_BAD_REQUEST)
            if not features:
                return Response({"error": "At least one feature column is required"}, status=status.HTTP_400_BAD_REQUEST)
                
            import os
            import numpy as np
            from django.conf import settings
            
            file_path = os.path.join(settings.BASE_DIR, 'media', f"{dataset.id}.csv")
            if not os.path.exists(file_path):
                return Response({"error": "Dataset CSV file not found on server"}, status=status.HTTP_404_NOT_FOUND)
                
            df = pd.read_csv(file_path)
            
            # Verify target and features exist in dataset
            all_cols = list(df.columns)
            if target not in all_cols:
                return Response({"error": f"Target column '{target}' not found in dataset"}, status=status.HTTP_400_BAD_REQUEST)
            for f in features:
                if f not in all_cols:
                    return Response({"error": f"Feature column '{f}' not found in dataset"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Select columns
            cols_to_use = features + [target]
            df_model = df[cols_to_use].copy()
            
            # 1. TARGET FILTERING
            # Automatically drop rows where the user-selected target variable is missing
            df_model = df_model.dropna(subset=[target])
            
            # 2. SMART IMPUTATION
            # Missing values are imputed using the median for numeric columns,
            # and a 'Missing' placeholder category for text/categorical columns.
            for col in features:
                if df_model[col].dtype in ['int64', 'float64']:
                    median_val = df_model[col].median()
                    df_model[col] = df_model[col].fillna(median_val if not pd.isna(median_val) else 0)
                else:
                    df_model[col] = df_model[col].fillna('Missing')
            
            # 3. AUTOMATED TASK INFERENCE
            # If the user doesn't pick 'classification' or 'regression', the system infers it:
            # - Classification: Chosen if target is an object/string OR has <= 15 unique values (low cardinality).
            # - Regression: Chosen otherwise (high cardinality numeric).
            if not task_type:
                target_dtype = df_model[target].dtype
                unique_count = df_model[target].nunique()
                # If target is object/string, or has fewer than 15 unique values, treat as classification
                if target_dtype == 'object' or unique_count <= 15:
                    task_type = 'classification'
                else:
                    task_type = 'regression'
                    
            # 4. ENCODING FEATURES
            # Apply Dummy Encoding (One-Hot Encoding with drop_first=True) to transform 
            # categorical text variables into a ML-ready format.
            X_df = df_model[features].copy()
            cat_features = [col for col in features if X_df[col].dtype == 'object' or X_df[col].dtype.name == 'category']
            
            cat_feature_options = {}
            for col in cat_features:
                cat_feature_options[col] = [str(x) for x in df_model[col].unique()]
            
            X_encoded = pd.get_dummies(X_df, columns=cat_features, drop_first=True)
            feature_names = list(X_encoded.columns)
            
            # 5. TARGET ENCODING
            # Prepare targets. For Classification, use LabelEncoder to cleanly map categorical 
            # or string classes into a discrete [0, 1, 2, ...] format required by sklearn classifiers.
            y = df_model[target].values
            target_classes = []
            if task_type == 'classification':
                from sklearn.preprocessing import LabelEncoder
                le = LabelEncoder()
                y = le.fit_transform(df_model[target].values)
                target_classes = [str(x) for x in le.classes_]
            
            X = X_encoded.values
            
            if len(df_model) < 5:
                return Response({"error": "Dataset has too few records for training (minimum 5 required)"}, status=status.HTTP_400_BAD_REQUEST)
                
            # 6. TRAIN-TEST SPLIT
            # Split the data into 80% for training the model and 20% for evaluating its performance.
            from sklearn.model_selection import train_test_split
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Train model
            metrics = {}
            importances_vals = []
            predictions_data = []
            
            from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
            from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
            from sklearn.linear_model import LogisticRegression, LinearRegression
            from sklearn.metrics import accuracy_score, precision_recall_fscore_support, r2_score, mean_squared_error, mean_absolute_error
            
            model = None
            if task_type == 'classification':
                if model_type == 'decision_tree':
                    model = DecisionTreeClassifier(max_depth=5, random_state=42)
                elif model_type == 'logistic_regression':
                    model = LogisticRegression(max_iter=1000, random_state=42)
                else:
                    model = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
                    
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)
                
                # 7A. CLASSIFICATION METRICS
                # Extract Accuracy, Precision, Recall, and F1-Score (weighted) for model evaluation.
                acc = accuracy_score(y_test, y_pred)
                p, r, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted', zero_division=0)
                metrics = {
                    "accuracy": round(float(acc), 4),
                    "precision": round(float(p), 4),
                    "recall": round(float(r), 4),
                    "f1_score": round(float(f1), 4)
                }
                
                # 8A. FEATURE IMPORTANCES (CLASSIFICATION)
                # Automatically extract feature importance via `.feature_importances_` (for trees) 
                # or normalized `.coef_` (for linear models) to explain to the user which features drove predictions.
                if hasattr(model, 'feature_importances_'):
                    importances_vals = model.feature_importances_
                elif hasattr(model, 'coef_'):
                    importances_vals = np.abs(model.coef_[0])
                    sum_coef = np.sum(importances_vals)
                    if sum_coef > 0:
                        importances_vals = importances_vals / sum_coef
                else:
                    importances_vals = np.ones(len(feature_names)) / len(feature_names)
                    
                # Predictions sample (limit to 50)
                for i in range(min(len(y_test), 50)):
                    act_lbl = target_classes[int(y_test[i])] if target_classes else str(y_test[i])
                    pred_lbl = target_classes[int(y_pred[i])] if target_classes else str(y_pred[i])
                    predictions_data.append({
                        "id": i,
                        "actual": act_lbl,
                        "predicted": pred_lbl,
                        "correct": bool(y_test[i] == y_pred[i])
                    })
            else:
                if model_type == 'decision_tree':
                    model = DecisionTreeRegressor(max_depth=5, random_state=42)
                elif model_type == 'linear_regression':
                    model = LinearRegression()
                else:
                    model = RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)
                    
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)
                
                # 7B. REGRESSION METRICS
                # Extract R², Mean Squared Error (MSE), Root MSE (RMSE), and Mean Absolute Error (MAE).
                r2 = r2_score(y_test, y_pred)
                mse = mean_squared_error(y_test, y_pred)
                rmse = np.sqrt(mse)
                mae = mean_absolute_error(y_test, y_pred)
                metrics = {
                    "r2_score": round(float(r2), 4),
                    "mse": round(float(mse), 4),
                    "rmse": round(float(rmse), 4),
                    "mae": round(float(mae), 4)
                }
                
                # 8B. FEATURE IMPORTANCES (REGRESSION)
                # Automatically extract feature importance via `.feature_importances_` (for trees) 
                # or normalized `.coef_` (for linear models).
                if hasattr(model, 'feature_importances_'):
                    importances_vals = model.feature_importances_
                elif hasattr(model, 'coef_'):
                    importances_vals = np.abs(model.coef_)
                    sum_coef = np.sum(importances_vals)
                    if sum_coef > 0:
                        importances_vals = importances_vals / sum_coef
                else:
                    importances_vals = np.ones(len(feature_names)) / len(feature_names)
                    
                # Predictions sample (limit to 50)
                for i in range(min(len(y_test), 50)):
                    predictions_data.append({
                        "id": i,
                        "actual": round(float(y_test[i]), 4),
                        "predicted": round(float(y_pred[i]), 4)
                    })
                    
            # Map features to importances
            importances_list = []
            for name, imp in zip(feature_names, importances_vals):
                importances_list.append({
                    "feature": name,
                    "importance": round(float(imp), 4)
                })
            importances_list = sorted(importances_list, key=lambda x: x['importance'], reverse=True)[:10]
            
            ml_summary = {
                "report_type": "ml",
                "task_type": task_type,
                "model_type": model_type,
                "target_column": target,
                "feature_columns": features,
                "metrics": metrics,
                "feature_importances": importances_list,
                "predictions_sample": predictions_data,
                "total_rows_trained": len(df_model)
            }
            # Hardcoded detailed Markdown Report (No AI)
            detailed_md_report = (
                f"# ML Model Diagnostics Report\n\n"
                f"**Task Type**: {task_type.title()}\n"
                f"**Model Type**: {model_type.replace('_', ' ').title()}\n"
                f"**Target**: {target}\n"
                f"**Total Training Rows**: {len(df_model)}\n\n"
                f"## Performance Metrics\n"
            )
            for k, v in metrics.items():
                detailed_md_report += f"- **{k.upper()}**: {v}\n"
            
            detailed_md_report += f"\n## Top Feature Importances\n"
            for f in importances_list[:5]:
                detailed_md_report += f"- **{f['feature']}**: {f['importance']}\n"
                
            ml_summary['markdown_report'] = detailed_md_report
            
            visuals_data = [
                {
                    "type": "MLModelPerformance",
                    "title": f"Model Diagnostics ({model_type.replace('_', ' ').title()})",
                    "description": f"Predicting '{target}' using {len(features)} features.",
                    "details": ml_summary
                }
            ]
            
            dax_data = [
                {
                    "name": "Model Details",
                    "formula": f"Alg: {model_type.upper()} | Trained on {len(df_model)} rows."
                },
                {
                    "name": "Target Profile",
                    "formula": f"Target: {target} | Unique Count: {df_model[target].nunique()}"
                }
            ]
            
            # 9. MODEL PERSISTENCE
            # The trained model is serialized using `joblib` into a `.pkl` file.
            # Its metadata (feature lists, encoding maps, task type) is saved to a `.json` file.
            # This allows the frontend 'Prediction Playground' to query the live model later via the `/predict/` endpoint.
            import joblib, json
            model_path = os.path.join(settings.BASE_DIR, 'media', f"{dataset.id}_model.pkl")
            meta_path  = os.path.join(settings.BASE_DIR, 'media', f"{dataset.id}_model_meta.json")
            joblib.dump(model, model_path)
            model_meta = {
                "feature_columns": features,
                "target_column": target,
                "task_type": task_type,
                "model_type": model_type,
                "feature_names_encoded": feature_names,
                "cat_features": cat_features,
                "cat_feature_options": cat_feature_options,
                "target_classes": target_classes,
            }
            with open(meta_path, 'w') as f:
                json.dump(model_meta, f)

            report_id = f"rep_{timezone.now().timestamp()}"
            report = Report.objects.create(
                user=request.user,
                id=report_id,
                title=f"ML Model Report: {target}",
                dataset=dataset.name,
                generated="Just now",
                report_type="ml",
                visuals_count=len(visuals_data),
                dax_count=len(dax_data),
                visuals_data=visuals_data,
                dax_data=dax_data
            )
            
            return Response({"report_id": report.id, "model_trained": True}, status=status.HTTP_201_CREATED)
            
        except Dataset.DoesNotExist:
            return Response({"error": "Dataset not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": f"Failed to train ML model: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MLModelPredictView(APIView):
    """Run a single prediction against the last trained model for a dataset."""

    def get(self, request, pk):
        """Return whether a trained model exists for this dataset and its metadata."""
        try:
            dataset = Dataset.objects.get(user=request.user, pk=pk)
        except Dataset.DoesNotExist:
            return Response({"error": "Dataset not found"}, status=status.HTTP_404_NOT_FOUND)

        import os, json
        from django.conf import settings
        meta_path = os.path.join(settings.BASE_DIR, 'media', f"{dataset.id}_model_meta.json")
        if not os.path.exists(meta_path):
            return Response({"model_exists": False})

        with open(meta_path) as f:
            meta = json.load(f)
        return Response({"model_exists": True, "meta": meta})

    def post(self, request, pk):
        """Run a prediction. Body: { "input": { column: value, ... } }"""
        try:
            dataset = Dataset.objects.get(user=request.user, pk=pk)
        except Dataset.DoesNotExist:
            return Response({"error": "Dataset not found"}, status=status.HTTP_404_NOT_FOUND)

        import os, json
        import numpy as np
        import joblib
        from django.conf import settings

        model_path = os.path.join(settings.BASE_DIR, 'media', f"{dataset.id}_model.pkl")
        meta_path  = os.path.join(settings.BASE_DIR, 'media', f"{dataset.id}_model_meta.json")

        if not os.path.exists(model_path) or not os.path.exists(meta_path):
            return Response({"error": "No trained model found for this dataset. Train a model first."}, status=status.HTTP_404_NOT_FOUND)

        with open(meta_path) as f:
            meta = json.load(f)

        user_input = request.data.get('input', {})
        feature_columns   = meta['feature_columns']
        feature_names_enc = meta['feature_names_encoded']
        cat_features      = meta['cat_features']
        task_type         = meta['task_type']
        target_classes    = meta.get('target_classes', [])

        # Validate all feature columns are provided
        for col in feature_columns:
            if col not in user_input:
                return Response({"error": f"Missing value for feature column: '{col}'"}, status=status.HTTP_400_BAD_REQUEST)

        # Build a one-row dataframe matching original feature columns
        row = {col: [user_input[col]] for col in feature_columns}
        row_df = pd.DataFrame(row)

        # Convert numeric columns to float (frontend sends strings)
        for col in feature_columns:
            if col not in cat_features:
                try:
                    row_df[col] = row_df[col].astype(float)
                except (ValueError, TypeError):
                    pass  # leave as-is; model will fail gracefully

        # Apply same dummy encoding
        row_encoded = pd.get_dummies(row_df, columns=cat_features, drop_first=True)

        # Align columns to training feature names (fill missing dummies with 0)
        for col in feature_names_enc:
            if col not in row_encoded.columns:
                row_encoded[col] = 0
        row_encoded = row_encoded[feature_names_enc]

        model = joblib.load(model_path)
        X_input = row_encoded.values

        try:
            raw_pred = model.predict(X_input)[0]
        except Exception as e:
            return Response({"error": f"Prediction failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if task_type == 'classification':
            if target_classes:
                # raw_pred is an integer index
                try:
                    label = target_classes[int(raw_pred)]
                except (IndexError, ValueError):
                    label = str(raw_pred)
            else:
                label = str(raw_pred)
            # Probability (if available)
            confidence = None
            if hasattr(model, 'predict_proba'):
                try:
                    proba = model.predict_proba(X_input)[0]
                    confidence = round(float(np.max(proba)) * 100, 1)
                except Exception:
                    pass
            return Response({
                "prediction": label,
                "task_type": "classification",
                "confidence": confidence,
                "target_column": meta['target_column'],
            })
        else:
            return Response({
                "prediction": round(float(raw_pred), 4),
                "task_type": "regression",
                "confidence": None,
                "target_column": meta['target_column'],
            })

class ReportShareView(APIView):
    def post(self, request, pk):
        try:
            report = Report.objects.get(user=request.user, pk=pk)
            import secrets
            if not report.share_token:
                report.share_token = secrets.token_urlsafe(16)
            report.is_public = True
            report.save()
            return Response({"share_token": report.share_token})
        except Report.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

class SharedReportView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, token):
        try:
            report = Report.objects.get(share_token=token, is_public=True)
            return Response({
                "id": report.id,
                "title": report.title,
                "dataset": report.dataset,
                "generated": report.generated,
                "report_type": report.report_type,
                "visuals_count": report.visuals_count,
                "dax_count": report.dax_count,
                "visuals_data": report.visuals_data,
                "dax_data": report.dax_data,
            })
        except Report.DoesNotExist:
            return Response({"error": "Shared report not found"}, status=status.HTTP_404_NOT_FOUND)

class CustomDashboardShareView(APIView):
    def post(self, request):
        try:
            data = request.data
            dataset_id = data.get('datasetId')
            layout = data.get('layout', 'grid-2x2')
            theme_style = data.get('themeStyle', 'default')
            theme_font = data.get('themeFont', 'sans')
            charts = data.get('charts')
            
            import secrets
            share_token = secrets.token_urlsafe(16)
            
            dashboard = CustomDashboard.objects.create(
                user=request.user,
                dataset_id=dataset_id,
                layout=layout,
                theme_style=theme_style,
                theme_font=theme_font,
                charts=charts,
                is_public=True,
                share_token=share_token
            )
            return Response({"share_token": dashboard.share_token})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SharedCustomDashboardView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, token):
        try:
            dashboard = CustomDashboard.objects.get(share_token=token, is_public=True)
            
            import os
            import pandas as pd
            from django.conf import settings
            file_path = os.path.join(settings.BASE_DIR, 'media', f"{dashboard.dataset_id}.csv")
            
            dataset_data = []
            columns = []
            if os.path.exists(file_path):
                df = pd.read_csv(file_path, nrows=500)
                df = df.where(pd.notnull(df), None)
                columns = list(df.columns)
                dataset_data = df.to_dict(orient='records')

            from .models import Dataset
            custom_measures = []
            try:
                ds = Dataset.objects.get(id=dashboard.dataset_id)
                custom_measures = ds.custom_measures
            except Exception:
                pass

            return Response({
                "dataset_id": dashboard.dataset_id,
                "layout": dashboard.layout,
                "theme_style": dashboard.theme_style,
                "theme_font": dashboard.theme_font,
                "charts": dashboard.charts,
                "columns": columns,
                "custom_measures": custom_measures,
                "data": dataset_data
            })
        except CustomDashboard.DoesNotExist:
            return Response({"error": "Shared dashboard not found"}, status=status.HTTP_404_NOT_FOUND)

class DatasetSchemaLayoutView(APIView):
    def get(self, request, pk):
        try:
            dataset = Dataset.objects.get(user=request.user, pk=pk)
            return Response(dataset.schema_layout)
        except Dataset.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, pk):
        try:
            dataset = Dataset.objects.get(user=request.user, pk=pk)
            dataset.schema_layout = request.data
            dataset.save()
            return Response({"success": True})
        except Dataset.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
