from datetime import datetime, timedelta, timezone
import bcrypt, jwt
from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from .config import settings
from .db import db

bearer = HTTPBearer(auto_error=False)

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())

def create_token(user_id: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    return jwt.encode({"sub": user_id, "exp": exp}, settings.jwt_secret, algorithm="HS256")

async def current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    err = HTTPException(status.HTTP_401_UNAUTHORIZED, "Please sign in again.")
    if not creds:
        raise err
    try:
        uid = jwt.decode(creds.credentials, settings.jwt_secret, algorithms=["HS256"])["sub"]
        user = await db.users.find_one({"_id": ObjectId(uid)})
    except Exception:
        raise err
    if not user:
        raise err
    return user

def require_role(*roles: str):
    async def checker(user: dict = Depends(current_user)) -> dict:
        if user["role"] not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "You are not authorised to do this.")
        return user
    return checker
