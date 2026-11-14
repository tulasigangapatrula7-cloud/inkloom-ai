import { createContext, useContext, useEffect, useState } from "react";
import { Routes, Route, Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Palette, ScanSearch, History as Hist, LogOut } from "lucide-react";
import { api } from "./api";
import { Spinner } from "./ui";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Brands from "./pages/Brands";
import Review from "./pages/Review";
import Report from "./pages/Report";
import History from "./pages/History";

const AuthCtx = createContext();
export const useAuth = () => useContext(AuthCtx);

function Shell() {
  const { user, logout } = useAuth();
  const links = [["/app", "Dashboard", LayoutDashboard], ["/app/brands", "Brand Profiles", Palette], ["/app/review", "Review Content", ScanSearch], ["/app/history", "History", Hist]];
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-[#12142b] text-slate-300 md:w-60 md:min-h-screen p-4 flex md:flex-col gap-1 overflow-x-auto">
        <div className="text-white font-semibold text-lg px-2 py-2 hidden md:block">InkLoom <span className="text-violet-400">AI</span></div>
        {links.map(([to, label, Icon]) => (
          <NavLink key={to} to={to} end={to === "/app"} className={({ isActive }) => `flex items-center gap-2 rounded-xl px-3 py-2 text-sm whitespace-nowrap ${isActive ? "bg-violet-600 text-white" : "hover:bg-white/10"}`}><Icon size={16} />{label}</NavLink>
        ))}
        <div className="md:mt-auto text-xs px-2 hidden md:block">{user.name}<br /><span className="text-violet-300 capitalize">{user.role}</span></div>
        <button onClick={logout} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/10"><LogOut size={16} />Log out</button>
      </aside>
      <main className="flex-1 p-4 md:p-8 max-w-6xl"><Outlet /></main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const nav = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("token")) return setReady(true);
    api("/api/auth/me").then(setUser).catch(() => localStorage.removeItem("token")).finally(() => setReady(true));
  }, []);
  const login = (d) => { localStorage.setItem("token", d.token); setUser(d.user); nav("/app"); };
  const logout = () => { localStorage.removeItem("token"); setUser(null); nav("/"); };
  if (!ready) return <Spinner />;
  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />
        <Route path="/app" element={<Shell />}>
          <Route index element={<Dashboard />} />
          <Route path="brands" element={<Brands />} />
          <Route path="review" element={<Review />} />
          <Route path="report/:id" element={<Report />} />
          <Route path="history" element={<History />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthCtx.Provider>
  );
}
