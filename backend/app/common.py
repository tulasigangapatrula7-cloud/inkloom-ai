from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException

def oid(s: str) -> ObjectId:
    try:
        return ObjectId(s)
    except Exception:
        raise HTTPException(404, "Not found.")

def now():
    return datetime.now(timezone.utc)

def iso(d):
    return d.isoformat() if d else None
