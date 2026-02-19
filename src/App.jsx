import { useState, useEffect } from "react";

// ─── CONFIG (replace with real keys) ────────────────────────────────────────
const ANTHROPIC_API_URL = "/.netlify/functions/analyze";
const STRIPE_PAYMENT_URL = "/.netlify/functions/create-checkout";
// ────────────────────────────────────────────────────────────────────────────

const EXAMPLES = [
  { idea: "AI content agency", claim: "€10,000/month", time: "30 days" },
  { idea: "Faceless YouTube channel with AI", claim: "€5,000/month", time: "60 days" },
  { idea: "AI chatbot for restaurants", claim: "€3,000/month passive", time: "2 weeks" },
];

function ScoreBar({ score }) {
  return (
    <div className="score-wrap">
      <div className="score-track">
        <div className="score-fill" style={{ width: `${score * 10}%` }} />
      </div>
      <span className="score-num">{score}<span className="score-denom">/10</span></span>
    </div>
  );
}

function ResultCard({ data, locked, onUnlock, loading }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-tag">ANALYSIS</span>
        <span className="card-brand">CASHORCLOUT.COM</span>
      </div>

      <section className="card-section">
        <h3 className="section-label">IDEA IN PLAIN ENGLISH</h3>
        <p className="section-body">{data.plainEnglish}</p>
      </section>

      <section className="card-section">
        <h3 className="section-label">WHAT WOULD NEED TO BE TRUE</h3>
        <ul className="truth-list">
          {data.truths.map((t, i) => (
            <li key={i}><span className="truth-dot">→</span>{t}</li>
          ))}
        </ul>
      </section>

      <div className="card-row">
        <section className="card-section half">
          <h3 className="section-label">EFFORT REALITY</h3>
          <ScoreBar score={data.effortScore} />
        </section>
        <section className="card-section half">
          <h3 className="section-label">ACTUALLY "EASY"?</h3>
          <span className={`easy-badge ${data.isEasy === "Yes" ? "yes" : data.isEasy === "No" ? "no" : "maybe"}`}>
            {data.isEasy}
          </span>
        </section>
      </div>

      <div className="card-row">
        <section className="card-section half">
          <h3 className="section-label">WHY IT FEELS EASY</h3>
          <p className="section-body small">{data.whyFeelsEasy}</p>
        </section>
        <section className="card-section half">
          <h3 className="section-label">WHY IT'S NOT</h3>
          <p className="section-body small">{data.whyNot}</p>
        </section>
      </div>

      <section className="card-section">
        <h3 className="section-label">REALISTIC TIME BEFORE FIRST €1</h3>
        <p className="time-value">{data.realisticTime}</p>
      </section>

      {/* LOCKED SECTION */}
      <div className={`locked-zone ${locked ? "is-locked" : "is-unlocked"}`}>
        {locked && (
          <div className="lock-overlay">
            <div className="lock-content">
              <div className="lock-icon">🔒</div>
              <p className="lock-title">Verdict + What Actually Works</p>
              <p className="lock-sub">The part the gurus don't want you to read.</p>
              <button className="unlock-btn" onClick={onUnlock} disabled={loading}>
                {loading ? "Redirecting..." : "Unlock for €19"}
              </button>
            </div>
          </div>
        )}
        <section className="card-section">
          <h3 className="section-label">VERDICT</h3>
          <p className={`verdict-text ${locked ? "blurred" : ""}`}>{data.verdict || "The verdict will appear here after unlock."}</p>
        </section>
        <section className="card-section">
          <h3 className="section-label">WHAT WOULD ACTUALLY WORK INSTEAD</h3>
          <p className={`section-body ${locked ? "blurred" : ""}`}>{data.whatWorks || "A concrete alternative path will appear here."}</p>
        </section>
      </div>

      <div className="card-footer">
        <button className="share-btn" onClick={handleCopy}>
          {copied ? "✓ Link copied" : "Share this analysis"}
        </button>
      </div>
    </div>
  );
}

