from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .utils import hash_password_sha256
from supabaseclient import supabase
import traceback
import random
from datetime import datetime
import requests

# --------------------------------------------------------------------
# Address search
# --------------------------------------------------------------------
@api_view(["GET"])
def search_address(request):
    query = request.GET.get("q", "")
    if not query:
        return Response({"error": "Missing query"}, status=400)

    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": query,
        "format": "json",
        "addressdetails": 1,
        "limit": 5,
    }
    headers = {
        "User-Agent": "PlantPal/1.0 (barulotrishaanne@gmail.com)"
    }

    try:
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        return Response(response.json())
    except requests.exceptions.RequestException as e:
        return Response({"error": str(e)}, status=500)

# --------------------------------------------------------------------
# Helper to generate unique usernames
# --------------------------------------------------------------------
def generate_username():
    plants = ["Fern", "Palm", "Rose", "Lily", "Orchid", "Ivy", "Moss", "Bamboo", "Cactus", "Daisy"]
    adjectives = ["Green", "Blooming", "Leafy", "Sunny", "Fresh", "Wild", "Tiny", "Majestic", "Bright"]
    return f"{random.choice(adjectives)}{random.choice(plants)}{random.randint(1000, 9999)}"

# --------------------------------------------------------------------
# Sign-up
# --------------------------------------------------------------------
@api_view(['POST'])
def signup(request):
    try:
        data = request.data
        email = data.get("email", "").strip().lower()
        password = data.get("password", "").strip()

        if not email or not password:
            return Response({"error": "Email and password required"},
                            status=status.HTTP_400_BAD_REQUEST)

        existing = (
            supabase.table("users")
            .select("user_email")
            .eq("user_email", email)
            .execute()
        )
        if existing.data:
            return Response({"error": "Email already exists"},
                            status=status.HTTP_400_BAD_REQUEST)

        hashed_password = hash_password_sha256(password)

        # generate a unique username
        username = generate_username()
        while True:
            existing_username = (
                supabase.table("users")
                .select("user_name")
                .eq("user_name", username)
                .execute()
            )
            if not existing_username.data:
                break
            username = generate_username()

        user = (
            supabase.table("users")
            .insert({
                "user_email": email,
                "user_password": hashed_password,
                "user_name": username
            })
            .execute()
        )

        # create empty profile linked to the user
        supabase.table("profiles").insert({
            "user_id": user.data[0]["id"],
            "user_name": username
        }).execute()

        return Response(
            {
                "message": "User signed up successfully!",
                "user": {"email": email, "username": username}
            },
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --------------------------------------------------------------------
# Login
# --------------------------------------------------------------------
@api_view(['POST'])
def login(request):
    try:
        email = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "").strip()

        if not email or not password:
            return Response({"error": "Email and password required"},
                            status=status.HTTP_400_BAD_REQUEST)

        result = (
            supabase.table("users")
            .select("id, user_password, user_name")
            .eq("user_email", email)
            .single()
            .execute()
        )

        if not result.data:
            return Response({"error": "Invalid email or password"},
                            status=status.HTTP_401_UNAUTHORIZED)

        stored_hash = result.data["user_password"]
        if stored_hash != hash_password_sha256(password):
            return Response({"error": "Invalid email or password"},
                            status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(type("User", (), {"id": email}))

        return Response(
            {
                "message": "Login successful!",
                "user": {
                    "email": email,
                    "username": result.data["user_name"]
                },
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --------------------------------------------------------------------
# Create profile (if you still want this separate)
# --------------------------------------------------------------------
@api_view(['POST'])
def create_profile(request):
    try:
        data = request.data
        email = data.get("email", "").strip().lower()
        address = data.get("address", "").strip()
        phone = data.get("phone", "").strip()
        bio = data.get("bio", "").strip()

        if not email:
            return Response({"error": "Email is required"},
                            status=status.HTTP_400_BAD_REQUEST)

        user_check = (
            supabase.table("users")
            .select("user_email")
            .eq("user_email", email)
            .execute()
        )

        if not user_check.data:
            return Response({"error": "User not found"},
                            status=status.HTTP_404_NOT_FOUND)

        profile = {
            "user_email": email,
            "address": address,
            "phone": phone,
            "bio": bio
        }

        supabase.table("profiles").insert(profile).execute()

        return Response({"message": "Profile created successfully!",
                         "profile": profile},
                        status=status.HTTP_201_CREATED)

    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --------------------------------------------------------------------
# Fetch profile
# --------------------------------------------------------------------
@api_view(['GET'])
def profile(request):
    try:
        email = request.query_params.get("email", "").strip().lower()
        if not email:
            return Response({"error": "Email required"},
                            status=status.HTTP_400_BAD_REQUEST)

        # --- Get user ---
        user = (
            supabase.table("users")
            .select("id, user_email, user_name")
            .eq("user_email", email)
            .single()
            .execute()
        )

        if not user.data:
            return Response({"error": "User not found"},
                            status=status.HTTP_404_NOT_FOUND)

        # --- Get optional profile ---
        profile_result = (
            supabase.table("profiles")
            .select("city, interests, avatar_url, is_premium")
            .eq("user_id", user.data["id"])
            .maybe_single()
            .execute()
        )

        # ✅ Guard against None
        profile_data = profile_result.data if profile_result and profile_result.data else {}

        return Response(
            {
                "email": user.data["user_email"],
                "username": user.data["user_name"],
                "profile": profile_data
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# --------------------------------------------------------------------
# Update profile & (optionally) username
# --------------------------------------------------------------------
@api_view(["PUT"])
def update_profile(request):
   
    """
    Updates a user's profile.
    If a profile row doesn't exist yet, it will be created.
    Also updates users.user_name if supplied.
    """
    try:
        email   = request.data.get("email", "").strip().lower()
        updates = request.data.get("updates", {})

        if not email:
            return Response({"error": "Email required"}, status=status.HTTP_400_BAD_REQUEST)

        # --- find user id ---
        user = (
            supabase.table("users")
            .select("id")
            .eq("user_email", email)
            .single()
            .execute()
        )
        if not user.data:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        user_id = user.data["id"]

        # --- update username in users table if requested ---
        if "user_name" in updates:
            new_username = updates.pop("user_name").strip()
            taken = (
                supabase.table("users")
                .select("id")
                .eq("user_name", new_username)
                .execute()
            )
            if taken.data:
                return Response({"error": "Username already taken"},
                                status=status.HTTP_400_BAD_REQUEST)
            supabase.table("users").update({"user_name": new_username}).eq("id", user_id).execute()

        # --- upsert profile row ---
        if updates:
            updates["updated_at"] = datetime.utcnow().isoformat()

            # UPSERT ensures insert if row doesn't exist
            supabase.table("profiles").upsert({
                "user_id": user_id,
                **updates
            }, on_conflict=["user_id"]).execute()

        return Response(
            {"message": "Profile updated successfully!", "updates": updates},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)