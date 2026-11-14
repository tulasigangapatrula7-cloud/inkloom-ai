import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../App";
import { Badge, Card, Err, Spinner } from "../ui";
export default function Dashboard() {
  const { user } = useAuth();
  const [subs, setSubs] = useState(null), [err, setErr] = useState("");
  useEffect(() => { api("/api/submissions").then(setSubs).catch((e) => setErr(e.message)); }, []);
  if (err) return <Err m={err} />;
  if (!subs) return <Spinner />;
  const scored = subs.filter((s) => s.overall_score != null);
  const avg = scored.length ? Math.round(scored.reduce((a, s) => a + s.overall_score, 0) / scored.length) : "–";
  const stats = [["Content reviewed", scored.length], ["Issues detected", subs.reduce((a, s) => a + (s.issue_count || 0), 0)], ["Approved", subs.filter((s) => s.status === "Approved").length], ["Pending reviews", subs.filter((s) => s.status === "Pending Approval").length]];
  const dist = ["Critical", "High", "Medium", "Low"].map((k) => [k, subs.reduce((a, s) => a + ((s.severity_counts || {})[k] || 0), 0)]);
  const max = Math.max(1, ...dist.map((d) => d[1]));
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2"><h1 className="text-2xl font-bold">Welcome, {user.name.split(" ")[0]}</h1>
        <Link to="/app/review" className="bg-violet-600 text-white rounded-xl px-4 py-2 text-sm">Review new content</Link></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{stats.map(([l, v]) => <Card key={l}><p className="text-sm text-slate-500">{l}</p><p className="text-3xl font-bold mt-1">{v}</p></Card>)}</div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card><h2 className="font-semibold mb-3">Average compliance score: {avg}</h2>
          {dist.map(([k, n]) => <div key={k} className="flex items-center gap-2 text-sm mb-2"><span className="w-16">{k}</span><div className="flex-1 bg-slate-100 rounded-full h-2"><div className="bg-violet-500 h-2 rounded-full" style={{ width: `${(n / max) * 100}%` }} /></div><span>{n}</span></div>)}</Card>
        <Card><h2 className="font-semibold mb-3">Recent activity</h2>
          {subs.length === 0 && <p className="text-sm text-slate-500">No content yet. Create a brand profile, then review your first piece.</p>}
          {subs.slice(0, 5).map((s) => <Link key={s.id} to={`/app/report/${s.id}`} className="flex justify-between items-center py-2 text-sm border-b border-slate-50"><span>{s.title}</span><Badge t={s.status} /></Link>)}</Card>
      </div>
    </div>
  );
}
