"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BACKEND = "https://bhvi2383-live-wedding-ai.hf.space";
const SERVICE_EMAIL = "wedding-ai-bot@live-wedding-ai.iam.gserviceaccount.com";

export default function NewEventPage() {
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [folderId, setFolderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("photographer_token");
    if (!token) router.push("/dashboard/login");
  }, []);

  const createEvent = async () => {
    if (!eventName.trim()) { setError("Please enter the event name!"); return; }
    if (!folderId.trim()) { setError("Please enter the Google Drive Folder ID!"); return; }
    const token = localStorage.getItem("photographer_token");
    if (!token) { router.push("/dashboard/login"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND}/photographer/create-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photographer_token: token, event_name: eventName.trim(), folder_id: folderId.trim() }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setSuccess(data);
      } else {
        setError(data.detail || "Something went wrong!");
      }
    } catch {
      setError("Could not connect to server!");
    }
    setLoading(false);
  };

  const frontendUrl = typeof window !== "undefined" ? window.location.origin : "";
  const guestUrl = success ? `${frontendUrl}/event/${success.event_token}` : "";

  const copyUrl = () => {
    navigator.clipboard.writeText(guestUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060B18; font-family: 'Inter', sans-serif; min-height: 100vh; }
        .page { min-height: 100vh; background: radial-gradient(ellipse at 50% -5%, #1a0e2e 0%, #060B18 55%); color: #F5EFE6; padding: 0 20px 72px; }
        .navbar { display: flex; align-items: center; justify-content: space-between; padding: 24px 0; border-bottom: 1px solid rgba(201,149,108,0.12); margin-bottom: 40px; max-width: 600px; margin-left: auto; margin-right: auto; }
        .nav-logo { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 300; color: #F5EFE6; cursor: pointer; }
        .nav-logo span { color: #C9956C; font-weight: 600; }
        .btn-back { background: transparent; border: 1px solid rgba(245,239,230,0.1); color: rgba(245,239,230,0.35); font-family: 'Inter', sans-serif; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; padding: 8px 16px; border-radius: 2px; cursor: pointer; transition: all 0.2s; }
        .btn-back:hover { border-color: rgba(201,149,108,0.3); color: #C9956C; }
        .container { max-width: 600px; margin: 0 auto; }
        .page-title { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 300; color: #F5EFE6; margin-bottom: 32px; }
        .page-title span { color: #C9956C; }
        .card { background: #0F1A2E; border: 1px solid rgba(201,149,108,0.12); border-radius: 8px; padding: 32px; margin-bottom: 24px; }
        .card-title { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: rgba(201,149,108,0.5); margin-bottom: 24px; }
        .form { display: flex; flex-direction: column; gap: 20px; }
        .field { display: flex; flex-direction: column; gap: 8px; }
        .label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(245,239,230,0.4); }
        .input { background: rgba(6,11,24,0.8); border: 1px solid rgba(201,149,108,0.2); border-radius: 4px; padding: 14px 16px; color: #F5EFE6; font-family: 'Inter', sans-serif; font-size: 13px; outline: none; transition: border-color 0.2s; }
        .input:focus { border-color: rgba(201,149,108,0.5); }
        .input::placeholder { color: rgba(245,239,230,0.2); }
        .hint { font-size: 10px; color: rgba(245,239,230,0.25); line-height: 1.7; }
        .hint code { background: rgba(201,149,108,0.1); color: #C9956C; padding: 2px 6px; border-radius: 3px; font-size: 10px; }
        .error { font-size: 11px; color: #f08080; letter-spacing: 0.5px; }
        .btn-create { width: 100%; background: linear-gradient(135deg, #C9956C 0%, #a87548 100%); color: #060B18; border: none; border-radius: 2px; padding: 16px; font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; cursor: pointer; transition: opacity 0.2s; margin-top: 8px; }
        .btn-create:hover { opacity: 0.9; }
        .btn-create:disabled { opacity: 0.4; cursor: not-allowed; }
        .success-card { background: rgba(100,200,100,0.05); border: 1px solid rgba(100,200,100,0.2); border-radius: 8px; padding: 32px; }
        .success-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 400; color: #80d080; margin-bottom: 8px; }
        .success-sub { font-size: 11px; color: rgba(245,239,230,0.4); letter-spacing: 0.5px; margin-bottom: 28px; }
        .info-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
        .info-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: rgba(201,149,108,0.4); }
        .info-value { font-size: 12px; color: rgba(245,239,230,0.7); word-break: break-all; font-family: monospace; }
        .url-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .url-val { font-size: 12px; color: #C9956C; word-break: break-all; }
        .btn-copy { background: transparent; border: 1px solid rgba(201,149,108,0.2); color: rgba(201,149,108,0.7); font-family: 'Inter', sans-serif; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; padding: 8px 16px; border-radius: 2px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .btn-copy:hover { border-color: #C9956C; color: #C9956C; }
        .copied { color: #80d080 !important; border-color: rgba(100,200,100,0.3) !important; }
        .warning-box { background: rgba(201,149,108,0.05); border: 1px solid rgba(201,149,108,0.2); border-radius: 6px; padding: 16px; margin-top: 20px; }
        .warning-title { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #C9956C; margin-bottom: 8px; }
        .warning-text { font-size: 11px; color: rgba(245,239,230,0.5); line-height: 1.7; }
        .warning-text code { background: rgba(201,149,108,0.1); color: #C9956C; padding: 2px 6px; border-radius: 3px; font-size: 10px; }
        .btn-dashboard { display: block; text-align: center; background: transparent; border: 1px solid rgba(201,149,108,0.3); color: #C9956C; font-family: 'Inter', sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; padding: 14px; border-radius: 2px; cursor: pointer; margin-top: 24px; transition: all 0.2s; width: 100%; }
        .btn-dashboard:hover { background: rgba(201,149,108,0.05); }
      `}</style>

      <div className="page">
        <nav className="navbar">
          <div className="nav-logo" onClick={() => router.push("/dashboard")}>TS Wedding <span>Capture</span></div>
          <button className="btn-back" onClick={() => router.push("/dashboard")}>← Back</button>
        </nav>

        <div className="container">
          <h1 className="page-title">Create New <span>Event</span></h1>

          {!success ? (
            <div className="card">
              <p className="card-title">Event Details</p>
              <div className="form">
                <div className="field">
                  <label className="label">Event Name</label>
                  <input className="input" type="text" placeholder="e.g. Sharma Wedding, Smith & Jones..." value={eventName} onChange={(e) => setEventName(e.target.value)} />
                </div>
                <div className="field">
                  <label className="label">Google Drive Folder ID</label>
                  <input className="input" type="text" placeholder="1ABCxyz..." value={folderId} onChange={(e) => setFolderId(e.target.value)} />
                  <p className="hint">
                    Copy the Folder ID from your Google Drive folder URL:<br />
                    drive.google.com/drive/folders/<code>THIS_IS_THE_FOLDER_ID</code><br /><br />
                    ⚠️ Make sure to share the folder with <code>{SERVICE_EMAIL}</code> as Viewer first!
                  </p>
                </div>
                {error && <p className="error">⚠️ {error}</p>}
                <button className="btn-create" onClick={createEvent} disabled={loading}>
                  {loading ? "Creating..." : "Create Event & Generate QR"}
                </button>
              </div>
            </div>
          ) : (
            <div className="success-card">
              <p className="success-title">✓ Event Created!</p>
              <p className="success-sub">Use this link in your QR code for guests</p>
              <div className="info-row">
                <span className="info-label">Event Token</span>
                <span className="info-value">{success.event_token}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Guest QR URL</span>
                <div className="url-row">
                  <span className="url-val">{guestUrl}</span>
                  <button className={`btn-copy ${copied ? "copied" : ""}`} onClick={copyUrl}>
                    {copied ? "Copied! ✓" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="warning-box">
                <p className="warning-title">⚠️ Important</p>
                <p className="warning-text">
                  If you haven't done so already, please share your Google Drive folder with the following email as <strong>Viewer</strong>:<br /><br />
                  <code>{SERVICE_EMAIL}</code><br /><br />
                  Without this, photos will not be indexed!
                </p>
              </div>
              <button className="btn-dashboard" onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}