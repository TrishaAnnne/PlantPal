from fastapi import FastAPI, Depends, HTTPException
from fastapi_jwt_auth import AuthJWT
from fastapi_jwt_auth.exceptions import AuthJWTException
from pydantic import BaseModel
from backend.plant_model import predict  # your model inference function
from supabase import create_client, Client
import base64
from PIL import Image
import io
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# JWT settings
class Settings(BaseModel):
    authjwt_secret_key: str = os.getenv("JWT_SECRET_KEY")

@AuthJWT.load_config
def get_config():
    return Settings()

app = FastAPI()

# Request schema
class ScanRequest(BaseModel):
    imageBase64: str
    scanned_at: str  # timestamp from mobile

# JWT exception handler
@app.exception_handler(AuthJWTException)
def authjwt_exception_handler(request, exc):
    return HTTPException(status_code=401, detail=str(exc))

# Scan plant endpoint
@app.post("/scan-plant/")
async def scan_plant(payload: ScanRequest, Authorize: AuthJWT = Depends()):
    try:
        # 1️⃣ Verify JWT token
        Authorize.jwt_required()
        user_email = Authorize.get_jwt_subject()  # user's identity from JWT

        # 2️⃣ Decode image from base64
        image_bytes = base64.b64decode(payload.imageBase64)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # 3️⃣ Predict plant class
        class_id = predict(image)  # returns numeric class index

        # 4️⃣ Map class index to plant name
        plant_names = [
            "Tarragon", "Peppermint", "Chocomint", "Spearmint",
            "Oregano (Plain)", "Oregano (Variegated)", "Sambong",
            "Acapulco", "Lagundi", "Tsaang Gubat"
        ]
        plant_name = plant_names[class_id] if class_id < len(plant_names) else "Unknown"

        # 5️⃣ Insert scan record into Supabase
        supabase.table("plants").insert({
            "plant_name": plant_name,
            "user_id": user_email,
            "scanned_at": payload.scanned_at
        }).execute()

        return {"predicted_class": class_id, "plant_name": plant_name}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
