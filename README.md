# InkLoom AI
React/Vite/Tailwind frontend (`frontend/`) + FastAPI backend (`backend/`) + MongoDB + Gemini.

## Run locally
Backend: `cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && cp .env.example .env` (fill MONGODB_URI, JWT_SECRET, GEMINI_API_KEY) then `uvicorn app.main:app --reload`.
Frontend: `cd frontend && npm install && cp .env.example .env && npm run dev`.
Generate a JWT secret: `python -c "import secrets;print(secrets.token_urlsafe(48))"`. Gemini key: https://aistudio.google.com/apikey

## Deploy
1. **Atlas:** create a free cluster, a database user, and under Network Access allow 0.0.0.0/0 (Render has no fixed IP). Copy the connection string into MONGODB_URI.
2. **Render:** New > Blueprint (uses render.yaml) or Web Service with root `backend`. Set MONGODB_URI, GEMINI_API_KEY, and CORS_ORIGINS (your Vercel URL, no trailing slash). Set DEMO_MODE=false for real use.
3. **Vercel:** import repo, root directory `frontend`, env `VITE_API_URL=https://<your-render-app>.onrender.com`, deploy. Then put the Vercel URL in Render's CORS_ORIGINS and redeploy.
Check `https://<render-app>/api/health` shows `ai_configured: true`. Render free tier sleeps; open the health URL before a demo.

## Data handling
Brand profiles, content and reports are stored in your MongoDB, private to the owner. Reviewers see only submitted content from users with the same organisation name. Content is sent to Google Gemini for analysis. Claims are checked only against the approved facts in the brand profile, not the internet.
