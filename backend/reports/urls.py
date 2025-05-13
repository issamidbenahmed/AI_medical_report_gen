from django.urls import path
from .views import ReportViewSet, GenerateReportView

urlpatterns = [
    path('', ReportViewSet.as_view({'get': 'list'}), name='report-list'),
    path('<int:pk>/', ReportViewSet.as_view({'get': 'retrieve'}), name='report-detail'),
    path('generate/', GenerateReportView.as_view(), name='report-generate'),
] 