function LandingHero({ onStart }) {
  return (
    <div className="hero">
      <div className="hero-eyebrow">The BS Detector for AI Money Claims</div>
      <h1 className="hero-title">
        Cash Or<br />Clout.
      </h1>
      <p className="hero-sub">
        Every week, thousands of creators claim you can make €10k/month with AI in 30 days.<br />
        We stress-test those claims. Coldly. Precisely. No fluff.
      </p>
      <button className="hero-cta" onClick={onStart}>
        Analyze an idea →
      </button>
      <div className="hero-proof">
        <span>Free preview</span>
        <span className="dot">·</span>
        <span>Full verdict €19</span>
        <span className="dot">·</span>
        <span>Results in seconds</span>
      </div>
    </div>
  );
}

function ExampleTicker() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % EXAMPLES.length), 3000);
    return () => clearInterval(t);
  }, []);
  const ex = EXAMPLES[idx];
  return (
    <div className="ticker">
      <span className="ticker-label">TRENDING CLAIM</span>
      <span className="ticker-text">"{ex.claim}/month with {ex.idea}" in {ex.time}</span>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("landing"); // landing | form | loading | result
  const [form, setForm] = useState({ idea: "", claim: "", timeframe: "" });
  const [result, setResult] = useState(null);
  const [locked, setLocked] = useState(true);
  const [error, setError] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!form.idea.trim() || !form.claim.trim()) {
      setError("Add the idea and the income claim at minimum.");
      return;
    }
    setError("");
    setView("loading");

    try {
      const res = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setLocked(true);
      setView("result");
    } catch (e) {
      setError("Something went wrong. Try again.");
      setView("form");
    }
  };

  const handleUnlock = async () => {
    setPayLoading(true);
    try {
      const res = await fetch(STRIPE_PAYMENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId: result?.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setPayLoading(false);
    }
  };

  return (
    <div className="app">
      <nav className="nav">
        <span className="nav-logo" onClick={() => setView("landing")}>COC</span>
        <span className="nav-tagline">CashOrClout</span>
      </nav>

      <main className="main">
        {view === "landing" && (
          <>
            <ExampleTicker />
            <LandingHero onStart={() => setView("form")} />
          </>
        )}

        {view === "form" && (
          <div className="form-wrap">
            <h2 className="form-title">What's the claim?</h2>
            <p className="form-sub">Paste the idea you saw on TikTok or Instagram. We'll do the math.</p>

            <div className="field">
              <label>The AI business idea</label>
              <input
                value={form.idea}
                onChange={e => setForm(f => ({ ...f, idea: e.target.value }))}
                placeholder="e.g. AI content agency, faceless YouTube channel..."
              />
            </div>
            <div className="field">
              <label>The income claim</label>
              <input
                value={form.claim}
                onChange={e => setForm(f => ({ ...f, claim: e.target.value }))}
                placeholder="e.g. €10,000/month, passive income..."
              />
            </div>
            <div className="field">
              <label>Timeframe <span className="optional">(optional)</span></label>
              <input
                value={form.timeframe}
                onChange={e => setForm(f => ({ ...f, timeframe: e.target.value }))}
                placeholder="e.g. 30 days, 3 months..."
              />
            </div>

            {error && <p className="error">{error}</p>}

            <button className="analyze-btn" onClick={handleAnalyze}>
              Run the analysis →
            </button>
            <p className="form-note">Free preview · Full verdict €19</p>
          </div>
        )}

        {view === "loading" && (
          <div className="loading-wrap">
            <div className="loading-spinner" />
            <p className="loading-text">Running the numbers...</p>
            <p className="loading-sub">Stress-testing the claim against reality</p>
          </div>
        )}

        {view === "result" && result && (
          <div className="result-wrap">
            <ResultCard
              data={result}
              locked={locked}
              onUnlock={handleUnlock}
              loading={payLoading}
            />
            <button className="new-analysis" onClick={() => { setView("form"); setForm({ idea: "", claim: "", timeframe: "" }); }}>
              ← Analyze another idea
            </button>
          </div>
        )}
      </main>

      <footer className="footer">
        <span>© 2025 CashOrClout</span>
        <span className="dot">·</span>
        <span>We don't sell dreams. We sell clarity.</span>
      </footer>
    </div>
  );
}
