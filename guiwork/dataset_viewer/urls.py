from django.urls import path
from django.conf.urls import include
from . import views

app_name = 'dataset_viewer'

urlpatterns = [
    path('rest', views.DatasetViewer.as_view()),
]