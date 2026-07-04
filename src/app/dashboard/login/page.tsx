"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const BACKEND = "https://bhvi2383-live-wedding-ai.hf.space";

export default function LoginPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!token.trim()) { setError("Please enter your token!"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND}/photographer/events?photographer_token=${token.trim()}`);
      const data = await res.json();
      if (data.status === "success") {
        localStorage.setItem("photographer_token", token.trim());
        localStorage.setItem("photographer_name", data.name);
        router.push("/dashboard");
      } else {
        setError("Invalid token! Please check and try again.");
      }
    } catch {
      setError("Could not connect to server. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060B18; font-family: 'Inter', sans-serif; min-height: 100vh; }
        .page { min-height: 100vh; background: radial-gradient(ellipse at 50% -5%, #1a0e2e 0%, #060B18 55%); color: #F5EFE6; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card { width: 100%; max-width: 400px; background: #0F1A2E; border: 1px solid rgba(201,149,108,0.15); border-radius: 8px; padding: 48px 36px; display: flex; flex-direction: column; align-items: center; gap: 24px; }
        .logo { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 300; color: #F5EFE6; text-align: center; }
        .logo span { color: #C9956C; font-weight: 600; }
        .eyebrow { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: rgba(201,149,108,0.6); }
        .divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(201,149,108,0.2), transparent); }
        .form { width: 100%; display: flex; flex-direction: column; gap: 16px; }
        .label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(245,239,230,0.4); margin-bottom: 6px; display: block; }
        .input { width: 100%; background: rgba(6,11,24,0.8); border: 1px solid rgba(201,149,108,0.2); border-radius: 4px; padding: 14px 16px; color: #F5EFE6; font-family: 'Inter', sans-serif; font-size: 13px; outline: none; transition: border-color 0.2s; }
        .input:focus { border-color: rgba(201,149,108,0.5); }
        .input::placeholder { color: rgba(245,239,230,0.2); }
        .btn { width: 100%; background: linear-gradient(135deg, #C9956C 0%, #a87548 100%); color: #060B18; border: none; border-radius: 2px; padding: 15px; font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; cursor: pointer; transition: opacity 0.2s; }
        .btn:hover { opacity: 0.9; }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .error { font-size: 11px; color: #f08080; text-align: center; letter-spacing: 0.5px; }
        .note { font-size: 10px; color: rgba(245,239,230,0.25); text-align: center; letter-spacing: 0.5px; line-height: 1.6; }
      `}</style>
      <div className="page">
        <div className="card">
          <p className="eyebrow">✦ Photographer Portal ✦</p>
          <h1 className="logo">TS Wedding<br /><span>Capture</span></h1>
          <div className="divider" />
          <div className="form">
            <div>
              <label className="label">Enter Your Token</label>
              <input className="input" type="text" placeholder="Photographer token..." value={token}
                onChange={(e) => setToken(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
            </div>
            {error && <p className="error">{error}</p>}
            <button className="btn" onClick={handleLogin} disabled={loading}>
              {loading ? "Verifying..." : "Login"}
            </button>
          </div>
          <p className="note">Your token was provided by the admin at registration.</p>
        </div>
      </div>
    </>
  );
}