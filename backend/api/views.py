from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .llm_client import OpenRouterClient
from .models import Dataset, DatasetColumn, CleaningRecommendation, Report
from django.utils import timezone
import pandas as pd



class DatasetListView(APIView):
    def get(self, request):
        datasets = Dataset.objects.all().values()
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
            
            new_ds = Dataset.objects.create(
                id=f"ds_{timezone.now().timestamp()}",
                name=file_obj.name,
                rows_count=rows_count,
                columns_count=columns_count,
                status="Uploaded",
                missing_values=missing_values,
                duplicate_rows=duplicate_rows
            )
            
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
                        # Try parsing dates
                        try:
                            # If at least 80% of the sample parses as datetime, suggest date standardizing
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
                                continue # Skip label checking if it's a date
                        except Exception:
                            pass
                            
                        # Check for label inconsistencies
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
                
            if new_ds.recommendations.exists():
                new_ds.status = "Needs Profiling"
            else:
                new_ds.status = "Cleaned"
            new_ds.save()
            
            # Save the dataframe to a media directory to preserve the real data!
            import os
            from django.conf import settings
            media_dir = os.path.join(settings.BASE_DIR, 'media')
            os.makedirs(media_dir, exist_ok=True)
            df.to_csv(os.path.join(media_dir, f"{new_ds.id}.csv"), index=False)
            
            return Response({"id": new_ds.id, "name": new_ds.name, "status": new_ds.status}, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({"error": f"Failed to parse file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        ids = request.data.get("ids", [])
        delete_all = request.data.get("delete_all", False)
        
        import os
        from django.conf import settings
        
        if delete_all:
            datasets = Dataset.objects.all()
        else:
            datasets = Dataset.objects.filter(id__in=ids)
            
        for dataset in datasets:
            file_path = os.path.join(settings.BASE_DIR, 'media', f"{dataset.id}.csv")
            if os.path.exists(file_path):
                os.remove(file_path)
            dataset.delete()
            
        return Response(status=status.HTTP_204_NO_CONTENT)

class DatasetDetailView(APIView):
    def get(self, request, pk):
        try:
            dataset = Dataset.objects.get(pk=pk)
            
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
                "preview_rows": preview_rows
            })
        except Dataset.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            dataset = Dataset.objects.get(pk=pk)
            import os
            from django.conf import settings
            file_path = os.path.join(settings.BASE_DIR, 'media', f"{dataset.id}.csv")
            if os.path.exists(file_path):
                os.remove(file_path)
            dataset.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Dataset.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

class DatasetGenerateReportView(APIView):
    def post(self, request, pk):
        try:
            dataset = Dataset.objects.get(pk=pk)
            from django.utils import timezone
            
            columns = list(dataset.columns.all())
            numeric_cols = [c.name for c in columns if c.type in ['integer', 'float']]
            categorical_cols = [c.name for c in columns if c.type not in ['integer', 'float']]
            
            visuals_data = []
            dax_data = []
            
            dataset_info = f"Dataset: {dataset.name}, Rows: {dataset.rows_count}, Columns: " + ", ".join([f"{c.name} ({c.type})" for c in columns])
            
            try:
                import json
                import re
                client = OpenRouterClient()
                json_str = client.generate_report_config(dataset_info)
                
                # Try to extract JSON if it is wrapped in markdown blocks
                json_match = re.search(r'```json\s*(\{.*?\})\s*```', json_str, re.DOTALL)
                if json_match:
                    json_str = json_match.group(1)
                else:
                    json_match = re.search(r'(\{.*\})', json_str, re.DOTALL)
                    if json_match:
                        json_str = json_match.group(1)
                
                data = json.loads(json_str)
                visuals_data = data.get("visuals_data", [])
                dax_data = data.get("dax_data", [])
            except Exception as e:
                print(f"LLM Report Generation failed: {str(e)}")
                # Fallback to hardcoded logic
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
                    
            report_id = f"rep_{timezone.now().timestamp()}"
            report = Report.objects.create(
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
            dataset = Dataset.objects.get(pk=pk)
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
            dataset = Dataset.objects.get(pk=pk)
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
            dataset = Dataset.objects.get(pk=pk)
            rec = CleaningRecommendation.objects.get(dataset=dataset, recommendation_id=rec_id)
            
            # Apply logic: update dataset stats and delete recommendation
            import os
            import pandas as pd
            from django.conf import settings
            file_path = os.path.join(settings.BASE_DIR, 'media', f"{dataset.id}.csv")
            df = None
            if os.path.exists(file_path):
                df = pd.read_csv(file_path)
                
            if rec.action_type == "fill_median":
                if df is not None and rec.column in df.columns:
                    if pd.api.types.is_numeric_dtype(df[rec.column]):
                        df[rec.column] = df[rec.column].fillna(df[rec.column].median())
                    df.to_csv(file_path, index=False)
                    
            elif rec.action_type == "fill_mode":
                if df is not None and rec.column in df.columns:
                    mode_val = df[rec.column].mode()[0] if not df[rec.column].mode().empty else 'Unknown'
                    df[rec.column] = df[rec.column].fillna(mode_val)
                    df.to_csv(file_path, index=False)
                    
            elif rec.action_type == "handle_outliers":
                if df is not None and rec.column in df.columns:
                    q1 = df[rec.column].quantile(0.25)
                    q3 = df[rec.column].quantile(0.75)
                    iqr = q3 - q1
                    lower_bound = q1 - 1.5 * iqr
                    upper_bound = q3 + 1.5 * iqr
                    df[rec.column] = df[rec.column].clip(lower=lower_bound, upper=upper_bound)
                    df.to_csv(file_path, index=False)
                    
            elif rec.action_type == "standardize_dates":
                if df is not None and rec.column in df.columns:
                    df[rec.column] = pd.to_datetime(df[rec.column], errors='coerce').dt.strftime('%Y-%m-%d')
                    df.to_csv(file_path, index=False)
                    
            elif rec.action_type == "standardize_labels":
                if df is not None and rec.column in df.columns:
                    df[rec.column] = df[rec.column].astype(str).str.title().str.strip()
                    df.to_csv(file_path, index=False)
                    
            elif rec.action_type == "drop_duplicates":
                if df is not None:
                    df = df.drop_duplicates()
                    df.to_csv(file_path, index=False)
            
            # ACCURATELY recalculate stats
            if df is not None:
                dataset.missing_values = int(df.isnull().sum().sum())
                dataset.rows_count = len(df)
                dataset.duplicate_rows = int(df.duplicated().sum())
            
            rec.delete()
            if not dataset.recommendations.exists() and dataset.missing_values == 0:
                dataset.status = "Cleaned"
            dataset.save()
            
            return Response({"success": True, "dataset_id": dataset.id, "message": f"Applied {rec_id} successfully."})
        except (Dataset.DoesNotExist, CleaningRecommendation.DoesNotExist):
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

class ReportListView(APIView):
    def get(self, request):
        reports = Report.objects.all().values('id', 'title', 'dataset', 'generated', 'visuals_count', 'dax_count')
        return Response(list(reports))

    def delete(self, request):
        ids = request.data.get("ids", [])
        delete_all = request.data.get("delete_all", False)
        
        if delete_all:
            Report.objects.all().delete()
        else:
            Report.objects.filter(id__in=ids).delete()
            
        return Response(status=status.HTTP_204_NO_CONTENT)

class ReportDetailView(APIView):
    def get(self, request, pk):
        try:
            report = Report.objects.get(pk=pk)
            return Response({
                "id": report.id,
                "title": report.title,
                "dataset": report.dataset,
                "generated": report.generated,
                "visuals_count": report.visuals_count,
                "dax_count": report.dax_count,
                "visuals_data": report.visuals_data,
                "dax_data": report.dax_data
            })
        except Report.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            report = Report.objects.get(pk=pk)
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
        datasets = Dataset.objects.all()
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
            "You are InsightFlow AI Analytics Assistant. Provide helpful analysis, DAX formulas, or data cleaning advice.\n"
            "You have direct knowledge of the user's workspace. Here is the context:\n\n"
            f"{dataset_context}\n"
            "IMPORTANT INSTRUCTION FOR ACTIONS:\n"
            "If the user explicitly asks you to clean a specific dataset, you MUST execute the cleaning process by including the following exact phrase at the very end of your response:\n"
            "[ACTION: CLEAN_DATASET: dataset_name]\n"
            "Replace dataset_name with the exact name of the dataset from the context."
        )

        client = OpenRouterClient()
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
        
        try:
            reply = client.generate_chat_response(messages)
            
            import re
            action_match = re.search(r'\[ACTION: CLEAN_DATASET: (.*?)\]', reply)
            if action_match:
                dataset_name = action_match.group(1).strip()
                dataset = Dataset.objects.filter(name__icontains=dataset_name).first()
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
            dataset = Dataset.objects.get(pk=pk)
            
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
            report = Report.objects.get(pk=pk)
            
            response = HttpResponse(
                content_type='text/csv',
                headers={'Content-Disposition': f'attachment; filename="Report_{report.title}.csv"'},
            )
            
            writer = csv.writer(response)
            writer.writerow(['Report Title', report.title])
            writer.writerow(['Dataset', report.dataset])
            writer.writerow(['Generated', report.generated])
            writer.writerow(['Visuals Count', report.visuals_count])
            writer.writerow(['DAX Measures Count', report.dax_count])
            writer.writerow([])
            writer.writerow(['Sample Generated DAX Measures'])
            writer.writerow(['Measure Name', 'Formula'])
            writer.writerow(['Total Sales', "SUM('Sales'[Amount])"])
            writer.writerow(['YTD Sales', "CALCULATE([Total Sales], DATESYTD('Date'[Date]))"])
            writer.writerow(['Profit Margin %', "DIVIDE(SUM('Sales'[Profit]), [Total Sales], 0)"])
            
            return response
            
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
