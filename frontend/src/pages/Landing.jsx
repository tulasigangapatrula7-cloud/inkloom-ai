import { Link } from "react-router-dom";
import { ShieldCheck, FileSearch, Wand2, UserCheck, Image, History, AlertTriangle } from "lucide-react";
const features = [[ShieldCheck, "Guideline compliance", "Checks content against your saved brand rules and banned wording."], [FileSearch, "Claim checking", "Flags claims that conflict with or lack support in your approved facts."], [Image, "Visual review", "Inspects uploaded images for visible text, colours and layout."], [Wand2, "Suggested fixes", "Every issue comes with an explanation and a corrected version."], [UserCheck, "Human approval", "Only authorised reviewers can approve content for publication."], [History, "Review history", "Keep reports, comments and revisions for every piece of content."]];
const steps = ["Upload content", "AI analyses it", "Issues are detected", "Corrections suggested", "Reviewer approves"];
const problems = ["Inconsistent brand communication", "Incorrect or unsupported information", "Tone mismatches", "Visual branding errors", "Slow manual verification"];
export default function Landing() {
  const sec = "max-w-6xl mx-auto px-5 py-16";
  return (
    <div>
      <header className="bg-[#12142b] text-white">
        <nav className="max-w-6xl mx-auto px-5 py-4 flex items-center gap-6 text-sm">
          <span className="font-semibold text-lg mr-auto">InkLoom <span className="text-violet-400">AI</span></span>
          <a href="#home" className="hidden md:inline">Home</a><a href="#features" className="hidden md:inline">Features</a><a href="#how" className="hidden md:inline">How It Works</a><a href="#about" className="hidden md:inline">About</a>
          <Link to="/login">Sign In</Link>
          <Link to="/signup" className="bg-violet-600 hover:bg-violet-500 rounded-xl px-4 py-2">Get Started</Link>
        </nav>
        <div id="home" className="max-w-6xl mx-auto px-5 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-violet-300 text-sm mb-3">Your AI-Powered Brand Guardian</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">Every Brand Has a Voice. Make Sure Every Message Speaks It.</h1>
            <p className="mt-5 text-slate-300">InkLoom AI reviews your content against your brand guidelines and approved facts before it goes live, then sends it to a human reviewer for sign-off.</p>
            <div className="mt-8 flex gap-3 flex-wrap">
              <Link to="/signup" className="bg-violet-600 hover:bg-violet-500 rounded-xl px-5 py-3 font-medium">Start Reviewing Content</Link>
              <a href="#features" className="bg-white/10 hover:bg-white/20 rounded-xl px-5 py-3">Explore Features</a>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-sm space-y-3">
            <p className="text-slate-300">“GreenLeaf <mark className="bg-red-400/30 text-red-100 rounded px-1">guarantees 100% protection</mark> for the environment.”</p>
            <div className="rounded-xl bg-red-500/10 border border-red-400/30 p-3 flex gap-2"><AlertTriangle size={16} className="text-red-300 mt-0.5" /><span><b>Critical:</b> Unsupported guarantee</span></div>
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/30 p-3">Suggested: “GreenLeaf is designed to support environmental responsibility.”</div>
          </div>
        </div>
      </header>
      <section className={sec}><h2 className="text-2xl font-bold mb-6">The problem</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-3">{problems.map(p => <div key={p} className="bg-white rounded-2xl p-4 text-sm shadow-sm">{p}</div>)}</div>
        <p className="mt-6 text-slate-600 max-w-2xl">Employees, agencies, freelancers and AI tools all publish on your behalf. InkLoom AI checks every piece against your own rules, so problems are caught before publication.</p></section>
      <section id="features" className={sec}><h2 className="text-2xl font-bold mb-6">Features</h2>
        <div className="grid md:grid-cols-3 gap-4">{features.map(([I, t, d]) => <div key={t} className="bg-white rounded-2xl p-5 shadow-sm"><I className="text-violet-600" /><h3 className="font-semibold mt-3">{t}</h3><p className="text-sm text-slate-600 mt-1">{d}</p></div>)}</div></section>
      <section id="how" className={sec}><h2 className="text-2xl font-bold mb-6">How it works</h2>
        <ol className="grid md:grid-cols-5 gap-3">{steps.map((s, i) => <li key={s} className="bg-white rounded-2xl p-4 shadow-sm"><span className="text-violet-600 font-bold">{i + 1}</span><p className="text-sm mt-1">{s}</p></li>)}</ol></section>
      <section id="about" className={sec}><h2 className="text-2xl font-bold mb-3">Benefits</h2>
        <p className="text-slate-600 max-w-2xl">Better brand consistency, less manual effort, higher content quality and more trustworthy communication. InkLoom AI only checks claims against the facts you supply. It does not verify statements on the internet, and a human always makes the final call.</p></section>
      <section className="bg-[#12142b] text-white text-center py-16 px-5"><h2 className="text-3xl font-bold">Ready to protect your brand voice?</h2>
        <Link to="/signup" className="inline-block mt-6 bg-violet-600 hover:bg-violet-500 rounded-xl px-6 py-3 font-medium">Get Started</Link></section>
      <footer className="text-center text-sm text-slate-500 py-8">© InkLoom AI · Hackathon project · <a href="#home" className="underline">Back to top</a></footer>
    </div>
  );
}
