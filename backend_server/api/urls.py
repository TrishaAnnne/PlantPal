from django.urls import path
from . import views

urlpatterns = [
    path("login/", views.login, name="login"),
    path("signup/", views.signup, name="signup"),
    path("profile/", views.profile, name="profile"),
    path("search-address/", views.search_address, name="search_address"),
    path("update_profile/", views.update_profile, name="update_profile"), 
    path('api/search_plants/', views.search_plants, name='search_plants'), # ✅ add this line

     # ✅ new route for PlantPal Web
    path('admin-signup/', views.admin_signup, name='admin_signup'),
    path('refresh_token/', views.refresh_token, name='refresh_token'),
    path("admin_login/", views.admin_login, name="admin_login"),
    path("add_plant/", views.add_plant, name="add_plant"),
    path("get_plants/", views.get_plants, name="get_plants"),
    path("search_plants/", views.search_plants, name="search_plants"),
    path("api/scan-plant/", views.scan_plant, name="scan_plant"),
    path("get_search_history/", views.get_search_history, name="get_search_history"),  
    path("update_plant/<uuid:plant_id>/", views.update_plant, name="update_plant"),
    path("delete_plant/<uuid:plant_id>/", views.delete_plant, name="delete_plant"),



]
