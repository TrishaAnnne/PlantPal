# Django & DRF
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from rest_framework import status
import json

# JWT & SimpleJWT
import jwt
from rest_framework_simplejwt.tokens import RefreshToken,AccessToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

# Utilities
from .utils import hash_password_sha256, verify_jwt_token

# External / other libraries
from supabaseclient import supabase
import requests
import traceback
import random
import uuid
from datetime import datetime, timedelta


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

# --------------------------------------------------------------------
# Admin Sign-up (for PlantPal Web)
# --------------------------------------------------------------------
@api_view(["POST"])
def admin_signup(request):
    try:
        data = request.data
        email = data.get("email", "").strip().lower()
        password = data.get("password", "").strip()
        user_name = data.get("user_name", "").strip()

        if not email or not password or not user_name:
            return Response(
                {"error": "Email, password, and username required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if email already exists
        existing = (
            supabase.table("admin")
            .select("email")
            .eq("email", email)
            .execute()
        )
        if existing.data:
            return Response(
                {"error": "Email already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        hashed_password = hash_password_sha256(password)

        # Insert new admin
        supabase.table("admin").insert({
            "email": email,
            "password": hashed_password,
            "user_name": user_name
        }).execute()

        return Response(
            {
                "message": "Admin signed up successfully!",
                "admin": {"email": email, "user_name": user_name}
            },
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        print(traceback.format_exc())
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_token(request):
    try:
        refresh_token = request.data.get("refresh")
        
        if not refresh_token:
            return Response({"error": "Refresh token required."}, status=400)
        
        # Validate and refresh the token
        refresh = RefreshToken(refresh_token)
        
        # Get the admin_id from the refresh token
        admin_id = refresh.get('admin_id')
        email = refresh.get('email')
        user_name = refresh.get('user_name')
        
        # Generate new access token with the same claims
        new_access = refresh.access_token
        new_access['admin_id'] = admin_id
        new_access['email'] = email
        new_access['user_name'] = user_name
        
        return Response({
            "access": str(new_access),
            "message": "Token refreshed successfully"
        }, status=200)
        
    except Exception as e:
        print(f"❌ Refresh token error: {e}")
        return Response({"error": "Invalid or expired refresh token."}, status=401)

@api_view(["POST"])
@permission_classes([AllowAny])
def admin_login(request):
    try:
        email = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "").strip()

        if not email or not password:
            return Response({"error": "Email and password required."}, status=400)

        response = supabase.table("admin").select("*").eq("email", email).execute()
        admin_list = response.data
        if not admin_list:
            return Response({"error": "Invalid credentials."}, status=401)

        admin = admin_list[0]
        if hash_password_sha256(password) != admin["password"]:
            return Response({"error": "Invalid credentials."}, status=401)

        # 🔑 Generate JWT tokens with admin_id in payload
        refresh = RefreshToken()
        
        # ✅ Add custom claims to the token
        refresh['admin_id'] = admin['id']
        refresh['email'] = admin['email']
        refresh['user_name'] = admin['user_name']
        
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
                                                    
        admin_data = {
            "id": admin["id"],
            "email": admin["email"],
            "user_name": admin["user_name"],
            "created_at": admin["created_at"],
        }

        return Response({
            "message": "Login successful!",
            "admin": admin_data,
            "access": access_token,
            "refresh": refresh_token
        }, status=200)

    except Exception:
        print(traceback.format_exc())
        return Response({"error": "Internal server error."}, status=500)


# ============================================================================
# ✅ ADD PLANT (with normalized ailments)
# ============================================================================
@api_view(["POST"])
def add_plant(request):
    try:
        # Extract admin_id from JWT token
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return Response({"error": "No valid authorization header"}, status=401)
        
        token_string = auth_header.split(' ')[1]
        
        try:
            access_token = AccessToken(token_string)
            admin_id = access_token.get('admin_id')
            
            if not admin_id:
                return Response({"error": "Admin ID not found in token"}, status=401)
                
        except Exception as token_error:
            print(f"❌ Token error: {token_error}")
            return Response({"error": f"Invalid token: {str(token_error)}"}, status=401)

        # Extract plant data from form
        plant_name = request.data.get("plant_name")
        scientific_name = request.data.get("scientific_name")
        common_names_raw = request.data.get("common_names") or ""
        origin = request.data.get("origin")
        distribution = request.data.get("distribution")
        habitat = request.data.get("habitat")
        plant_type = request.data.get("plant_type")
        link = request.data.get("link")
        kingdom = request.data.get("kingdom")
        order = request.data.get("order")
        family = request.data.get("family")
        genus = request.data.get("genus")

        # Convert comma-separated common_names to PostgreSQL text[]
        common_names = (
            [name.strip() for name in common_names_raw.split(",") if name.strip()]
            if common_names_raw
            else None
        )

        # These are now stored per-ailment in plant_ailments table
        plant_data = {
            "plant_name": plant_name,
            "scientific_name": scientific_name,
            "common_names": common_names,
            "origin": origin,
            "distribution": distribution,
            "habitat": habitat,
            "plant_type": plant_type,
            "link": link,
            "kingdom": kingdom,
            "order": order,
            "family": family,
            "genus": genus,
            "admin_id": str(admin_id),
        }

        plant_insert = supabase.table("plants").insert(plant_data).execute()
        if not plant_insert.data:
            return Response({"error": "Failed to insert plant record."}, status=400)

        plant_id = plant_insert.data[0]["id"]

        ailments_raw = request.data.get("ailments", [])
        if ailments_raw:
            # Parse ailments if it's a JSON string
            if isinstance(ailments_raw, str):
                try:
                    ailments_raw = json.loads(ailments_raw)
                except json.JSONDecodeError:
                    ailments_raw = []
            
            # Insert each ailment with its reference and herbal benefit
            ailment_records = []
            if isinstance(ailments_raw, list):
                for ailment_item in ailments_raw:
                    if isinstance(ailment_item, dict):
                        ailment_records.append({
                            "plant_id": str(plant_id),
                            "ailment": ailment_item.get("ailment", ""),
                            "reference": ailment_item.get("reference", ""),
                            "herbal_benefit": ailment_item.get("herbalBenefit", ""),
                            "disease_type": ailment_item.get("diseaseType", ""),
                        })
            
            if ailment_records:
                supabase.table("plant_ailments").insert(ailment_records).execute()

        # Handle multiple plant image uploads
        uploaded_images = request.FILES.getlist("images")
        image_records = []

        if uploaded_images:
            for image in uploaded_images:
                try:
                    ext = image.name.split(".")[-1]
                    file_name = f"plants/{uuid.uuid4()}.{ext}"
                    supabase.storage.from_("plant-images").upload(file_name, image.read())
                    public_url = supabase.storage.from_("plant-images").get_public_url(file_name)
                    image_records.append({"plant_id": plant_id, "image_url": public_url})
                except Exception:
                    traceback.print_exc()
                    continue

            if image_records:
                supabase.table("plant_images").insert(image_records).execute()

        # Handle multiple leaf image uploads
        uploaded_leaf_images = request.FILES.getlist("leaf_images")
        leaf_records = []

        if uploaded_leaf_images:
            for leaf in uploaded_leaf_images:
                try:
                    ext = leaf.name.split(".")[-1]
                    file_name = f"leaves/{uuid.uuid4()}.{ext}"
                    supabase.storage.from_("plant-leaf-images").upload(file_name, leaf.read())
                    public_url = supabase.storage.from_("plant-leaf-images").get_public_url(file_name)
                    leaf_records.append({"plant_id": plant_id, "leaf_image_url": public_url})
                except Exception:
                    traceback.print_exc()
                    continue

            if leaf_records:
                supabase.table("plant_leaves").insert(leaf_records).execute()

        return Response(
            {"message": "✅ Plant and ailments added successfully!", "plant_id": str(plant_id)},
            status=status.HTTP_201_CREATED,
        )

    except Exception as e:
        print("⚠️ Error in add_plant:", traceback.format_exc())
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# ✅ GET PLANTS (with ailments grouped by disease type)
# ============================================================================
@api_view(["GET"])
def get_plants(request):
    try:
        response = (
            supabase.table("plants")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
        plants = response.data or []

        for plant in plants:
            plant_id = plant["id"]

            # Fetch ALL plant images
            plant_images_resp = (
                supabase.table("plant_images")
                .select("image_url")
                .eq("plant_id", plant_id)
                .execute()
            )
            plant["images"] = [img["image_url"] for img in plant_images_resp.data]
            plant["image"] = plant["images"][0] if plant["images"] else None

            ailments_resp = (
                supabase.table("plant_ailments")
                .select("*")
                .eq("plant_id", plant_id)
                .execute()
            )
            
            ailments = ailments_resp.data or []
            
            # Group ailments by disease_type
            ailments_by_disease = {}
            for ailment in ailments:
                disease_type = ailment.get("disease_type", "Other")
                if disease_type not in ailments_by_disease:
                    ailments_by_disease[disease_type] = []
                
                ailments_by_disease[disease_type].append({
                    "ailment": ailment.get("ailment"),
                    "reference": ailment.get("reference"),
                    "herbalBenefit": ailment.get("herbal_benefit"),
                })
            
            plant["ailments"] = ailments_by_disease
            plant["ailmentsList"] = ailments  # Also provide flat list if needed

        return Response(plants, status=200)

    except Exception as e:
        print("❌ Error fetching plants:", traceback.format_exc())
        return Response({"error": str(e)}, status=500)
    
@api_view(["GET"])
def search_plants(request):
    """
    Search plants by name, scientific name, or common names.
    Also saves the search query to user history.
    """
    try:
        query = request.GET.get("q", "").strip()
        email = request.GET.get("email", "").strip().lower()

        if not query:
            return Response({"error": "Query required"}, status=400)

        # Search plants by multiple fields
        results = (
            supabase.table("plants")
            .select("*")
            .ilike("plant_name", f"%{query}%")
            .execute()
        )

        # if no match by plant_name, try scientific_name or common_names
        if not results.data:
            results = (
                supabase.table("plants")
                .select("*")
                .or_(
                    f"scientific_name.ilike.%{query}%,common_names.cs.{{{query}}}"
                )
                .execute()
            )

        # Save search history (if user logged in)
        if email:
            supabase.table("search_history").insert({
                "user_email": email,
                "query": query,
                "timestamp": datetime.utcnow().isoformat(),
            }).execute()

        return Response(results.data, status=200)

    except Exception as e:
        print("⚠️ Error in search_plants:", traceback.format_exc())
        return Response({"error": str(e)}, status=500)

@api_view(["GET"])
def get_search_history(request):
    """
    Returns the user's previous search queries, most recent first.
    """
    try:
        email = request.GET.get("email", "").strip().lower()
        if not email:
            return Response({"error": "Email required"}, status=400)

        response = (
            supabase.table("search_history")
            .select("query, timestamp")
            .eq("user_email", email)
            .order("timestamp", desc=True)
            .limit(10)
            .execute()
        )

        return Response(response.data, status=200)

    except Exception as e:
        print("⚠️ Error fetching search history:", traceback.format_exc())
        return Response({"error": str(e)}, status=500)



# ============================================================================
# ✅ UPDATE PLANT (with normalized ailments)
# ============================================================================
@api_view(["PATCH"])
def update_plant(request, plant_id):
    try:
        plant_id_str = str(plant_id)
        
        # Extract admin_id from JWT token
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return Response({"error": "No valid authorization header"}, status=401)
        
        token_string = auth_header.split(' ')[1]
        
        try:
            access_token = AccessToken(token_string)
            admin_id = access_token.get('admin_id')
            
            if not admin_id:
                return Response({"error": "Admin ID not found in token"}, status=401)
                
        except Exception as token_error:
            print(f"❌ Token error: {token_error}")
            return Response({"error": f"Invalid token: {str(token_error)}"}, status=401)

        allowed_fields = [
            "plant_name", "scientific_name", "common_names", "origin",
            "distribution", "habitat", "plant_type", "link", "kingdom", 
            "order", "family", "genus"
        ]

        update_data = {}

        for field in allowed_fields:
            if field in request.data:
                update_data[field] = request.data.get(field)

        # Handle common_names
        if "common_names" in update_data and isinstance(update_data["common_names"], str):
            update_data["common_names"] = [
                n.strip() for n in update_data["common_names"].split(",") if n.strip()
            ]

        if not update_data and "deleted_images" not in request.data and not request.FILES.getlist("images"):
            return Response({"error": "No fields to update."}, status=400)

        # Update plant fields
        if update_data:
            response = (
                supabase.table("plants")
                .update(update_data)
                .eq("id", plant_id_str)
                .execute()
            )
            if not response.data:
                return Response({"error": "Plant not found or update failed."}, status=404)

        ailments_raw = request.data.get("ailments")
        if ailments_raw is not None:
            # Delete old ailments
            supabase.table("plant_ailments").delete().eq("plant_id", plant_id_str).execute()
            
            # Parse ailments if it's a JSON string
            if isinstance(ailments_raw, str):
                try:
                    ailments_raw = json.loads(ailments_raw)
                except json.JSONDecodeError:
                    ailments_raw = []
            
            # Insert new ailments
            ailment_records = []
            if isinstance(ailments_raw, list):
                for ailment_item in ailments_raw:
                    if isinstance(ailment_item, dict):
                        ailment_records.append({
                            "plant_id": plant_id_str,
                            "ailment": ailment_item.get("ailment", ""),
                            "reference": ailment_item.get("reference", ""),
                            "herbal_benefit": ailment_item.get("herbalBenefit", ""),
                            "disease_type": ailment_item.get("diseaseType", ""),
                        })
            
            if ailment_records:
                supabase.table("plant_ailments").insert(ailment_records).execute()

        # Handle deleted images
        deleted_images = request.data.get("deleted_images")
        if deleted_images:
            try:
                deleted_images = json.loads(deleted_images)
                for url in deleted_images:
                    file_path = url.split("/plant-images/")[-1]
                    supabase.storage.from_("plant-images").remove([file_path])
                    supabase.table("plant_images").delete().eq("image_url", url).execute()
            except Exception as e:
                print("⚠️ Failed to delete image:", e)

        # Handle newly uploaded images
        new_images = request.FILES.getlist("images")
        for image in new_images:
            try:
                file_path = f"{str(uuid.uuid4())}_{image.name}"
                supabase.storage.from_("plant-images").upload(file_path, image.read())
                public_url = supabase.storage.from_("plant-images").get_public_url(file_path)
                supabase.table("plant_images").insert({"plant_id": plant_id_str, "image_url": public_url}).execute()
            except Exception as e:
                print("⚠️ Failed to upload image:", e)

        return Response({"message": "✅ Plant updated successfully!"}, status=200)

    except Exception as e:
        print("⚠️ Error updating plant:", traceback.format_exc())
        return Response({"error": str(e)}, status=500)


# ============================================================================
# ✅ DELETE PLANT (with cascade delete for ailments)
# ============================================================================
@api_view(["DELETE"])
def delete_plant(request, plant_id):
    try:
        plant_id_str = str(plant_id)
        
        # Get plant record
        plant_response = supabase.table("plants").select("*").eq("id", plant_id_str).execute()
        if not plant_response.data:
            return Response({"error": "Plant not found."}, status=404)

        supabase.table("plant_ailments").delete().eq("plant_id", plant_id_str).execute()

        # Delete plant images from storage
        images_response = supabase.table("plant_images").select("image_url").eq("plant_id", plant_id_str).execute()
        images = images_response.data or []

        for img in images:
            try:
                file_path = img["image_url"].split("/plant-images/")[-1]
                supabase.storage.from_("plant-images").remove([file_path])
            except Exception as e:
                print("⚠️ Failed to delete image:", e)

        # Delete plant images records from DB
        supabase.table("plant_images").delete().eq("plant_id", plant_id_str).execute()

        # Delete the plant itself
        supabase.table("plants").delete().eq("id", plant_id_str).execute()

        return Response({"message": "✅ Plant deleted successfully!"}, status=200)

    except Exception as e:
        print("⚠️ Error deleting plant:", traceback.format_exc())
        return Response({"error": str(e)}, status=500)