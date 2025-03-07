from django.contrib import admin
from django.urls import include, path
from .views import *

urlpatterns = [
    path('get_global_event/', GetGlobalEventView.as_view()),

]
