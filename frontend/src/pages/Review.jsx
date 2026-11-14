import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { Area, Btn, Card, Err, Field, Spinner } from "../ui";
const TYPES = ["Social media", "Advertisement", "Blog", "Email", "Website copy", "Other"];
const SAMPLE = "GreenLeaf guarantees 100% protection for the environment. Our product is the world's best solution and gives instant results.";
export default function Review() {
  const nav = useNavigate();
  const [brands, setBrands] = useState(null), [title, setTitle] = useState(""), [brand, setBrand] = useState(""), [type, setType] = useState(TYPES[0]), [text, setText] = useState(""), [file, setFile] = useState(null), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => { api("/api/brands").then((b) => { setBrands(b); if (b[0]) setBrand(b[0].id); }).catch((e) => setErr(e.message)); }, []);
  async function go(e) {
    e.preventDefault(); setErr("");
    if (!title.trim()) return setErr("Please enter a title.");
    if (!brand) return setErr("Please select a brand profile.");
    if (!text.trim() && !file) return setErr("Paste text or upload a file.");
    if (file && file.size > 10 * 1024 * 1024) return setErr("File must be under 10 MB.");
    const form = new FormData();
    Object.entries({ title, brand_id: brand, content_type: type, text }).forEach(([k, v]) => form.append(k, v));
    if (file) form.append("file", file);
    setBusy(true);
    try { const r = await api("/api/submissions", { method: "POST", form }); nav(`/app/report/${r.id}`); }
    catch (x) { setErr(x.message); setBusy(false); }
  }
  if (!brands) return err ? <Err m={err} /> : <Spinner />;
  if (!brands.length) return <Card>Create a brand profile first. <Link className="text-violet-600" to="/app/brands">Go to Brand Profiles</Link></Card>;
  return (
    <div className="space-y-4"><h1 className="text-2xl font-bold">Review Content</h1>
      <Card><form onSubmit={go} className="space-y-3">
        <div className="grid md:grid-cols-3 gap-3">
          <Field id="t" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <label className="block text-sm font-medium text-slate-700">Brand profile<select value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
          <label className="block text-sm font-medium text-slate-700">Content type<select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">{TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
        </div>
        <Area id="c" label="Paste your content" rows={8} value={text} onChange={(e) => setText(e.target.value)} />
        <label className="block text-sm font-medium text-slate-700">Or upload TXT, PDF, DOCX, JPG or PNG<input type="file" accept=".txt,.pdf,.docx,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} className="mt-1 block text-sm" /></label>
        <Err m={err} />
        <div className="flex gap-2"><Btn disabled={busy}>{busy ? "Analysing… this can take a moment" : "Analyse with InkLoom AI"}</Btn>
          <Btn type="button" variant="ghost" onClick={() => { setTitle("GreenLeaf demo post"); setText(SAMPLE); }}>Use demo content</Btn></div>
      </form></Card>
      <p className="text-xs text-slate-500">Image analysis reads visible text, colours and layout. It cannot confirm exact logo matches.</p>
    </div>
  );
}
