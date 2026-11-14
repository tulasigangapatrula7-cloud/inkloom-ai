from fastapi import APIRouter, Depends
from fastapi import HTTPException
from pydantic import BaseModel, Field
from ..common import iso, now, oid
from ..db import db
from ..security import current_user

router = APIRouter(prefix="/api/brands", tags=["brands"])
S = lambda n: Field("", max_length=n)

class Brand(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str = S(1000); voice: str = S(300); tone: str = S(300); audience: str = S(300)
    approved_terms: list[str] = Field(default_factory=list, max_length=100)
    avoid_words: list[str] = Field(default_factory=list, max_length=100)
    writing_guidelines: str = S(4000)
    colours: list[str] = Field(default_factory=list, max_length=30)
    approved_facts: str = S(6000); extra_instructions: str = S(3000)

def out(b):
    d = {k: v for k, v in b.items() if k not in ("_id", "owner_id")}
    d["id"] = str(b["_id"]); d["created_at"] = iso(b.get("created_at")); d["updated_at"] = iso(b.get("updated_at"))
    return d

@router.get("")
async def list_brands(u=Depends(current_user)):
    return [out(b) async for b in db.brand_profiles.find({"owner_id": u["_id"]}).sort("created_at", -1)]

@router.post("", status_code=201)
async def create(body: Brand, u=Depends(current_user)):
    doc = {**body.model_dump(), "owner_id": u["_id"], "created_at": now(), "updated_at": now()}
    doc["_id"] = (await db.brand_profiles.insert_one(doc)).inserted_id
    return out(doc)

@router.put("/{bid}")
async def update(bid: str, body: Brand, u=Depends(current_user)):
    r = await db.brand_profiles.find_one_and_update({"_id": oid(bid), "owner_id": u["_id"]},
        {"$set": {**body.model_dump(), "updated_at": now()}}, return_document=True)
    if not r:
        raise HTTPException(404, "Brand profile not found.")
    return out(r)

@router.delete("/{bid}")
async def delete(bid: str, u=Depends(current_user)):
    r = await db.brand_profiles.delete_one({"_id": oid(bid), "owner_id": u["_id"]})
    if not r.deleted_count:
        raise HTTPException(404, "Brand profile not found.")
    return {"ok": True}
