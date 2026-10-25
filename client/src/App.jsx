
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api";

export default function App() {
  const [token, setToken] = useState(
    () => sessionStorage.getItem("knowflow_token") || ""
  );
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("knowflow_user") || "null");
    } catch {
      return null;
    }
  });

  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("DemoPass123!");
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadDocuments(authToken = token) {
    if (!authToken) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/documents`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load documents.");
      }

      setDocuments(data.documents || []);
    } catch (err) {
      setError(err.message || "Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) loadDocuments(token);
  }, [token]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationSlug: "demo-company-mvningzn",
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      sessionStorage.setItem("knowflow_token", data.token);
      sessionStorage.setItem("knowflow_user", JSON.stringify(data.user));

      setUser(data.user);
      setToken(data.token);
      setNotice("Welcome to your workspace.");
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Choose a .txt file before uploading.");
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".txt")) {
      setError("For now, Knowflow supports .txt files only.");
      return;
    }

    const formData = new FormData();
    formData.append("document", selectedFile);

    setUploading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Document upload failed.");
      }

      setNotice(`${selectedFile.name} uploaded successfully.`);
      setSelectedFile(null);
      event.target.reset();

      await loadDocuments(token);
    } catch (err) {
      setError(err.message || "Unable to upload the document.");
    } finally {
      setUploading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("knowflow_token");
    sessionStorage.removeItem("knowflow_user");
    setToken("");
    setUser(null);
    setDocuments([]);
    setPage("dashboard");
    setError("");
    setNotice("");
  }

  if (!token) {
    return (
      <main className="login-screen">
        <section className="login-brand">
          <div className="brand-mark">K</div>
          <span className="brand-name">knowflow</span>

          <div className="login-pitch">
            <span className="eyebrow">YOUR TEAM'S KNOWLEDGE HUB</span>
            <h1>All your knowledge.<br />One intelligent workspace.</h1>
            <p>
              Bring your company documents together and make knowledge
              easier to access, understand and use.
            </p>
            <div className="feature-pills">
              <span>↗ Organized knowledge</span>
              <span>◈ Secure workspaces</span>
            </div>
          </div>

          <p className="brand-footer">Knowledge that moves work forward.</p>
        </section>

        <section className="login-panel">
          <form className="login-card" onSubmit={handleLogin}>
            <span className="eyebrow">WELCOME BACK</span>
            <h2>Sign in to Knowflow</h2>
            <p className="muted">
              Enter your workspace credentials to continue.
            </p>

            {error && <div className="alert error">{error}</div>}

            <label htmlFor="email">Work email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            <button className="primary-button full-width" disabled={loading}>
              {loading ? "Signing in..." : "Sign in to workspace →"}
            </button>

            <p className="login-footnote">
              Demo workspace · Knowflow development environment
            </p>
          </form>
        </section>
      </main>
    );
  }

  const readyCount = documents.filter(
    (document) => document.status === "ready"
  ).length;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#dashboard" onClick={() => setPage("dashboard")}>
          <span className="brand-mark">K</span>
          <span className="brand-name">knowflow</span>
        </a>

        <div className="workspace-switcher">
          <div className="workspace-avatar">
            {(user?.organization?.name || "D").charAt(0).toUpperCase()}
          </div>
          <div className="workspace-info">
            <strong>{user?.organization?.name || "Demo Company"}</strong>
            <span>Team workspace</span>
          </div>
          <span className="switcher-dots">•••</span>
        </div>

        <span className="nav-label">WORKSPACE</span>
        <nav className="sidebar-nav">
          <button
            className={page === "dashboard" ? "nav-item active" : "nav-item"}
            onClick={() => {
              setPage("dashboard");
              setError("");
              setNotice("");
            }}
          >
            <span>▦</span> Overview
          </button>
          <button
            className={page === "documents" ? "nav-item active" : "nav-item"}
            onClick={() => {
              setPage("documents");
              setError("");
              setNotice("");
              loadDocuments();
            }}
          >
            <span>▤</span> Documents
            <span className="nav-count">{documents.length}</span>
          </button>
          <div className="nav-item disabled-nav" title="Coming next">
            <span>✧</span> Ask Knowflow
            <span className="coming-soon">Soon</span>
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-row">
            <div className="profile-avatar">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <strong>{user?.name || "Demo User"}</strong>
              <span>{user?.email || email}</span>
            </div>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            ↪ Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span>{" "}
            {page === "documents" ? "Documents" : "Overview"}
          </div>
          <div className="topbar-right">
            <span className="connection-dot" />
            <span>Workspace connected</span>
            <div className="top-avatar">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="page-content">
          {error && <div className="alert error">{error}</div>}
          {notice && <div className="alert success">{notice}</div>}

          {page === "dashboard" ? (
            <>
              <section className="welcome-section">
                <div>
                  <span className="eyebrow">YOUR KNOWLEDGE, CONNECTED</span>
                  <h1>Good to have you here{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.</h1>
                  <p>
                    Bring your team's knowledge together, one document at a time.
                  </p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => setPage("documents")}
                >
                  + Add document
                </button>
              </section>

              <section className="stats-grid">
                <article className="stat-card">
                  <div className="stat-icon purple">▤</div>
                  <span>Total documents</span>
                  <strong>{documents.length}</strong>
                  <small>In your workspace</small>
                </article>
                <article className="stat-card">
                  <div className="stat-icon green">✓</div>
                  <span>Ready to use</span>
                  <strong>{readyCount}</strong>
                  <small>Successfully processed</small>
                </article>
                <article className="stat-card">
                  <div className="stat-icon amber">✧</div>
                  <span>Knowledge assistant</span>
                  <strong>Coming soon</strong>
                  <small>Ask questions across documents</small>
                </article>
              </section>

              <section className="content-card">
                <div className="section-heading">
                  <div>
                    <h2>Get started with Knowflow</h2>
                    <p>Build your team's searchable knowledge base.</p>
                  </div>
                </div>
                <div className="getting-started-grid">
                  <button
                    className="action-tile"
                    onClick={() => setPage("documents")}
                  >
                    <span className="tile-icon">↥</span>
                    <strong>Upload a document</strong>
                    <span>Add a text file to your workspace.</span>
                    <b>Open document library →</b>
                  </button>
                  <div className="action-tile future-tile">
                    <span className="tile-icon">✧</span>
                    <strong>Ask your knowledge</strong>
                    <span>Find answers grounded in your documents.</span>
                    <b>Available in the next step</b>
                  </div>
                </div>
              </section>

              <section className="content-card">
                <div className="section-heading">
                  <div>
                    <h2>Recent documents</h2>
                    <p>Your latest workspace uploads.</p>
                  </div>
                  <button className="text-button" onClick={() => setPage("documents")}>
                    View all →
                  </button>
                </div>
                <DocumentList documents={documents.slice(0, 4)} loading={loading} />
              </section>
            </>
          ) : (
            <>
              <section className="welcome-section">
                <div>
                  <span className="eyebrow">KNOWLEDGE LIBRARY</span>
                  <h1>Your documents</h1>
                  <p>Upload and manage the knowledge your workspace relies on.</p>
                </div>
              </section>

              <section className="content-card upload-card">
                <div className="section-heading">
                  <div>
                    <h2>Upload a document</h2>
                    <p>Supported format: .txt · Maximum size: 2 MB</p>
                  </div>
                  <div className="upload-symbol">↥</div>
                </div>

                <form onSubmit={handleUpload}>
                  <label className="drop-zone">
                    <input
                      type="file"
                      accept=".txt,text/plain"
                      onChange={(event) =>
                        setSelectedFile(event.target.files?.[0] || null)
                      }
                    />
                    <span className="drop-icon">↑</span>
                    <strong>
                      {selectedFile ? selectedFile.name : "Choose a text file"}
                    </strong>
                    <span>
                      {selectedFile
                        ? `${(selectedFile.size / 1024).toFixed(1)} KB selected`
                        : "Browse files from your computer"}
                    </span>
                  </label>

                  <div className="upload-actions">
                    <span className="muted">Your file will be added to this workspace.</span>
                    <button
                      className="primary-button"
                      type="submit"
                      disabled={uploading || !selectedFile}
                    >
                      {uploading ? "Uploading..." : "Upload document →"}
                    </button>
                  </div>
                </form>
              </section>

              <section className="content-card">
                <div className="section-heading">
                  <div>
                    <h2>All documents <span className="heading-count">{documents.length}</span></h2>
                    <p>Files available in your workspace.</p>
                  </div>
                  <button
                    className="secondary-button"
                    onClick={() => loadDocuments()}
                    disabled={loading}
                  >
                    ↻ Refresh
                  </button>
                </div>
                <DocumentList documents={documents} loading={loading} />
              </section>
            </>
          )}

          <footer className="page-footer">
            <span>Knowflow · Your team's knowledge workspace</span>
            <span>Built for clarity and collaboration</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function DocumentList({ documents, loading }) {
  if (loading) {
    return <div className="empty-state">Loading your documents...</div>;
  }

  if (documents.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">▤</span>
        <strong>No documents yet</strong>
        <p>Upload your first text file to get started.</p>
      </div>
    );
  }

  return (
    <div className="document-list">
      {documents.map((document) => (
        <div className="document-row" key={document.id}>
          <div className="file-icon">TXT</div>
          <div className="document-info">
            <strong>{document.filename}</strong>
            <span>
              Added{" "}
              {new Date(document.created_at).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <span className={`status-pill ${document.status}`}>
            <span /> {document.status}
          </span>
        </div>
      ))}
    </div>
  );
}
