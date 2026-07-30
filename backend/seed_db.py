import os
import django
import uuid

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Dataset, DatasetColumn, CleaningRecommendation, Report, CustomDashboard

def run():
    print("Clearing existing data...")
    CustomDashboard.objects.all().delete()
    Report.objects.all().delete()
    CleaningRecommendation.objects.all().delete()
    DatasetColumn.objects.all().delete()
    Dataset.objects.all().delete()
    User.objects.filter(username="testuser").delete()

    print("Creating test user...")
    user = User.objects.create_user(username="testuser", email="test@example.com", password="password123")

    print("Creating dummy dataset...")
    dataset = Dataset.objects.create(
        user=user,
        id="ds_12345",
        name="sales_data_2023.csv",
        rows_count=1000,
        columns_count=5,
        status="cleaned",
        missing_values=10,
        duplicate_rows=2,
        schema_layout={"nodes": [], "edges": []},
        custom_measures=[{"name": "Total Sales", "formula": "SUM(Sales[Amount])"}]
    )

    print("Creating dataset columns...")
    DatasetColumn.objects.create(dataset=dataset, name="OrderID", type="integer", unique_values=1000, missing_count=0)
    DatasetColumn.objects.create(dataset=dataset, name="CustomerName", type="string", unique_values=800, missing_count=0)
    DatasetColumn.objects.create(dataset=dataset, name="Amount", type="float", unique_values=500, missing_count=5)
    DatasetColumn.objects.create(dataset=dataset, name="Date", type="datetime", unique_values=300, missing_count=0)
    DatasetColumn.objects.create(dataset=dataset, name="Category", type="string", unique_values=10, missing_count=5)

    print("Creating cleaning recommendations...")
    CleaningRecommendation.objects.create(
        dataset=dataset,
        recommendation_id="clean_amt_1",
        column="Amount",
        issue="5 missing values",
        recommendation="Fill missing values with mean",
        action_type="fill_mean"
    )
    CleaningRecommendation.objects.create(
        dataset=dataset,
        recommendation_id="clean_cat_1",
        column="Category",
        issue="5 missing values",
        recommendation="Fill missing values with mode",
        action_type="fill_mode"
    )

    print("Creating dummy report...")
    Report.objects.create(
        user=user,
        id="rep_123",
        title="Annual Sales Report",
        dataset=dataset.name,
        report_type="bi",
        visuals_count=2,
        dax_count=1,
        visuals_data=[{"type": "Bar", "title": "Sales by Category"}],
        dax_data=[{"name": "Total Sales", "formula": "SUM(Amount)"}],
        is_public=True,
        share_token=str(uuid.uuid4())
    )

    print("Creating dummy dashboard...")
    CustomDashboard.objects.create(
        user=user,
        dataset_id=dataset.id,
        layout="grid-2x2",
        theme_style="ocean",
        theme_font="sans",
        charts=[{"id": "1", "type": "Bar", "xAxis": "Category", "yAxis": "Amount"}],
        is_public=True,
        share_token=str(uuid.uuid4())
    )

    print("Seed data generated successfully.")

if __name__ == '__main__':
    run()
