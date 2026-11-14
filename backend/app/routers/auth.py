from datetime import datetime, timezone
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from pymongo.errors import DuplicateKeyError
from ..config import settings
from ..db import db
from ..security import hash_password, verify_password, create_token, current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

class SignUp(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    organisation: str = Field(default="", max_length=120)
    role: Literal["creator", "reviewer"] = "creator"

class Login(BaseModel):
    email: EmailStr
    password: str

def public(u: dict) -> dict:
    return {"id": str(u["_id"]), "name": u["name"], "email": u["email"],
            "role": u["role"], "organisation": u.get("organisation", "")}

@router.post("/signup", status_code=201)
async def signup(body: SignUp):
    # Only demo mode lets a user pick a role; otherwise everyone starts as creator
    # and an admin must promote reviewers.
    role = body.role if settings.demo_mode else "creator"
    doc = {"name": body.name.strip(), "email": body.email.lower(),
           "password_hash": hash_password(body.password), "role": role,
           "organisation": body.organisation.strip(),
           "created_at": datetime.now(timezone.utc)}
    try:
        res = await db.users.insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(409, "An account with this email already exists.")
    doc["_id"] = res.inserted_id
    return {"token": create_token(str(res.inserted_id)), "user": public(doc)}

@router.post("/login")
async def login(body: Login):
    u = await db.users.find_one({"email": body.email.lower()})
    if not u or not verify_password(body.password, u["password_hash"]):
        raise HTTPException(401, "Incorrect email or password.")
    return {"token": create_token(str(u["_id"])), "user": public(u)}

@router.get("/me")
async def me(user: dict = Depends(current_user)):
    return public(user)
