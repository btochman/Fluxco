"use client";

import { useState } from "react";
import { Zap, Mail, ArrowRight } from "lucide-react";

export function EmailGate({ onAccess }: { onAccess: () => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/deck/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        onAccess();
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="eg-container">
        <div className="eg-glow eg-glow-1" />
        <div className="eg-glow eg-glow-2" />
        <div className="eg-card">
          <div className="eg-logo">
            <div className="eg-logo-icon">
              <Zap className="w-6 h-6" />
            </div>
            <span>FLUXCO</span>
          </div>
          <div className="eg-icon">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="eg-title">Investor Deck</h1>
          <p className="eg-subtitle">
            Enter your email to view the deck.
          </p>
          <form onSubmit={handleSubmit} className="eg-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="eg-input"
              autoFocus
              required
            />
            {error && <p className="eg-error">{error}</p>}
            <button type="submit" disabled={loading || !email} className="eg-btn">
              {loading ? "Loading…" : "View Deck"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

const styles = `
  :root {
    --eg-blue: #2d8cff;
    --eg-bg: #08090a;
    --eg-surface: rgba(255,255,255,0.04);
    --eg-border: rgba(255,255,255,0.08);
    --eg-text: rgba(255,255,255,0.7);
    --eg-text-dim: rgba(255,255,255,0.4);
  }

  *, *::before, *::after { box-sizing: border-box; }

  .eg-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    font-family: 'Inter', -apple-system, sans-serif;
    background: var(--eg-bg);
  }

  .eg-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);
    pointer-events: none;
  }
  .eg-glow-1 { width: 500px; height: 500px; top: -100px; right: -100px; background: rgba(45,140,255,0.08); }
  .eg-glow-2 { width: 400px; height: 400px; bottom: -50px; left: 10%; background: rgba(230,57,70,0.05); }

  .eg-card {
    position: relative;
    z-index: 1;
    background: var(--eg-surface);
    border: 1px solid var(--eg-border);
    border-radius: 16px;
    padding: 48px;
    max-width: 400px;
    width: 100%;
    text-align: center;
    backdrop-filter: blur(20px);
  }

  .eg-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-family: 'Oswald', sans-serif;
    font-weight: 700;
    font-size: 20px;
    color: #fff;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 32px;
  }
  .eg-logo-icon {
    width: 36px; height: 36px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--eg-blue), rgba(45,140,255,0.3));
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  .eg-icon {
    color: var(--eg-text-dim);
    margin-bottom: 16px;
    display: flex;
    justify-content: center;
  }

  .eg-title {
    font-family: 'Inter', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 8px 0;
  }

  .eg-subtitle {
    font-size: 14px;
    color: var(--eg-text-dim);
    margin: 0 0 32px 0;
    line-height: 1.5;
  }

  .eg-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .eg-input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid var(--eg-border);
    background: rgba(255,255,255,0.03);
    color: #fff;
    font-size: 15px;
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.2s;
  }
  .eg-input:focus {
    border-color: var(--eg-blue);
    box-shadow: 0 0 0 3px rgba(45,140,255,0.1);
  }
  .eg-input::placeholder {
    color: var(--eg-text-dim);
  }

  .eg-error {
    color: #e63946;
    font-size: 13px;
    margin: 0;
  }

  .eg-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    border: none;
    background: var(--eg-blue);
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .eg-btn:hover { opacity: 0.9; }
  .eg-btn:disabled { opacity: 0.5; cursor: not-allowed; }
`;
