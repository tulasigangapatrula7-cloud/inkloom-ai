from typing import Literal, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field
from .. import ai
from ..ai import AIError
from ..common import iso, now, oid
from ..config import settings
from ..db import db
from ..files import MAX_CHARS, read_upload
from ..security import current_user, require_role

router = APIRouter(prefix="/api/submissions", tags=["submissions"])
REVIEWERS = ("reviewer", "admin")
TYPES = {"Social media", "Advertisement", "Blog", "Email", "Website copy", "Other"}

def org_key(u): return (u.get("organisation") or "").strip().lower()

def visible(u):
    q = [{"owner_id": u["_id"]}]
    if u["role"] in REVIEWERS and org_key(u):  # reviewers see submitted content from their organisation
        q.append({"org_key": org_key(u), "status": {"$in": ["Pending Approval", "Approved", "Rejected"]}})
    return {"$or": q}

async def get_sub(sid, u, owner_only=False):
    q = {"_id": oid(sid), "owner_id": u["_id"]} if owner_only else {"_id": oid(sid), **visible(u)}
    s = await db.submissions.find_one(q)
    if not s:
        raise HTTPException(404, "Content not found.")
    return s

def summary(s):
    return {"id": str(s["_id"]), "title": s["title"], "brand_name": s.get("brand_name", ""), "created_at": iso(s["created_at"]),
            "status": s["status"], "overall_score": s.get("overall_score"), "issue_count": s.get("issue_count", 0),
            "severity_counts": s.get("severity_counts", {}), "reviewer": s.get("reviewer")}

async def run_analysis(s):
    """Analyse, store a new report, update denormalised fields. Raises HTTPException on AI failure."""
    brand = await db.brand_profiles.find_one({"_id": s["brand_id"], "owner_id": s["owner_id"]})
    if not brand:
        raise HTTPException(409, "The brand profile for this content no longer exists.")
    await db.submissions.update_one({"_id": s["_id"]}, {"$set": {"status": "Analysing"}})
    try:
        res = await ai.analyse(brand, s["content"], s["content_type"], s.get("image"), s.get("image_mime"))
    except AIError as e:
        await db.submissions.update_one({"_id": s["_id"]}, {"$set": {"status": s.get("prev_status", "Draft")}})
        raise HTTPException(e.status, e.message)
    rep = {**res, "submission_id": s["_id"], "created_at": now(), "model": settings.gemini_model}
    rid = (await db.reports.insert_one(rep)).inserted_id
    counts = {}
    for i in res["issues"]:
        counts[i["severity"]] = counts.get(i["severity"], 0) + 1
    status = "Issues Found" if res["issues"] else "Draft"
    await db.submissions.update_one({"_id": s["_id"]}, {"$set": {"status": status, "report_id": rid, "overall_score": res["overall_score"],
        "issue_count": len(res["issues"]), "severity_counts": counts, "prev_status": status}})

@router.get("")
async def list_subs(q: str = "", status: str = "", u=Depends(current_user)):
    f = {"$and": [visible(u)]}
    if q: f["$and"].append({"title": {"$regex": q[:100], "$options": "i"}})
    if status: f["$and"].append({"status": status})
    return [summary(s) async for s in db.submissions.find(f, {"image": 0}).sort("created_at", -1).limit(500)]

@router.post("", status_code=201)
async def create(title: str = Form(..., max_length=200), brand_id: str = Form(...), content_type: str = Form("Other"),
                 text: str = Form(""), file: Optional[UploadFile] = File(None), u=Depends(current_user)):
    brand = await db.brand_profiles.find_one({"_id": oid(brand_id), "owner_id": u["_id"]})
    if not brand: raise HTTPException(404, "Brand profile not found.")
    if content_type not in TYPES: content_type = "Other"
    ftext, img, mime = ("", None, None)
    if file and file.filename: ftext, img, mime = await read_upload(file)
    content = "\n\n".join(x.strip() for x in (text, ftext) if x.strip())
    if not content and not img: raise HTTPException(422, "No content to analyse.")
    if len(content) > MAX_CHARS: raise HTTPException(413, f"Content is too long (max {MAX_CHARS:,} characters).")
    s = {"title": title.strip(), "owner_id": u["_id"], "owner_name": u["name"], "org_key": org_key(u), "brand_id": brand["_id"], "brand_name": brand["name"],
         "content_type": content_type, "content": content, "status": "Draft", "prev_status": "Draft", "created_at": now(), "version": 1}
    if img: s.update(image=img, image_mime=mime, has_image=True)
    s["_id"] = (await db.submissions.insert_one(s)).inserted_id
    try:
        await run_analysis(s)
    except HTTPException:
        await db.submissions.delete_one({"_id": s["_id"]})  # nothing useful saved; user can retry
        raise
    return {"id": str(s["_id"])}

