from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

client = AsyncIOMotorClient(settings.mongodb_uri)
db = client[settings.mongodb_db]

async def init_indexes():
    await db.users.create_index("email", unique=True)
    await db.brand_profiles.create_index("owner_id")
    await db.submissions.create_index([("owner_id", 1), ("created_at", -1)])
    await db.reports.create_index("submission_id")
    await db.approvals.create_index("submission_id")
    await db.comments.create_index("submission_id")
    await db.revisions.create_index("submission_id")
