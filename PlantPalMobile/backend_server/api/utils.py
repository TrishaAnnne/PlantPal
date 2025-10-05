import hashlib

def hash_password_sha256(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()
