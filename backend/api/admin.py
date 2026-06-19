from django.contrib import admin
from .models import Dataset, DatasetColumn, CleaningRecommendation, Report

admin.site.register(Dataset)
admin.site.register(DatasetColumn)
admin.site.register(CleaningRecommendation)
admin.site.register(Report)
