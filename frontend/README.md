# InkLoom AI – Frontend
```
npm install
cp .env.example .env     # set VITE_API_URL to your backend
npm run dev              # http://localhost:5173
```
Deploy: push to GitHub, import on Vercel, set `VITE_API_URL` to your Render URL (vercel.json handles routing).

## API contract the frontend expects (Bearer JWT on all but auth)
- POST /api/auth/signup | /login, GET /api/auth/me  (done)
- GET/POST /api/brands, PUT/DELETE /api/brands/{id}
  fields: name, description, voice, tone, audience, approved_terms[], avoid_words[], writing_guidelines, colours[], approved_facts, extra_instructions
- GET /api/submissions -> [{id,title,brand_name,created_at,status,overall_score,issue_count,severity_counts,reviewer}]
- POST /api/submissions (multipart: title, brand_id, content_type, text, file) -> {id}
- GET /api/submissions/{id} -> {id,title,status,content,report:{overall_score,overall_status,summary,category_scores,issues[],improved_content},history:[{at,by,action,comment}]}
- POST /api/submissions/{id}/reanalyse | /revise {content} | /submit | /decision {decision,comment} (reviewer/admin only)
- DELETE /api/submissions/{id}
