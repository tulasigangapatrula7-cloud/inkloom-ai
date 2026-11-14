export const Card = ({ className = "", ...p }) => <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-5 ${className}`} {...p} />;
export const Btn = ({ variant = "primary", className = "", ...p }) => (
  <button className={`rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${variant === "primary" ? "bg-violet-600 text-white hover:bg-violet-700" : variant === "danger" ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-slate-100 text-slate-700 hover:bg-slate-200"} ${className}`} {...p} />
);
export const Field = ({ label, id, ...p }) => (
  <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}
    <input id={id} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400" {...p} /></label>
);
export const Area = ({ label, id, ...p }) => (
  <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}
    <textarea id={id} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400" {...p} /></label>
);
const col = { Approved: "bg-emerald-100 text-emerald-700", Rejected: "bg-red-100 text-red-700", "Pending Approval": "bg-amber-100 text-amber-700", "Issues Found": "bg-orange-100 text-orange-700", Draft: "bg-slate-100 text-slate-600", Analysing: "bg-blue-100 text-blue-700",
  Low: "bg-slate-100 text-slate-600", Medium: "bg-amber-100 text-amber-700", High: "bg-orange-100 text-orange-700", Critical: "bg-red-100 text-red-700" };
export const Badge = ({ t }) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${col[t] || col.Draft}`}>{t}</span>;
export const Err = ({ m }) => m ? <p role="alert" className="rounded-xl bg-red-50 text-red-700 text-sm px-3 py-2">{m}</p> : null;
export const Spinner = () => <div className="p-10 text-center text-slate-400 animate-pulse">Loading…</div>;
