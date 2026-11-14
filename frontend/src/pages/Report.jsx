import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../App";
import { Area, Badge, Btn, Card, Err, Spinner } from "../ui";
export default function Report() {
  const { id } = useParams(), { user } = useAuth();
  const [s, setS] = useState(null), [err, setErr] = useState(""), [busy, setBusy] = useState(false), [revised, setRevised] = useState(""), [comment, setComment] = useState(""), [compare, setCompare] = useState(false);
  const load = () => api(`/api/submissions/${id}`).then((d) => { setS(d); setRevised(d.report?.improved_content || ""); }).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, [id]);
  const act = async (path, body, ok) => { setBusy(true); setErr(""); try { await api(`/api/submissions/${id}/${path}`, { method: "POST", body }); await load(); } catch (e) { setErr(e.message); } setBusy(false); };
  if (!s) return err ? <Err m={err} /> : <Spinner />;
  const r = s.report;
  const cats = r ? Object.entries(r.category_scores).filter(([, v]) => v != null) : [];
  const canReview = ["reviewer", "admin"].includes(user.role) && s.status === "Pending Approval";
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold">{s.title}</h1><Badge t={s.status} /></div>
      <Err m={err} />
      {!r ? <Card>No analysis report yet. <Btn disabled={busy} onClick={() => act("reanalyse")}>Analyse now</Btn></Card> : <>
        <Card className="flex flex-wrap gap-6 items-center">
          <div className="text-center"><div className="text-5xl font-bold text-violet-600">{r.overall_score}</div><div className="text-sm text-slate-500">{r.overall_status}</div></div>
          <p className="flex-1 min-w-60 text-sm">{r.summary}</p>
          <div className="grid grid-cols-2 gap-x-6 text-sm">{cats.map(([k, v]) => <div key={k}><span className="capitalize text-slate-500">{k.replace("_", " ")}</span> <b>{v}</b></div>)}</div>
        </Card>
        <div className="space-y-3">{r.issues.map((i, n) => <Card key={n}><div className="flex gap-2 items-center flex-wrap"><b>{i.title}</b><Badge t={i.severity} /><span className="text-xs text-slate-500">{i.category}</span></div>
          <p className="text-sm mt-2"><span className="text-slate-500">Found:</span> “{i.original_text}”</p><p className="text-sm mt-1">{i.explanation}</p>
          {i.related_rule && <p className="text-xs text-slate-500 mt-1">Rule: {i.related_rule}</p>}<p className="text-sm mt-2 bg-emerald-50 rounded-xl p-2">Suggestion: {i.suggestion}</p></Card>)}
          {r.issues.length === 0 && <Card className="text-sm">No issues detected.</Card>}</div>
        <Card><h2 className="font-semibold mb-2">Suggested improved content</h2>
          <Area id="rv" label="Edit before applying (your original is kept in revision history)" rows={6} value={revised} onChange={(e) => setRevised(e.target.value)} />
          {compare && <div className="grid md:grid-cols-2 gap-3 mt-3 text-sm"><div className="bg-red-50 rounded-xl p-3"><b>Original</b><p className="mt-1 whitespace-pre-wrap">{s.content}</p></div><div className="bg-emerald-50 rounded-xl p-3"><b>Revised</b><p className="mt-1 whitespace-pre-wrap">{revised}</p></div></div>}
          <div className="flex flex-wrap gap-2 mt-3">
            <Btn variant="ghost" onClick={() => setCompare(!compare)}>Compare original and revised</Btn>
            <Btn disabled={busy} onClick={() => confirm("Apply this text as the new version? The original stays in history.") && act("revise", { content: revised })}>Apply suggested changes &amp; reanalyse</Btn>
            <Btn disabled={busy} variant="ghost" onClick={() => act("reanalyse")}>Reanalyse</Btn>
            {["Issues Found", "Draft", "Rejected"].includes(s.status) && <Btn disabled={busy} onClick={() => act("submit")}>Submit for approval</Btn>}
          </div></Card>
      </>}
      {canReview && <Card><h2 className="font-semibold mb-2">Reviewer decision</h2><Area id="cm" label="Comment or rejection reason" value={comment} onChange={(e) => setComment(e.target.value)} />
        <div className="flex gap-2 mt-3"><Btn disabled={busy} onClick={() => act("decision", { decision: "Approved", comment })}>Approve</Btn>
          <Btn disabled={busy} variant="danger" onClick={() => comment.trim() ? act("decision", { decision: "Rejected", comment }) : setErr("Please give a reason for rejection.")}>Reject</Btn></div></Card>}
      {s.history?.length > 0 && <Card><h2 className="font-semibold mb-2">Review history</h2>{s.history.map((h, i) => <p key={i} className="text-sm py-1 border-b border-slate-50">{new Date(h.at).toLocaleString()} · {h.by} · {h.action}{h.comment ? ` — ${h.comment}` : ""}</p>)}</Card>}
      <Btn variant="ghost" onClick={() => window.print()}>Save report as PDF (print)</Btn>
    </div>
  );
}
