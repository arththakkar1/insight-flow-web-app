from django.urls import path
from .views import (
    CookieLoginView, CookieLogoutView, AuthCheckView,
    ChatMessageView, DatasetListView, DatasetDetailView, DatasetProfileView,
    DatasetCleaningView, DatasetCleaningApplyView, DatasetExportView,
    DatasetGenerateReportView, DatasetGenerateMLReportView, DatasetGenerateDashboardView, MLModelPredictView,
    DatasetDataView, DatasetSchemaLayoutView,
    ReportListView, ReportDetailView, ReportExportView,
    ModelSuggestionsView, DaxGeneratorView, RegisterView,
    ReportShareView, SharedReportView,
    CustomDashboardShareView, SharedCustomDashboardView
)

urlpatterns = [
    path('auth/login/',   CookieLoginView.as_view(),  name='cookie-login'),
    path('auth/logout/',  CookieLogoutView.as_view(), name='cookie-logout'),
    path('auth/check/',   AuthCheckView.as_view(),    name='auth-check'),
    path('register/', RegisterView.as_view(), name='register'),
    path('chat/messages/', ChatMessageView.as_view(), name='chat-messages'),
    path('datasets/', DatasetListView.as_view(), name='dataset-list'),
    path('datasets/<str:pk>/', DatasetDetailView.as_view(), name='dataset-detail'),
    path('datasets/<str:pk>/data/', DatasetDataView.as_view(), name='dataset-data'),
    path('datasets/<str:pk>/profile/', DatasetProfileView.as_view(), name='dataset-profile'),
    path('datasets/<str:pk>/cleaning/', DatasetCleaningView.as_view(), name='dataset-cleaning'),
    path('datasets/<str:pk>/cleaning/apply/', DatasetCleaningApplyView.as_view(), name='dataset-cleaning-apply'),
    path('datasets/<str:pk>/schema-layout/', DatasetSchemaLayoutView.as_view(), name='dataset-schema-layout'),
    path('datasets/<str:pk>/export/', DatasetExportView.as_view(), name='dataset-export'),
    path('datasets/<str:pk>/generate-report/', DatasetGenerateReportView.as_view(), name='dataset-generate-report'),
    path('datasets/<str:pk>/generate-ml-report/', DatasetGenerateMLReportView.as_view(), name='dataset-generate-ml-report'),
    path('datasets/<str:pk>/generate-dashboard/', DatasetGenerateDashboardView.as_view(), name='dataset-generate-dashboard'),
    path('datasets/<str:pk>/predict/', MLModelPredictView.as_view(), name='dataset-predict'),
    path('datasets/model-suggestions/', ModelSuggestionsView.as_view(), name='model-suggestions'),
    path('analytics/dax-generator/', DaxGeneratorView.as_view(), name='dax-generator'),
    path('reports/', ReportListView.as_view(), name='report-list'),
    path('reports/<str:pk>/', ReportDetailView.as_view(), name='report-detail'),
    path('reports/<str:pk>/export/', ReportExportView.as_view(), name='report-export'),
    path('reports/<str:pk>/share/', ReportShareView.as_view(), name='report-share'),
    path('shared/report/<str:token>/', SharedReportView.as_view(), name='shared-report'),
    
    path('dashboard/share/', CustomDashboardShareView.as_view(), name='dashboard-share'),
    path('shared/dashboard/<str:token>/', SharedCustomDashboardView.as_view(), name='shared-dashboard'),
]
