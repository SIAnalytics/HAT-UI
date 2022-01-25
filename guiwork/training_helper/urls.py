from django.urls import path
from django.conf.urls import include
from . import views

app_name = 'training_helper'

urlpatterns = [
    path('rest', views.TrainingHelper.as_view()),
]
