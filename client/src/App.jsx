
import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/auth";

export default function App() {
  const [organizationSlug, setOrganizationSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationSlug, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to sign in");
      }

      sessionStorage.setItem("token", data.token);
      setUser(data.user);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot reach the server. Check that your backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("token");
    setUser(null);
    setPassword("");
  }

  return (
    <main className="page">
      <section className="visual-panel">
        <div className="brand">
          <div className="brand-mark">✳</div>
          <span>Knowflow</span>
        </div>

        <div className="hero">
          <span className="eyebrow">YOUR KNOWLEDGE. CONNECTED.</span>
          <h1>Turn what you know into what you can do.</h1>
          <p>
            One intelligent workspace for your documents, company knowledge,
            and better decisions.
          </p>

          <div className="feature">
            <span>01</span>
            <div>
              <strong>Knowledge, organized</strong>
              <p>Bring your team's information into one place.</p>
            </div>
          </div>
          <div className="feature">
            <span>02</span>
            <div>
              <strong>Answers with context</strong>
              <p>Find the information you need, without the digging.</p>
            </div>
          </div>
          <div className="feature">
            <span>03</span>
            <div>
              <strong>Decisions with confidence</strong>
              <p>Spend less time searching and more time moving forward.</p>
            </div>
          </div>
        </div>

        <div className="panel-footer">BUILT FOR TEAMS THAT THINK AHEAD.</div>
      </section>

      <section className="form-panel">
        <div className="form-wrap">
          <div className="mobile-brand">
            <div className="brand-mark">✳</div>
            <span>Knowflow</span>
          </div>

          {user ? (
            <div className="welcome">
              <div className="success-mark">✓</div>
              <span className="eyebrow">AUTHENTICATED SUCCESSFULLY</span>
              <h2>Welcome, {user.name}.</h2>
              <p>
                You're signed in to <strong>{user.organizationName}</strong>.
              </p>
              <div className="account-card">
                <span>WORKSPACE</span>
                <strong>{user.organizationSlug}</strong>
                <span>EMAIL</span>
                <strong>{user.email}</strong>
              </div>
              <button className="submit-btn" onClick={handleLogout}>
                Sign out <span>↗</span>
              </button>
            </div>
          ) : (
            <>
              <div className="form-heading">
                <span className="eyebrow">WELCOME BACK</span>
                <h2>Sign in to your workspace.</h2>
                <p>Your knowledge hub is just a sign-in away.</p>
              </div>

              <form onSubmit={handleLogin}>
                <label htmlFor="organizationSlug">Workspace slug</label>
                <input
                  id="organizationSlug"
                  value={organizationSlug}
                  onChange={(e) => setOrganizationSlug(e.target.value)}
                  placeholder="e.g. demo-company-abc123"
                  autoComplete="organization"
                  required
                />

                <label htmlFor="email">Work email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="username"
                  required
                />

                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                {error && <div className="error-message">{error}</div>}

                <button className="submit-btn" disabled={loading}>
                  {loading ? "Signing you in..." : "Sign in to workspace"}
                  {!loading && <span>→</span>}
                </button>
              </form>

              <p className="security-note">
                <span>⌑</span> Secure access to your organization's knowledge.
              </p>
            </>
          )}
        </div>
        <footer>© 2026 Knowflow · Knowledge that moves you forward</footer>
      </section>
    </main>
  );
}
