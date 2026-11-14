import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../App";
import { Btn, Card, Err, Field } from "../ui";
export default function Auth({ mode }) {
  const { login } = useAuth();
  const su = mode === "signup";
  const [f, setF] = useState({ name: "", email: "", password: "", organisation: "", role: "creator" });
  const [show, setShow] = useState(false), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setErr("");
    if (su && f.name.trim().length < 2) return setErr("Please enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr("Please enter a valid email.");
    if (f.password.length < 8) return setErr("Password must be at least 8 characters.");
    setBusy(true);
    try { login(await api(`/api/auth/${mode}`, { method: "POST", body: su ? f : { email: f.email, password: f.password } })); }
    catch (x) { setErr(x.message); setBusy(false); }
  }
  return (
    <div className="min-h-screen bg-[#12142b] grid place-items-center p-4">
      <Card className="w-full max-w-md">
        <Link to="/" className="font-semibold text-lg">InkLoom <span className="text-violet-600">AI</span></Link>
        <h1 className="text-xl font-bold mt-3 mb-4">{su ? "Create your account" : "Welcome back"}</h1>
        <form onSubmit={submit} className="space-y-3">
          {su && <Field id="name" label="Name" value={f.name} onChange={set("name")} />}
          <Field id="email" label="Email" type="email" value={f.email} onChange={set("email")} />
          <div className="relative"><Field id="pw" label="Password" type={show ? "text" : "password"} value={f.password} onChange={set("password")} />
            <button type="button" aria-label="Toggle password visibility" onClick={() => setShow(!show)} className="absolute right-3 top-8 text-slate-400">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
          {su && <Field id="org" label="Organisation (optional)" value={f.organisation} onChange={set("organisation")} />}
          {su && <label className="block text-sm font-medium text-slate-700">Role (demo mode)
            <select value={f.role} onChange={set("role")} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="creator">Content creator</option><option value="reviewer">Authorised reviewer</option></select></label>}
          <Err m={err} />
          <Btn className="w-full" disabled={busy}>{busy ? "Please wait…" : su ? "Sign up" : "Log in"}</Btn>
        </form>
        <p className="text-sm text-slate-500 mt-4">{su ? "Have an account? " : "New here? "}<Link className="text-violet-600" to={su ? "/login" : "/signup"}>{su ? "Log in" : "Sign up"}</Link></p>
      </Card>
    </div>
  );
}
