from django.db import models

class Dataset(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    rows_count = models.IntegerField(default=0)
    columns_count = models.IntegerField(default=0)
    status = models.CharField(max_length=50, default="uploaded")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    missing_values = models.IntegerField(default=0)
    duplicate_rows = models.IntegerField(default=0)

    def __str__(self):
        return self.name

class DatasetColumn(models.Model):
    dataset = models.ForeignKey(Dataset, related_name='columns', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    unique_values = models.IntegerField(default=0)
    missing_count = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.dataset.name} - {self.name}"

class CleaningRecommendation(models.Model):
    dataset = models.ForeignKey(Dataset, related_name='recommendations', on_delete=models.CASCADE)
    recommendation_id = models.CharField(max_length=100)
    column = models.CharField(max_length=255)
    issue = models.CharField(max_length=255)
    recommendation = models.CharField(max_length=255)
    action_type = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.dataset.name} - {self.recommendation_id}"

class Report(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    title = models.CharField(max_length=255)
    dataset = models.CharField(max_length=255)
    generated = models.CharField(max_length=100, default="Just now")
    visuals_count = models.IntegerField(default=3)
    dax_count = models.IntegerField(default=3)
    visuals_data = models.JSONField(default=list)
    dax_data = models.JSONField(default=list)

    def __str__(self):
        return self.title
