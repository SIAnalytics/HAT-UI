from django.urls import path
from django.conf.urls import include
from django.conf import settings
from . import views

app_name = 'common'

urlpatterns = [
    path('rest', views.Common.as_view()),
]
