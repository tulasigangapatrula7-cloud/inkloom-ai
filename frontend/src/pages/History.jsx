import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { Badge, Btn, Card, Err, Spinner } from "../ui";
const STATUSES = ["Draft", "Analysing", "Issues Found", "Pending Approval", "Approved", "Rejected"];
export default function History() {
  const [subs, setSubs] = useState(null), [q, setQ] = useState(""), [st, setSt] = useState(""), [err, setErr] = useState("");
  const load = () => api("/api/submissions").then(setSubs).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);
  async function del(s) { if (!confirm(`Delete "${s.title}" and its reports?`)) return; try { await api(`/api/submissions/${s.id}`, { method: "DELETE" }); load(); } catch (e) { setErr(e.message); } }
  if (!subs) return err ? <Err m={err} /> : <Spinner />;
  const rows = subs.filter((s) => s.title.toLowerCase().includes(q.toLowerCase()) && (!st || s.status === st));
  return (
    <div className="space-y-4"><h1 className="text-2xl font-bold">Content History</h1><Err m={err} />
      <div className="flex gap-2 flex-wrap"><input aria-label="Search" placeholder="Search by title" value={q} onChange={(e) => setQ(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        <select aria-label="Filter by status" value={st} onChange={(e) => setSt(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
      <Card className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-slate-500"><tr>{["Title", "Date", "Brand", "Score", "Issues", "Status", "Reviewer", ""].map((h) => <th key={h} className="py-2 pr-3 font-medium">{h}</th>)}</tr></thead>
        <tbody>{rows.map((s) => <tr key={s.id} className="border-t border-slate-50"><td className="py-2 pr-3"><Link className="text-violet-600" to={`/app/report/${s.id}`}>{s.title}</Link></td><td className="pr-3">{new Date(s.created_at).toLocaleDateString()}</td><td className="pr-3">{s.brand_name}</td><td className="pr-3">{s.overall_score ?? "–"}</td><td className="pr-3">{s.issue_count ?? 0}</td><td className="pr-3"><Badge t={s.status} /></td><td className="pr-3">{s.reviewer || "–"}</td><td><Btn variant="danger" onClick={() => del(s)}>Delete</Btn></td></tr>)}</tbody></table>
        {rows.length === 0 && <p className="text-center text-slate-500 py-6">Nothing to show yet.</p>}</Card>
    </div>
  );
}
