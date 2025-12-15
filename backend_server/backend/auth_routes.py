# backend/auth_routes.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi_jwt_auth import AuthJWT
from pydantic import BaseModel

router = APIRouter()

# Dummy user (replace with DB lookup)
USERS = {"user@example.com": "123456"}

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    email: str

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, Authorize: AuthJWT = Depends()):
    # Check user credentials
    if request.email not in USERS or USERS[request.email] != request.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Create tokens
    access_token = Authorize.create_access_token(subject=request.email)
    refresh_token = Authorize.create_refresh_token(subject=request.email)

    return {
        "email": request.email,
        "access_token": access_token,
        "refresh_token": refresh_token,
    }

# Refresh token route
@router.post("/refresh")
def refresh(Authorize: AuthJWT = Depends()):
    Authorize.jwt_refresh_token_required()

    current_user = Authorize.get_jwt_subject()
    new_access_token = Authorize.create_access_token(subject=current_user)

    return {"access_token": new_access_token}
