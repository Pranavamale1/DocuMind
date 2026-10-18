import { useState } from "react";
import { BrainCircuit, Mail, Lock, UserRound, Sparkles, FileText, ArrowUp, Check, ShieldCheck, Users, Zap, ArrowRight, Star, X } from "lucide-react";
import { loginUser, registerUser, getCurrentUser } from "../services/api";
import "./Auth.css";

function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const openForm = (nextMode) => { setMode(nextMode); setShowForm(true); setError(""); };
  async function handleSubmit(event) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      if (mode === "register") await registerUser({ name, email, password });
      await loginUser(email, password);
      const user = await getCurrentUser();
      onLogin(user);
    } catch (err) { setError(err.response?.data?.detail || "Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <main className="landing-page">
      <header className="landing-nav">
        <button className="landing-brand" onClick={() => { setShowForm(false); setError(""); }} aria-label="DocuMind home"><span className="landing-brand-icon"><BrainCircuit size={26}/></span><span><strong>DocuMind</strong><small>AI DOCUMENT WORKSPACE</small></span></button>
        <div className="landing-nav-actions"><button className="landing-signin" onClick={() => openForm("login")}>Sign in</button><button className="landing-primary" onClick={() => openForm("register")}>Create account</button></div>
      </header>
      {!showForm ? (
        <>
          <section className="landing-hero">
            <div className="landing-copy"><span className="landing-pill"><Sparkles size={16}/> YOUR AI KNOWLEDGE SPACE</span><h1>Make your documents work smarter for you.</h1><p>Upload your PDFs, find the details that matter, and get answers grounded in your knowledge base.</p><div className="landing-hero-actions"><button className="landing-primary" onClick={() => openForm("register")}>Create account</button><button className="landing-secondary" onClick={() => openForm("login")}>Sign in</button></div><div className="landing-trust"><div className="landing-avatars"><span>P</span><span>A</span><span>D</span></div><div><div className="landing-stars">★★★★★</div><span>Trusted by document-focused teams</span></div></div></div>
            <div className="landing-preview-wrap"><div className="landing-preview"><div className="preview-top"><span className="preview-dots"><i/><i/><i/></span><span>DocuMind Assistant</span></div><div className="preview-body"><aside className="preview-rail"><span><BrainCircuit size={22}/></span><i/><i/><i/></aside><div className="preview-conversation"><div className="preview-lines"><b/><i/></div><div className="preview-user">Summarize my documents</div><div className="preview-answer"><span><BrainCircuit size={17}/></span><div><i/><i/><i/></div></div><span className="preview-file"><FileText size={13}/> Data_analytics_Resume (1).pdf</span><div className="preview-input">Ask a question about your documents...<span><ArrowUp size={17}/></span></div></div></div></div><div className="preview-toast answer-toast"><span><Sparkles size={19}/></span><div><strong>Answer ready</strong><small>In a few seconds</small></div></div><div className="preview-toast source-toast"><span><Check size={19}/></span><div><strong>Source cited</strong><small>Grounded in your PDF</small></div></div></div>
          </section>
          <section className="landing-proof"><div><strong>4.9</strong><span><b className="landing-stars">★★★★★</b><small>Average user rating</small></span></div><blockquote>“DocuMind makes it simple to find the answer and verify where it came from.”<small>Built for clear, source-backed answers</small></blockquote><div className="proof-pdf"><strong>PDF</strong><small>Answers grounded in your documents</small></div></section>
          <section className="landing-features"><span className="landing-eyebrow">CALM, FOCUSED, RELIABLE</span><h2>A better way to work with your documents</h2><p className="features-intro">A focused workspace for asking questions, reviewing sources, and keeping your knowledge close.</p><div className="feature-grid"><article><span><Zap size={23}/></span><h3>Answers without the search</h3><p>Ask naturally and move from a question to the relevant details quickly.</p></article><article><span><ShieldCheck size={23}/></span><h3>Sources you can review</h3><p>Citations stay attached to answers so important details remain verifiable.</p></article><article><span><Users size={23}/></span><h3>Your focused workspace</h3><p>Documents and conversations stay organized in one clear, familiar interface.</p></article></div></section>
          <section className="landing-cta"><div><span className="landing-eyebrow">YOUR DOCUMENTS, READY TO ANSWER</span><h2>Start asking better questions.</h2></div><button onClick={() => openForm("register")}>Create account <ArrowRight size={17}/></button></section>
          <footer className="landing-footer">© DocuMind · AI document workspace</footer>
        </>
      ) : (
        <section className="auth-page landing-auth-page"><button className="auth-back" onClick={() => { setShowForm(false); setError(""); }}><X size={16}/> Back to home</button><section className="auth-card"><div className="auth-brand"><div className="auth-brand-icon"><BrainCircuit size={27}/></div><h1>DocuMind</h1><p>Your AI-powered document assistant</p></div><div className="auth-tabs"><button type="button" className={mode === "login" ? "selected" : ""} onClick={() => {setMode("login");setError("");}}>Sign in</button><button type="button" className={mode === "register" ? "selected" : ""} onClick={() => {setMode("register");setError("");}}>Create account</button></div><h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2><p className="auth-description">{mode === "login" ? "Sign in to continue to your knowledge workspace." : "Create an account to start organizing your documents."}</p><form onSubmit={handleSubmit} className="auth-form">{mode === "register" && <label>Full name<div className="auth-input"><UserRound size={18}/><input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your full name" minLength={2} maxLength={100} required/></div></label>}<label>Email address<div className="auth-input"><Mail size={18}/><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" required/></div></label><label>Password<div className="auth-input"><Lock size={18}/><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="At least 8 characters" minLength={mode === "register" ? 8 : 1} maxLength={128} required/></div></label>{error && <p className="auth-error" role="alert">{error}</p>}<button className="auth-submit" disabled={loading} type="submit">{loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</button></form><p className="auth-footer">Your documents stay in your authenticated workspace.</p></section></section>
      )}
    </main>
  );
}
export default Auth;
