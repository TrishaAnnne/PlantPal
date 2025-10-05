from django.urls import path
from . import views

urlpatterns = [
    path("login/", views.login, name="login"),
    path("signup/", views.signup, name="signup"),
    path("profile/", views.profile, name="profile"),
    path("search-address/", views.search_address, name="search_address"),
    path("update_profile/", views.update_profile, name="update_profile"),  # ✅ add this line
]
