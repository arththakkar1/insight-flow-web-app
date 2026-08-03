import os
import json
import uuid
import pandas as pd
from unittest.mock import patch
from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings
from api.models import Dataset, DatasetColumn, CleaningRecommendation, Report, CustomDashboard

class AuthAPITestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username="testuser", password="password123")

    def test_register(self):
        response = self.client.post('/api/auth/register/', {'username': 'newuser', 'password': 'password123'}, content_type='application/json')
        self.assertEqual(response.status_code, 201)

    def test_login(self):
        response = self.client.post('/api/auth/login/', {'username': 'testuser', 'password': 'password123'}, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('access_token', response.cookies)

    def test_auth_check(self):
        self.client.login(username='testuser', password='password123')
        response = self.client.post('/api/auth/login/', {'username': 'testuser', 'password': 'password123'}, content_type='application/json')
        self.client.cookies = response.cookies
        res = self.client.get('/api/auth/check/')
        self.assertEqual(res.status_code, 200)

    def test_logout(self):
        response = self.client.post('/api/auth/login/', {'username': 'testuser', 'password': 'password123'}, content_type='application/json')
        self.client.cookies = response.cookies
        res = self.client.post('/api/auth/logout/')
        self.assertEqual(res.status_code, 200)

class DatasetAPITestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username="testuser", password="password123")
        response = self.client.post('/api/auth/login/', {'username': 'testuser', 'password': 'password123'}, content_type='application/json')
        self.client.cookies = response.cookies
        self.dataset = Dataset.objects.create(
            user=self.user,
            id="ds_123",
            name="test.csv",
            rows_count=100,
            columns_count=2,
            status="uploaded",
            missing_values=1
        )
        DatasetColumn.objects.create(dataset=self.dataset, name="col1", type="integer")
        CleaningRecommendation.objects.create(
            dataset=self.dataset,
            recommendation_id="rec_1",
            column="col1",
            issue="missing values",
            recommendation="fill median",
            action_type="fill_median"
        )
        
        # Create dummy CSV file
        os.makedirs(os.path.join(settings.BASE_DIR, 'media'), exist_ok=True)
        self.file_path = os.path.join(settings.BASE_DIR, 'media', f"{self.dataset.id}.csv")
        df = pd.DataFrame({'col1': [1, None, 3], 'col2': ['a', 'b', 'c']})
        df.to_csv(self.file_path, index=False)

    def tearDown(self):
        if os.path.exists(self.file_path):
            os.remove(self.file_path)

    def test_get_datasets(self):
        response = self.client.get('/api/datasets/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.json()) > 0)

    def test_upload_dataset(self):
        csv_content = b"col1,col2\n1,a\n2,b\n3,c"
        csv_file = SimpleUploadedFile("upload_test.csv", csv_content, content_type="text/csv")
        response = self.client.post('/api/datasets/', {'file': csv_file})
        self.assertEqual(response.status_code, 201)
        dataset_id = response.json().get('id')
        self.assertIsNotNone(dataset_id)
        # Cleanup
        uploaded_path = os.path.join(settings.BASE_DIR, 'media', f"{dataset_id}.csv")
        if os.path.exists(uploaded_path):
            os.remove(uploaded_path)

    def test_get_dataset_detail(self):
        response = self.client.get(f'/api/datasets/{self.dataset.id}/')
        self.assertEqual(response.status_code, 200)

    def test_patch_dataset_detail(self):
        response = self.client.patch(f'/api/datasets/{self.dataset.id}/', data=json.dumps({"custom_measures": [{"name": "Test"}]}), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.dataset.refresh_from_db()
        self.assertEqual(self.dataset.custom_measures[0]['name'], 'Test')

    def test_delete_dataset(self):
        response = self.client.delete(f'/api/datasets/{self.dataset.id}/')
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Dataset.objects.filter(id=self.dataset.id).exists())
        self.assertFalse(os.path.exists(self.file_path))
        
    def test_dataset_data(self):
        response = self.client.get(f'/api/datasets/{self.dataset.id}/data/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['data']), 3)

    def test_dataset_profile(self):
        response = self.client.post(f'/api/datasets/{self.dataset.id}/profile/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['total_rows'], 100)

    def test_dataset_cleaning(self):
        response = self.client.get(f'/api/datasets/{self.dataset.id}/cleaning/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['recommendations']), 1)

    def test_dataset_cleaning_apply(self):
        response = self.client.post(f'/api/datasets/{self.dataset.id}/cleaning/apply/', data=json.dumps({"recommendation_id": "rec_1"}), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        # Verify CSV updated
        df = pd.read_csv(self.file_path)
        self.assertFalse(df['col1'].isnull().any())
        self.dataset.refresh_from_db()
        self.assertFalse(self.dataset.recommendations.exists())

    def test_dataset_schema_layout(self):
        response = self.client.get(f'/api/datasets/{self.dataset.id}/schema-layout/')
        self.assertEqual(response.status_code, 200)

    def test_dataset_export(self):
        response = self.client.get(f'/api/datasets/{self.dataset.id}/export/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'text/csv')

class LLMAPITestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username="testuser", password="password123")
        response = self.client.post('/api/auth/login/', {'username': 'testuser', 'password': 'password123'}, content_type='application/json')
        self.client.cookies = response.cookies
        self.dataset = Dataset.objects.create(user=self.user, id="ds_123", name="test.csv")
        DatasetColumn.objects.create(dataset=self.dataset, name="col1", type="integer")
        
        import os
        import pandas as pd
        from django.conf import settings
        os.makedirs(os.path.join(settings.BASE_DIR, 'media'), exist_ok=True)
        self.file_path = os.path.join(settings.BASE_DIR, 'media', f"{self.dataset.id}.csv")
        df = pd.DataFrame({'col1': [1, 2, 3, 4, 5, 6], 'col2': [4, 5, 6, 7, 8, 9]})
        df.to_csv(self.file_path, index=False)
        
    def tearDown(self):
        import os
        if os.path.exists(self.file_path):
            os.remove(self.file_path)
        
    @patch('api.views.OpenRouterClient')
    def test_generate_report(self, MockClient):
        mock_instance = MockClient.return_value
        mock_instance.generate_report_config.return_value = json.dumps({
            "visuals_data": [{"type": "Bar", "title": "Test Bar"}],
            "dax_data": [{"name": "Sum", "formula": "SUM(col1)"}]
        })
        mock_instance.generate_detailed_bi_report.return_value = "# Report"
        
        response = self.client.post(f'/api/datasets/{self.dataset.id}/generate-report/')
        self.assertEqual(response.status_code, 201)
        self.assertIn('report_id', response.json())

    @patch('api.views.OpenRouterClient')
    def test_generate_ml_report(self, MockClient):
        mock_instance = MockClient.return_value
        mock_instance.generate_detailed_markdown_report.return_value = "Test ML Report Markdown"
        
        response = self.client.post(f'/api/datasets/{self.dataset.id}/generate-ml-report/', data=json.dumps({"target": "col2", "features": ["col1"]}), content_type="application/json")
        if response.status_code != 201:
            print("ML Report Error:", response.json())
        self.assertEqual(response.status_code, 201)

    @patch('api.views.OpenRouterClient')
    def test_generate_dashboard(self, MockClient):
        mock_instance = MockClient.return_value
        mock_instance.generate_dashboard_config.return_value = json.dumps({
            "layout": "grid", "charts": []
        })
        
        response = self.client.post(f'/api/datasets/{self.dataset.id}/generate-dashboard/')
        self.assertEqual(response.status_code, 200)

    @patch('api.views.OpenRouterClient')
    def test_model_suggestions(self, MockClient):
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.return_value = json.dumps({"suggestions": []})
        
        response = self.client.post('/api/datasets/model-suggestions/', data=json.dumps({"dataset_info": "info"}), content_type="application/json")
        self.assertEqual(response.status_code, 200)

    @patch('api.views.OpenRouterClient')
    def test_dax_generator(self, MockClient):
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.return_value = "SUM(Table[Column])"
        
        response = self.client.post('/api/analytics/dax-generator/', data=json.dumps({"prompt": "sum"}), content_type="application/json")
        self.assertEqual(response.status_code, 200)

    @patch('api.views.OpenRouterClient')
    def test_chat_message(self, MockClient):
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.return_value = "Hello"
        
        response = self.client.post('/api/chat/messages/', data=json.dumps({"message": "hi", "history": []}), content_type="application/json")
        self.assertEqual(response.status_code, 200)

class ReportDashboardTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username="testuser", password="password123")
        response = self.client.post('/api/auth/login/', {'username': 'testuser', 'password': 'password123'}, content_type='application/json')
        self.client.cookies = response.cookies
        
        self.dataset = Dataset.objects.create(user=self.user, id="ds_456", name="test2.csv")
        self.report = Report.objects.create(user=self.user, id="rep_1", title="Rep1", dataset="ds_456", share_token="tok1", is_public=True)
        self.dash = CustomDashboard.objects.create(user=self.user, dataset_id="ds_456", share_token="tok2", is_public=True)

    def test_get_reports(self):
        response = self.client.get('/api/reports/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_get_report_detail(self):
        response = self.client.get(f'/api/reports/{self.report.id}/')
        self.assertEqual(response.status_code, 200)

    def test_delete_report(self):
        response = self.client.delete('/api/reports/', data=json.dumps({"ids": [self.report.id]}), content_type="application/json")
        self.assertEqual(response.status_code, 204)

    def test_export_report(self):
        response = self.client.get(f'/api/reports/{self.report.id}/export/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')

    def test_share_report(self):
        response = self.client.post(f'/api/reports/{self.report.id}/share/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('share_token', response.json())

    def test_shared_report_public(self):
        client2 = Client()
        response = client2.get('/api/shared/report/tok1/')
        self.assertEqual(response.status_code, 200)

    def test_share_dashboard(self):
        response = self.client.post('/api/dashboard/share/', data=json.dumps({
            "datasetId": "ds_456",
            "layout": "grid-2x2",
            "charts": []
        }), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertIn('share_token', response.json())

    def test_shared_dashboard_public(self):
        client2 = Client()
        response = client2.get('/api/shared/dashboard/tok2/')
        self.assertEqual(response.status_code, 200)
