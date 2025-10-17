from django.contrib import admin
from django.urls import path, include
from api import views   # ✅ import views from the api app
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),  # ✅ keep all API routes here

    # JWT Authentication endpoints
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # ❌ These two are redundant if you already defined them in api/urls.py
    # path("profile/", views.profile, name="profile"),
    # path("search-address/", views.search_address, name="search_address"),
]
