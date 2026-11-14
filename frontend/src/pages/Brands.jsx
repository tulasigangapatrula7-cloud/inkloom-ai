import { useEffect, useState } from "react";
import { api } from "../api";
import { Area, Btn, Card, Err, Field, Spinner } from "../ui";
const empty = { name: "", description: "", voice: "", tone: "", audience: "", approved_terms: "", avoid_words: "", writing_guidelines: "", colours: "", approved_facts: "", extra_instructions: "" };
const GREEN = { name: "GreenLeaf (demo)", description: "Eco-friendly household products.", voice: "Friendly, trustworthy, professional", tone: "Clear, positive, informative", audience: "Environmentally conscious households", approved_terms: "sustainable, eco-friendly, responsible", avoid_words: "guaranteed results, 100% risk-free, world's best, instant results", writing_guidelines: "Use clear, simple language. Avoid exaggerated promises. Avoid unsupported environmental claims.", colours: "#2E7D32, #A5D6A7", approved_facts: "Packaging is made from 70% recycled materials.", extra_instructions: "" };
const list = (s) => s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
const LISTS = ["approved_terms", "avoid_words", "colours"];
export default function Brands() {
  const [brands, setBrands] = useState(null), [f, setF] = useState(empty), [editId, setEditId] = useState(null), [err, setErr] = useState(""), [msg, setMsg] = useState("");
  const load = () => api("/api/brands").then(setBrands).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const edit = (b) => { setEditId(b.id); setF(Object.fromEntries(Object.keys(empty).map((k) => [k, LISTS.includes(k) ? (b[k] || []).join(", ") : b[k] || ""]))); window.scrollTo(0, 0); };
  async function save(e) {
    e.preventDefault(); setErr(""); setMsg("");
    if (!f.name.trim()) return setErr("Brand name is required.");
    const body = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, LISTS.includes(k) ? list(v) : v]));
    try { await api(editId ? `/api/brands/${editId}` : "/api/brands", { method: editId ? "PUT" : "POST", body }); setMsg("Brand profile saved."); setF(empty); setEditId(null); load(); }
    catch (x) { setErr(x.message); }
  }
  async function del(b) { if (!confirm(`Delete "${b.name}"? This cannot be undone.`)) return; try { await api(`/api/brands/${b.id}`, { method: "DELETE" }); load(); } catch (x) { setErr(x.message); } }
  if (!brands) return err ? <Err m={err} /> : <Spinner />;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Brand Profiles</h1>
      <Card><div className="flex justify-between mb-3"><h2 className="font-semibold">{editId ? "Edit profile" : "New profile"}</h2><Btn variant="ghost" type="button" onClick={() => { setF(GREEN); setEditId(null); }}>Load GreenLeaf demo</Btn></div>
        <form onSubmit={save} className="grid md:grid-cols-2 gap-3">
          <Field id="n" label="Brand name" value={f.name} onChange={set("name")} />
          <Field id="v" label="Brand voice" value={f.voice} onChange={set("voice")} />
          <Field id="t" label="Preferred tone" value={f.tone} onChange={set("tone")} />
          <Field id="a" label="Target audience" value={f.audience} onChange={set("audience")} />
          <Field id="c" label="Brand colours (comma separated)" value={f.colours} onChange={set("colours")} />
          <Area id="d" label="Description" value={f.description} onChange={set("description")} />
          <Area id="at" label="Approved terminology (comma separated)" value={f.approved_terms} onChange={set("approved_terms")} />
          <Area id="aw" label="Words and phrases to avoid" value={f.avoid_words} onChange={set("avoid_words")} />
          <Area id="w" label="Writing guidelines" value={f.writing_guidelines} onChange={set("writing_guidelines")} />
          <Area id="af" label="Approved factual information" value={f.approved_facts} onChange={set("approved_facts")} />
          <Area id="x" label="Additional instructions" value={f.extra_instructions} onChange={set("extra_instructions")} />
          <div className="md:col-span-2 space-y-2"><Err m={err} />{msg && <p className="text-sm text-emerald-600">{msg}</p>}
            <div className="flex gap-2"><Btn>{editId ? "Update profile" : "Save profile"}</Btn>{editId && <Btn type="button" variant="ghost" onClick={() => { setEditId(null); setF(empty); }}>Cancel</Btn>}</div></div>
        </form></Card>
      {brands.length === 0 && <p className="text-slate-500 text-sm">No brand profiles yet.</p>}
      <div className="grid md:grid-cols-2 gap-4">{brands.map((b) => <Card key={b.id}><h3 className="font-semibold">{b.name}</h3><p className="text-sm text-slate-500">{b.voice}</p>
        <div className="flex gap-2 mt-3"><Btn variant="ghost" onClick={() => edit(b)}>Edit</Btn><Btn variant="danger" onClick={() => del(b)}>Delete</Btn></div></Card>)}</div>
    </div>
  );
}
