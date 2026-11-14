"""Upload validation and text extraction."""
import io
from fastapi import HTTPException, UploadFile

MAX_BYTES = 10 * 1024 * 1024
MAX_CHARS = 30_000
IMAGE_MIME = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png"}
MAGIC = {"pdf": b"%PDF", "docx": b"PK", "png": b"\x89PNG", "jpg": b"\xff\xd8\xff", "jpeg": b"\xff\xd8\xff"}

async def read_upload(f: UploadFile):
    """Returns (text, image_bytes, image_mime). Validates type, size and content signature."""
    ext = (f.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in {"txt", "pdf", "docx", *IMAGE_MIME}:
        raise HTTPException(415, "Unsupported file type. Use TXT, PDF, DOCX, JPG or PNG.")
    data = await f.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "File is too large (max 10 MB).")
    if not data:
        raise HTTPException(422, "The uploaded file is empty.")
    if ext in MAGIC and not data.startswith(MAGIC[ext]):
        raise HTTPException(415, "The file content does not match its extension.")
    try:
        if ext in IMAGE_MIME:
            return "", data, IMAGE_MIME[ext]
        if ext == "txt":
            return data.decode("utf-8", errors="replace"), None, None
        if ext == "pdf":
            from pypdf import PdfReader
            return "\n".join((p.extract_text() or "") for p in PdfReader(io.BytesIO(data)).pages), None, None
        from docx import Document
        return "\n".join(p.text for p in Document(io.BytesIO(data)).paragraphs), None, None
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(422, "Could not read this file. It may be corrupted or password protected.")
