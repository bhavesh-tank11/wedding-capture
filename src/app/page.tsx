"use client";
import { useState, useRef, useEffect } from "react";

type AppStatus = "idle" | "camera" | "captured" | "scanning" | "done" | "error";

export default function Home() {
  const [status, setStatus] = useState<AppStatus>("idle");
  const [image, setImage] = useState<string | null>(null);
  const [matchedFiles, setMatchedFiles] = useState<any[]>([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [streamActive, setStreamActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreamActive(true);
      setStatus("camera");
      setImage(null);
      setMatchedFiles([]);
      setStatusMsg("");
    } catch (err) {
      setStatus("error");
      setStatusMsg("Camera access denied. Please allow camera permission.");
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStreamActive(false);
  };

  // Capture photo from video
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setImage(dataUrl);
    stopCamera();
    setStatus("captured");
    setStatusMsg("");
  };

  // Retake — reopen camera
  const retake = () => {
    setImage(null);
    setMatchedFiles([]);
    setStatusMsg("");
    openCamera();
  };

  // Reset fully
  const reset = () => {
    stopCamera();
    setImage(null);
    setMatchedFiles([]);
    setStatusMsg("");
    setStatus("idle");
  };

  // Scan face via backend
  const startScan = async () => {
    if (!image) return;
    setStatus("scanning");
    setStatusMsg("");

    try {
      const res = await fetch(image);
      const blob = await res.blob();
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("https://bhvi2383-live-wedding-ai.hf.space/scan", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`Server error ${response.status}`);
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        setMatchedFiles(data.data);
        setStatusMsg(`${data.data.length} photo${data.data.length > 1 ? "s" : ""} found for you`);
        setStatus("done");
      } else {
        setMatchedFiles([]);
        setStatusMsg(data.message || "No matches found");
        setStatus("done");
      }
    } catch (err) {
      setStatus("error");
      setStatusMsg("Could not connect to server. Please try again.");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // ── Derived UI helpers ──
  const showVideo = status === "camera";
  const showImage = (status === "captured" || status === "scanning" || status === "done" || status === "error") && image;

  const ringClass =
    status === "scanning"
      ? "scanning"
      : status === "captured" || status === "camera"
      ? "ready"
      : "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Inter:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #060B18;
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          -webkit-tap-highlight-color: transparent;
        }

        .page {
          min-height: 100vh;
          background: radial-gradient(ellipse at 50% -5%, #1a0e2e 0%, #060B18 55%);
          color: #F5EFE6;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 20px 72px;
          position: relative;
          overflow-x: hidden;
        }

        .page::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(circle at 15% 10%, rgba(201,149,108,0.05) 0%, transparent 40%),
            radial-gradient(circle at 85% 85%, rgba(100,60,160,0.05) 0%, transparent 40%);
          pointer-events: none;
          z-index: 0;
        }

        .content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 460px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* ── HEADER ── */
        .header {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 44px 0 32px;
          border-bottom: 1px solid rgba(201,149,108,0.12);
          margin-bottom: 40px;
        }

        .brand-eyebrow {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #C9956C;
          margin-bottom: 10px;
        }

        .brand-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          font-weight: 300;
          letter-spacing: 2px;
          color: #F5EFE6;
          text-align: center;
          line-height: 1.2;
        }

        .brand-title span { color: #C9956C; font-weight: 600; }

        .brand-tagline {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(245,239,230,0.3);
          margin-top: 8px;
        }

        /* ── SCANNER RING ── */
        .scanner-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 32px;
        }

        .ring-system {
          position: relative;
          width: 220px;
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ring {
          position: absolute;
          border-radius: 50%;
        }

        .ring-outer {
          inset: 0;
          border: 1px solid rgba(201,149,108,0.2);
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .ready .ring-outer {
          border-color: rgba(201,149,108,0.5);
          animation: pulse-ring 2.5s ease-in-out infinite;
        }

        .ring-mid {
          inset: 10px;
          border: 1px dashed rgba(201,149,108,0.08);
        }

        .ring-spin {
          inset: 5px;
          border: 2px solid transparent;
          border-top-color: #C9956C;
          border-right-color: rgba(201,149,108,0.25);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .scanning .ring-spin {
          opacity: 1;
          animation: spin 1.6s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 rgba(201,149,108,0); }
          50% { box-shadow: 0 0 22px rgba(201,149,108,0.2); }
        }

        /* Corners */
        .corner {
          position: absolute;
          width: 16px;
          height: 16px;
          border-color: #C9956C;
          border-style: solid;
          opacity: 0.5;
        }
        .c-tl { top: 14px; left: 14px; border-width: 1.5px 0 0 1.5px; }
        .c-tr { top: 14px; right: 14px; border-width: 1.5px 1.5px 0 0; }
        .c-bl { bottom: 14px; left: 14px; border-width: 0 0 1.5px 1.5px; }
        .c-br { bottom: 14px; right: 14px; border-width: 0 1.5px 1.5px 0; }

        /* Face circle — bigger to fit camera */
        .face-circle {
          width: 186px;
          height: 186px;
          border-radius: 50%;
          overflow: hidden;
          background: #0F1A2E;
          border: 2px solid rgba(201,149,108,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .face-circle video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1); /* mirror selfie */
        }

        .face-circle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .face-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .face-placeholder svg { opacity: 0.22; }

        .face-placeholder p {
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(245,239,230,0.25);
        }

        /* Scan sweep line */
        .scan-line {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(201,149,108,0.85), transparent);
          top: 0;
          opacity: 0;
          pointer-events: none;
        }

        .scanning .scan-line {
          opacity: 1;
          animation: sweep 1.4s ease-in-out infinite;
        }

        @keyframes sweep { 0% { top: 0%; } 100% { top: 100%; } }

        /* Camera shutter flash */
        .flash {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: white;
          opacity: 0;
          pointer-events: none;
        }

        .flash.active {
          animation: flash-anim 0.35s ease-out forwards;
        }

        @keyframes flash-anim {
          0% { opacity: 0.7; }
          100% { opacity: 0; }
        }

        /* ── STATUS ── */
        .status-area {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-height: 44px;
        }

        .status-label {
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 1px;
          color: rgba(245,239,230,0.5);
          text-align: center;
        }

        .status-count {
          font-family: 'Cormorant Garamond', serif;
          font-size: 19px;
          font-weight: 400;
          color: #C9956C;
          letter-spacing: 1px;
        }

        .dots span {
          display: inline-block;
          animation: blink 1.4s infinite;
        }
        .dots span:nth-child(2) { animation-delay: 0.2s; }
        .dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
          0%, 80%, 100% { opacity: 0.15; }
          40% { opacity: 1; }
        }

        /* ── BUTTONS ── */
        .btn-row {
          display: flex;
          gap: 12px;
          margin-bottom: 40px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn {
          border: none;
          border-radius: 2px;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          cursor: pointer;
          padding: 14px 32px;
          transition: all 0.22s;
          position: relative;
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
        }

        .btn-primary {
          background: linear-gradient(135deg, #C9956C 0%, #a87548 100%);
          color: #060B18;
        }

        .btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.12);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .btn-primary:hover::after { opacity: 1; }
        .btn-primary:active { transform: scale(0.97); }

        .btn-primary:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .btn-ghost {
          background: transparent;
          color: rgba(245,239,230,0.38);
          border: 1px solid rgba(245,239,230,0.1);
        }

        .btn-ghost:hover {
          border-color: rgba(201,149,108,0.3);
          color: #C9956C;
        }

        /* Capture button — big circle for camera mode */
        .btn-capture {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #C9956C;
          border: 3px solid rgba(201,149,108,0.3);
          cursor: pointer;
          box-shadow: 0 0 0 6px rgba(201,149,108,0.1);
          transition: all 0.2s;
          position: relative;
        }

        .btn-capture::after {
          content: '';
          position: absolute;
          inset: 6px;
          border-radius: 50%;
          background: #F5EFE6;
          opacity: 0.9;
        }

        .btn-capture:active {
          transform: scale(0.92);
          box-shadow: 0 0 0 10px rgba(201,149,108,0.08);
        }

        /* ── DIVIDER ── */
        .divider {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }

        .div-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,149,108,0.18), transparent);
        }

        .div-label {
          font-family: 'Cormorant Garamond', serif;
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 2px;
          color: rgba(201,149,108,0.45);
          white-space: nowrap;
        }

        /* ── RESULTS ── */
        .results-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          width: 100%;
        }

        .photo-card {
          background: #0F1A2E;
          border: 1px solid rgba(201,149,108,0.1);
          border-radius: 6px;
          overflow: hidden;
          transition: all 0.25s;
        }

        .photo-card:hover {
          border-color: rgba(201,149,108,0.35);
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.5);
        }

        .photo-thumb {
          width: 100%;
          aspect-ratio: 4/3;
          object-fit: cover;
          display: block;
          background: #0a1020;
        }

        /* Fix for Google Drive thumbnail CORS — show placeholder if blocked */
        .photo-thumb-fallback {
          width: 100%;
          aspect-ratio: 4/3;
          background: #0a1020;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(201,149,108,0.3);
          font-size: 28px;
        }

        .card-footer {
          padding: 10px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(201,149,108,0.08);
        }

        .photo-num {
          font-size: 9px;
          letter-spacing: 1.5px;
          color: rgba(201,149,108,0.4);
        }

        .dl-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          text-decoration: none;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #C9956C;
          transition: color 0.2s;
          font-family: 'Inter', sans-serif;
        }

        .dl-btn:hover { color: #e8b888; }

        /* Empty state */
        .empty-state {
          text-align: center;
          padding: 36px 0;
          width: 100%;
        }

        .empty-icon {
          font-size: 30px;
          opacity: 0.2;
          margin-bottom: 12px;
        }

        .empty-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 19px;
          font-weight: 300;
          color: rgba(245,239,230,0.3);
          line-height: 1.6;
        }

        /* Footer */
        .footer {
          margin-top: 52px;
          font-size: 9px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(245,239,230,0.12);
          text-align: center;
        }

        /* Responsive */
        @media (max-width: 360px) {
          .brand-title { font-size: 26px; }
          .ring-system { width: 190px; height: 190px; }
          .face-circle { width: 158px; height: 158px; }
          .results-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page">
        <div className="content">

          {/* ── Header ── */}
          <div className="header">
            <p className="brand-eyebrow">✦ &nbsp;Live Wedding AI&nbsp; ✦</p>
            <h1 className="brand-title">TS Wedding<br /><span>Capture</span></h1>
            <p className="brand-tagline">Your moments, beautifully found</p>
          </div>

          {/* ── Scanner ── */}
          <div className="scanner-wrap">
            <div className={`ring-system ${ringClass}`}>
              <div className="ring ring-outer" />
              <div className="ring ring-mid" />
              <div className="ring ring-spin" />
              <div className="corner c-tl" />
              <div className="corner c-tr" />
              <div className="corner c-bl" />
              <div className="corner c-br" />

              <div className="face-circle">
                {/* Live camera video */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ display: showVideo ? "block" : "none" }}
                />

                {/* Captured image */}
                {showImage && (
                  <>
                    <img src={image!} alt="Captured selfie" />
                    <div className="scan-line" />
                  </>
                )}

                {/* Placeholder */}
                {!showVideo && !showImage && (
                  <div className="face-placeholder">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                      stroke="#C9956C" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                    <p>Open Camera</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status text */}
            <div className="status-area">
              <p className="status-label">
                {status === "idle" && "Tap below to open your camera"}
                {status === "camera" && "Position your face in the circle"}
                {status === "captured" && "Looking good! Ready to scan"}
                {status === "scanning" && (
                  <span className="dots">
                    Finding your photos <span>·</span><span>·</span><span>·</span>
                  </span>
                )}
                {status === "done" && statusMsg}
                {status === "error" && statusMsg}
              </p>
              {status === "done" && matchedFiles.length > 0 && (
                <p className="status-count">{matchedFiles.length} photo{matchedFiles.length > 1 ? "s" : ""} matched ✦</p>
              )}
            </div>
          </div>

          {/* ── Buttons ── */}
          <div className="btn-row">
            {status === "idle" && (
              <button className="btn btn-primary" onClick={openCamera}>
                Open Camera
              </button>
            )}

            {status === "camera" && (
              <button className="btn-capture" onClick={capturePhoto} title="Capture" />
            )}

            {status === "captured" && (
              <>
                <button className="btn btn-primary" onClick={startScan}>
                  Scan My Face
                </button>
                <button className="btn btn-ghost" onClick={retake}>
                  Retake
                </button>
              </>
            )}

            {status === "scanning" && (
              <button className="btn btn-primary" disabled>
                Scanning...
              </button>
            )}

            {(status === "done" || status === "error") && (
              <>
                <button className="btn btn-primary" onClick={reset}>
                  Scan Again
                </button>
                {status === "done" && matchedFiles.length === 0 && (
                  <button className="btn btn-ghost" onClick={() => { setImage(null); openCamera(); }}>
                    Retake
                  </button>
                )}
              </>
            )}
          </div>

          {/* ── Results ── */}
          {status === "done" && (
            <>
              <div className="divider">
                <div className="div-line" />
                <span className="div-label">
                  {matchedFiles.length > 0 ? `Your Photos · ${matchedFiles.length}` : "Results"}
                </span>
                <div className="div-line" />
              </div>

              {matchedFiles.length > 0 ? (
                <div className="results-grid">
                  {matchedFiles.map((item, index) => (
                    <div className="photo-card" key={index}>
                      <img
                        src={`https://bhvi2383-live-wedding-ai.hf.space/thumbnail?url=${encodeURIComponent(item.thumbnail)}`}
                        alt={`Photo ${index + 1}`}
                        className="photo-thumb"
                        onError={(e) => {
                          // If thumbnail blocked, show placeholder
                          const target = e.currentTarget;
                          target.style.display = "none";
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                      <div className="photo-thumb-fallback" style={{ display: "none" }}>🖼️</div>
                      <div className="card-footer">
                        <span className="photo-num">#{String(index + 1).padStart(2, "0")}</span>
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="dl-btn">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          Save
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">✦</div>
                  <p className="empty-text">No photos found.<br />Try a clearer selfie.</p>
                </div>
              )}
            </>
          )}

          <div className="footer">
            <p>TS Wedding Capture &nbsp;·&nbsp; Powered by AI &nbsp;·&nbsp; All rights reserved</p>
          </div>
        </div>
      </div>
    </>
  );
}