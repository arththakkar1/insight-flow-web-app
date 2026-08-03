import os
import django
import uuid
import random
import csv
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Dataset, DatasetColumn, CleaningRecommendation, Report, CustomDashboard

def generate_csv(file_path, num_rows):
    # Dummy data generation for the CSV
    with open(file_path, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['OrderID', 'CustomerName', 'Amount', 'Date', 'Category'])
        categories = ['Electronics', 'Furniture', 'Clothing', 'Books', 'Toys']
        for i in range(1, num_rows + 1):
            date_val = (datetime.now() - timedelta(days=random.randint(0, 365))).strftime('%Y-%m-%d')
            writer.writerow([
                i,
                f"Customer_{random.randint(1, 1000)}",
                round(random.uniform(10.0, 500.0), 2),
                date_val,
                random.choice(categories)
            ])

def run():
    print("Clearing existing data...")
    CustomDashboard.objects.all().delete()
    Report.objects.all().delete()
    CleaningRecommendation.objects.all().delete()
    DatasetColumn.objects.all().delete()
    Dataset.objects.all().delete()
    # Instead of deleting the testuser, we will fetch or create "Arth Thakkar"
    # Ensure media directory exists
    media_dir = os.path.join(os.path.dirname(__file__), 'media')
    if not os.path.exists(media_dir):
        os.makedirs(media_dir)

    print("Fetching or creating your personal user...")
    user, created = User.objects.get_or_create(username="Arth Thakkar")
    user.email = "arth@example.com"
    user.set_password("Abhi@124421")
    user.save()

    print("Generating 20 dummy datasets for Arth Thakkar...")
    dataset_names = ["sales_data", "user_activity", "inventory_logs", "website_traffic", "financial_records", 
                     "customer_feedback", "employee_stats", "marketing_campaigns", "sensor_data", "app_usage"]
    
    datasets = []
    
    for i in range(20):
        ds_id = f"ds_{uuid.uuid4().hex[:8]}"
        base_name = random.choice(dataset_names)
        ds_name = f"{base_name}_202{random.randint(0, 4)}.csv"
        rows_count = random.randint(100, 2000)
        missing = random.randint(0, 50)
        duplicates = random.randint(0, 10)
        
        # Create DB record
        dataset = Dataset.objects.create(
            user=user,
            id=ds_id,
            name=ds_name,
            rows_count=rows_count,
            columns_count=5,
            status="cleaned",
            missing_values=missing,
            duplicate_rows=duplicates,
            schema_layout={"nodes": [], "edges": []},
            custom_measures=[{"name": "Total Amount", "formula": "SUM(Table[Amount])"}]
        )
        datasets.append(dataset)

        # Create Physical CSV file
        generate_csv(os.path.join(media_dir, f"{ds_id}.csv"), rows_count)

        # Create Columns
        DatasetColumn.objects.create(dataset=dataset, name="OrderID", type="integer", unique_values=rows_count, missing_count=0)
        DatasetColumn.objects.create(dataset=dataset, name="CustomerName", type="string", unique_values=random.randint(50, rows_count), missing_count=0)
        DatasetColumn.objects.create(dataset=dataset, name="Amount", type="float", unique_values=random.randint(50, rows_count), missing_count=random.randint(0, 5))
        DatasetColumn.objects.create(dataset=dataset, name="Date", type="datetime", unique_values=random.randint(10, 300), missing_count=0)
        DatasetColumn.objects.create(dataset=dataset, name="Category", type="string", unique_values=5, missing_count=random.randint(0, 5))

        # Create cleaning recommendations if missing values exist
        if missing > 0:
            CleaningRecommendation.objects.create(
                dataset=dataset,
                recommendation_id=f"clean_{ds_id}_1",
                column="Amount",
                issue=f"{missing} missing values",
                recommendation="Fill missing values with mean",
                action_type="fill_mean"
            )

    print("Creating dummy reports, dashboards, and ML models...")
    for i in range(20):
        ds = datasets[i % len(datasets)]
        
        # 1. Dummy BI Report
        Report.objects.create(
            user=user,
            id=f"rep_{uuid.uuid4().hex[:8]}",
            title=f"Insight Report for {ds.name}",
            dataset=ds.name,
            report_type="bi",
            visuals_count=2,
            dax_count=1,
            visuals_data=[{"type": "Bar", "title": "Amount by Category"}],
            dax_data=[{"name": "Total", "formula": "SUM(Amount)"}],
            is_public=True,
            share_token=str(uuid.uuid4())
        )
        
        # 2. Dummy ML Model
        is_classification = random.choice([True, False])
        metrics = (
            {"accuracy": random.uniform(0.7, 0.99), "precision": random.uniform(0.7, 0.99), "recall": random.uniform(0.7, 0.99), "f1_score": random.uniform(0.7, 0.99)}
            if is_classification else
            {"r2_score": random.uniform(0.5, 0.95), "mae": random.uniform(2.0, 50.0), "mse": random.uniform(10.0, 200.0), "rmse": random.uniform(3.0, 15.0)}
        )
        
        Report.objects.create(
            user=user,
            id=f"rep_{uuid.uuid4().hex[:8]}",
            title=f"Predictive Model for {ds.name}",
            dataset=ds.name,
            report_type="ml",
            visuals_count=1,
            dax_count=0,
            visuals_data=[
                {
                    "type": "MLModelPerformance",
                    "details": {
                        "model_type": random.choice(["Random_Forest", "Gradient_Boosting", "Logistic_Regression"]),
                        "task_type": "classification" if is_classification else "regression",
                        "target_column": "Amount",
                        "total_rows_trained": ds.rows_count,
                        "metrics": metrics,
                        "feature_importances": [
                            {"feature": "Category", "importance": random.uniform(0.4, 0.8)},
                            {"feature": "Date", "importance": random.uniform(0.1, 0.3)}
                        ],
                        "predictions_sample": [
                            {"id": 1, "actual": 100, "predicted": 105, "correct": False},
                            {"id": 2, "actual": "Electronics", "predicted": "Electronics", "correct": True}
                        ]
                    }
                }
            ],
            dax_data=[],
            is_public=False
        )

        # 3. Dummy Dashboard
        CustomDashboard.objects.create(
            user=user,
            dataset_id=ds.id,
            layout="grid-2x2",
            theme_style=random.choice(["default", "ocean", "dark"]),
            theme_font="sans",
            charts=[{"id": str(uuid.uuid4()), "type": "Bar", "xAxis": "Category", "yAxis": "Amount"}],
            is_public=True,
            share_token=str(uuid.uuid4())
        )

    print("Seed data (20 Datasets, 20 BI Reports, 20 ML Models, 20 Dashboards) generated successfully.")

if __name__ == '__main__':
    run()
