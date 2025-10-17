import jwt
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

# Secret key for JWT (same one used when generating tokens)
SECRET_KEY = getattr(settings, "SECRET_KEY", "your_secret_key_here")

def hash_password_sha256(password: str) -> str:
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()

def verify_jwt_token(request):
    """
    Verify JWT from the Authorization header.
    Returns (decoded_token, None) if valid, or (None, Response) if invalid.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None, Response({"error": "Authorization header missing or invalid"},
                              status=status.HTTP_401_UNAUTHORIZED)

    token = auth_header.split(" ")[1]

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded, None
    except jwt.ExpiredSignatureError:
        return None, Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return None, Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