@router.get("/{sid}")
async def detail(sid: str, u=Depends(current_user)):
    s = await get_sub(sid, u)
    r = await db.reports.find_one({"_id": s["report_id"]}) if s.get("report_id") else None
    ev = []
    async for a in db.approvals.find({"submission_id": s["_id"]}):
        ev.append({"at": a["at"], "by": a["by"], "action": a["action"], "comment": a.get("reason", "")})
    async for rv in db.revisions.find({"submission_id": s["_id"]}):
        ev.append({"at": rv["at"], "by": rv["by"], "action": f"Content revised (v{rv['version']})", "comment": ""})
    async for c in db.comments.find({"submission_id": s["_id"]}):
        if not c.get("with_decision"): ev.append({"at": c["at"], "by": c["by"], "action": "Comment", "comment": c["text"]})
    ev.sort(key=lambda e: e["at"])
    for e in ev: e["at"] = iso(e["at"])
    rep = None
    if r:
        rep = {k: r[k] for k in ("overall_score", "overall_status", "summary", "category_scores", "issues", "improved_content", "requires_human_review")}
    return {**summary(s), "content": s["content"], "content_type": s["content_type"], "has_image": bool(s.get("has_image")), "report": rep, "history": ev,
            "is_owner": s["owner_id"] == u["_id"]}

@router.post("/{sid}/reanalyse")
async def reanalyse(sid: str, u=Depends(current_user)):
    s = await get_sub(sid, u, owner_only=True)
    if s["status"] in ("Pending Approval", "Approved"): raise HTTPException(409, "This content is locked while awaiting or after approval.")
    await run_analysis(s); return {"ok": True}

class Revise(BaseModel):
    content: str = Field(min_length=1, max_length=MAX_CHARS)

@router.post("/{sid}/revise")
async def revise(sid: str, body: Revise, u=Depends(current_user)):
    s = await get_sub(sid, u, owner_only=True)
    if s["status"] in ("Pending Approval", "Approved"): raise HTTPException(409, "This content is locked while awaiting or after approval.")
    if s.get("has_image"): raise HTTPException(400, "Image content cannot be rewritten here. Upload a corrected image instead.")
    v = s["version"] + 1
    await db.revisions.insert_one({"submission_id": s["_id"], "version": v, "content_before": s["content"], "content_after": body.content, "by": u["name"], "at": now()})
    await db.submissions.update_one({"_id": s["_id"]}, {"$set": {"content": body.content, "version": v}})
    s["content"] = body.content
    await run_analysis(s); return {"ok": True}

@router.post("/{sid}/submit")
async def submit(sid: str, u=Depends(current_user)):
    s = await get_sub(sid, u, owner_only=True)
    if s["status"] not in ("Draft", "Issues Found", "Rejected") or not s.get("report_id"):
        raise HTTPException(409, "Analyse the content first, or it is already submitted.")
    await db.approvals.insert_one({"submission_id": s["_id"], "action": "Submitted for approval", "by": u["name"], "at": now()})
    await db.submissions.update_one({"_id": s["_id"]}, {"$set": {"status": "Pending Approval", "reviewer": None}})
    return {"ok": True}

class Decision(BaseModel):
    decision: Literal["Approved", "Rejected"]
    comment: str = Field("", max_length=2000)

@router.post("/{sid}/decision")
async def decide(sid: str, body: Decision, u=Depends(require_role(*REVIEWERS))):
    s = await get_sub(sid, u)
    if s["status"] != "Pending Approval": raise HTTPException(409, "This content is not awaiting approval.")
    if s["owner_id"] == u["_id"] and not settings.demo_mode: raise HTTPException(403, "You cannot review your own content.")
    if body.decision == "Rejected" and not body.comment.strip(): raise HTTPException(422, "A reason is required to reject content.")
    t = now()
    await db.approvals.insert_one({"submission_id": s["_id"], "action": body.decision, "by": u["name"], "reviewer_id": u["_id"], "reason": body.comment.strip(), "at": t})
    if body.comment.strip():
        await db.comments.insert_one({"submission_id": s["_id"], "text": body.comment.strip(), "by": u["name"], "with_decision": True, "at": t})
    await db.submissions.update_one({"_id": s["_id"]}, {"$set": {"status": body.decision, "reviewer": u["name"]}})
    return {"ok": True}

@router.delete("/{sid}")
async def delete(sid: str, u=Depends(current_user)):
    s = await get_sub(sid, u, owner_only=True)
    for c in (db.reports, db.approvals, db.comments, db.revisions): await c.delete_many({"submission_id": s["_id"]})
    await db.submissions.delete_one({"_id": s["_id"]}); return {"ok": True}
