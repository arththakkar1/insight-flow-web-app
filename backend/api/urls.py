from django.urls import path
from .views import (
    CookieLoginView, CookieLogoutView, AuthCheckView,
    ChatMessageView, DatasetListView, DatasetDetailView, DatasetProfileView,
    DatasetCleaningView, DatasetCleaningApplyView, DatasetExportView,
    DatasetGenerateReportView, DatasetGenerateMLReportView,
    ReportListView, ReportDetailView, ReportExportView,
    ModelSuggestionsView, DaxGeneratorView, RegisterView
)

urlpatterns = [
    path('auth/login/',   CookieLoginView.as_view(),  name='cookie-login'),
    path('auth/logout/',  CookieLogoutView.as_view(), name='cookie-logout'),
    path('auth/check/',   AuthCheckView.as_view(),    name='auth-check'),
    path('register/', RegisterView.as_view(), name='register'),
    path('chat/messages/', ChatMessageView.as_view(), name='chat-messages'),
    path('datasets/', DatasetListView.as_view(), name='dataset-list'),
    path('datasets/<str:pk>/', DatasetDetailView.as_view(), name='dataset-detail'),
    path('datasets/<str:pk>/profile/', DatasetProfileView.as_view(), name='dataset-profile'),
    path('datasets/<str:pk>/cleaning/', DatasetCleaningView.as_view(), name='dataset-cleaning'),
    path('datasets/<str:pk>/cleaning/apply/', DatasetCleaningApplyView.as_view(), name='dataset-cleaning-apply'),
    path('datasets/<str:pk>/export/', DatasetExportView.as_view(), name='dataset-export'),
    path('datasets/<str:pk>/generate-report/', DatasetGenerateReportView.as_view(), name='dataset-generate-report'),
    path('datasets/<str:pk>/generate-ml-report/', DatasetGenerateMLReportView.as_view(), name='dataset-generate-ml-report'),
    path('datasets/model-suggestions/', ModelSuggestionsView.as_view(), name='model-suggestions'),
    path('analytics/dax-generator/', DaxGeneratorView.as_view(), name='dax-generator'),
    path('reports/', ReportListView.as_view(), name='report-list'),
    path('reports/<str:pk>/', ReportDetailView.as_view(), name='report-detail'),
    path('reports/<str:pk>/export/', ReportExportView.as_view(), name='report-export'),
]
