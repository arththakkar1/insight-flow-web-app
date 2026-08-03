import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'insight_flow.settings')
django.setup()
from api.models import CustomDashboard, Dataset
dashboards = CustomDashboard.objects.all()
for d in dashboards:
    ds = Dataset.objects.filter(id=d.dataset_id).first()
    print(d.dataset_id, type(ds.custom_measures) if ds else "No dataset")
