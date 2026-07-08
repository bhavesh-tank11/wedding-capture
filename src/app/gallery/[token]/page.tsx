"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

const BACKEND = "https://bhvi2383-live-wedding-ai.hf.space";

export default function DashboardPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [togglingGallery, setTogglingGallery] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ token: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("photographer_token");
    if (!token) { router.push("/dashboard/login"); return; }
    loadEvents(token);
  }, []);

  const loadEvents = async (token?: string) => {
    const t = token || localStorage.getItem("photographer_token");
    if (!t) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/photographer/events?photographer_token=${t}`);
      const data = await res.json();
      if (data.status === "success") {
        setName(data.name);
        setEvents(data.events);
      } else {
        router.push("/dashboard/login");
      }
    } catch { }
    setLoading(false);
  };

  const toggleEvent = async (event_token: string, active: boolean) => {
    const photographer_token = localStorage.getItem("photographer_token");
    setToggling(event_token);
    try {
      await fetch(`${BACKEND}/photographer/toggle-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photographer_token, event_token, active }),
      });
      await loadEvents();
    } catch { }
    setToggling(null);
  };

  const toggleGalleryMode = async (event_token: string, gallery_enabled: boolean) => {
    const photographer_token = localStorage.getItem("photographer_token");
    setTogglingGallery(event_token);
    try {
      await fetch(`${BACKEND}/photographer/toggle-gallery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photographer_token, event_token, gallery_enabled }),
      });
      await loadEvents();
    } catch { }
    setTogglingGallery(null);
  };

  const confirmDelete = (event_token: string, event_name: string) => {
    setDeleteConfirm({ token: event_token, name: event_name });
  };

  const cancelDelete = () => setDeleteConfirm(null);

  const deleteEvent = async () => {
    if (!deleteConfirm) return;
    const photographer_token = localStorage.getItem("photographer_token");
    setDeleting(deleteConfirm.token);
    setDeleteConfirm(null);
    try {
      await fetch(`${BACKEND}/photographer/delete-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photographer_token, event_token: deleteConfirm.token }),
      });
      await loadEvents();
    } catch { }
    setDeleting(null);
  };

  const logout = () => {
    localStorage.removeItem("photographer_token");
    localStorage.removeItem("photographer_name");
    router.push("/dashboard/login");
  };

  const filteredEvents = events.filter(e =>
    e.event_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060B18; font-family: 'Inter', sans-serif; min-height: 100vh; }
        .page { min-height: 100vh; background: radial-gradient(ellipse at 50% -5%, #1a0e2e 0%, #060B18 55%); color: #F5EFE6; padding: 0 20px 72px; }
        .navbar { display: flex; align-items: center; justify-content: space-between; padding: 24px 0; border-bottom: 1px solid rgba(201,149,108,0.12); margin-bottom: 40px; max-width: 700px; margin-left: auto; margin-right: auto; }
        .nav-logo { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 300; color: #F5EFE6; }
        .nav-logo span { color: #C9956C; font-weight: 600; }
        .nav-right { display: flex; align-items: center; gap: 16px; }
        .nav-name { font-size: 11px; letter-spacing: 1px; color: rgba(245,239,230,0.4); }
        .btn-logout { background: transparent; border: 1px solid rgba(245,239,230,0.1); color: rgba(245,239,230,0.35); font-family: 'Inter', sans-serif; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; padding: 8px 16px; border-radius: 2px; cursor: pointer; transition: all 0.2s; }
        .btn-logout:hover { border-color: rgba(201,149,108,0.3); color: #C9956C; }
        .container { max-width: 700px; margin: 0 auto; }
        .top-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .page-title { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 300; color: #F5EFE6; }
        .page-title span { color: #C9956C; }
        .btn-new { background: linear-gradient(135deg, #C9956C 0%, #a87548 100%); color: #060B18; border: none; border-radius: 2px; padding: 12px 24px; font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; cursor: pointer; transition: opacity 0.2s; white-space: nowrap; }
        .btn-new:hover { opacity: 0.9; }
        .search-wrap { position: relative; margin-bottom: 28px; }
        .search-input { width: 100%; background: #0F1A2E; border: 1px solid rgba(201,149,108,0.15); border-radius: 4px; padding: 12px 16px 12px 40px; color: #F5EFE6; font-family: 'Inter', sans-serif; font-size: 13px; outline: none; transition: border-color 0.2s; }
        .search-input:focus { border-color: rgba(201,149,108,0.4); }
        .search-input::placeholder { color: rgba(245,239,230,0.2); }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); opacity: 0.3; pointer-events: none; }
        .search-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: rgba(245,239,230,0.3); cursor: pointer; font-size: 16px; padding: 2px 6px; transition: color 0.2s; }
        .search-clear:hover { color: #C9956C; }
        .search-count { font-size: 10px; letter-spacing: 1px; color: rgba(245,239,230,0.25); margin-top: 8px; }
        .spinner { width: 32px; height: 32px; border: 2px solid rgba(201,149,108,0.2); border-top-color: #C9956C; border-radius: 50%; animation: spin 1s linear infinite; margin: 60px auto; display: block; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .events-list { display: flex; flex-direction: column; gap: 16px; }
        .event-card { background: #0F1A2E; border: 1px solid rgba(201,149,108,0.1); border-radius: 8px; padding: 24px; transition: border-color 0.2s; }
        .event-card:hover { border-color: rgba(201,149,108,0.25); }
        .event-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
        .event-name { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 400; color: #F5EFE6; }
        .badge { font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; }
        .badge-active { background: rgba(100,200,100,0.1); color: #80d080; border: 1px solid rgba(100,200,100,0.2); }
        .badge-inactive { background: rgba(200,100,100,0.1); color: #d08080; border: 1px solid rgba(200,100,100,0.2); }
        .event-meta { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 20px; }
        .meta-item { display: flex; flex-direction: column; gap: 3px; }
        .meta-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: rgba(201,149,108,0.4); }
        .meta-value { font-size: 12px; color: rgba(245,239,230,0.6); font-family: monospace; word-break: break-all; }
        .qr-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .qr-link { font-size: 11px; color: #C9956C; word-break: break-all; text-decoration: none; }
        .qr-link:hover { text-decoration: underline; }
        .btn-copy { background: transparent; border: 1px solid rgba(201,149,108,0.2); color: rgba(201,149,108,0.7); font-family: 'Inter', sans-serif; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; padding: 6px 12px; border-radius: 2px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .btn-copy:hover { border-color: #C9956C; color: #C9956C; }
        .qr-display-section { display: flex; align-items: center; gap: 20px; margin-top: 16px; flex-wrap: wrap; background: rgba(255,255,255,0.02); padding: 16px; border-radius: 8px; border: 1px solid rgba(201,149,108,0.05); }
        .qr-canvas-wrapper { padding: 8px; background: #fff; border-radius: 4px; display: inline-flex; }
        .btn-download-qr { background: #C9956C; color: #060B18; border: none; font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; padding: 10px 20px; border-radius: 2px; cursor: pointer; transition: all 0.2s; }
        .btn-download-qr:hover { opacity: 0.9; transform: translateY(-1px); }

        /* Gallery Toggle */
        .gallery-section { margin-top: 16px; padding: 16px; background: rgba(201,149,108,0.04); border: 1px solid rgba(201,149,108,0.1); border-radius: 6px; }
        .gallery-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .gallery-info { display: flex; flex-direction: column; gap: 4px; }
        .gallery-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(201,149,108,0.6); }
        .gallery-desc { font-size: 11px; color: rgba(245,239,230,0.35); line-height: 1.5; }
        .gallery-url-row { display: flex; align-items: center; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
        .gallery-url { font-size: 10px; color: rgba(201,149,108,0.7); word-break: break-all; }

        /* Toggle Switch */
        .toggle-wrap { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .toggle-label { font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: rgba(245,239,230,0.3); }
        .toggle { position: relative; width: 44px; height: 24px; cursor: pointer; }
        .toggle input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; inset: 0; background: rgba(245,239,230,0.1); border-radius: 24px; transition: 0.3s; border: 1px solid rgba(245,239,230,0.1); }
        .toggle-slider::before { content: ''; position: absolute; width: 18px; height: 18px; left: 2px; top: 2px; background: rgba(245,239,230,0.4); border-radius: 50%; transition: 0.3s; }
        .toggle input:checked + .toggle-slider { background: rgba(201,149,108,0.25); border-color: rgba(201,149,108,0.4); }
        .toggle input:checked + .toggle-slider::before { transform: translateX(20px); background: #C9956C; }

        .event-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 16px; border-top: 1px solid rgba(201,149,108,0.08); margin-top: 20px; }
        .btn-toggle { font-family: 'Inter', sans-serif; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; padding: 8px 20px; border-radius: 2px; cursor: pointer; transition: all 0.2s; border: 1px solid; }
        .btn-deactivate { background: transparent; color: rgba(200,100,100,0.7); border-color: rgba(200,100,100,0.2); }
        .btn-deactivate:hover { background: rgba(200,100,100,0.1); }
        .btn-activate { background: transparent; color: rgba(100,200,100,0.7); border-color: rgba(100,200,100,0.2); }
        .btn-activate:hover { background: rgba(100,200,100,0.1); }
        .btn-delete { font-family: 'Inter', sans-serif; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; padding: 8px 20px; border-radius: 2px; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(200,80,80,0.2); background: transparent; color: rgba(200,80,80,0.6); }
        .btn-delete:hover { background: rgba(200,80,80,0.1); border-color: rgba(200,80,80,0.4); color: #f08080; }
        .btn-delete:disabled { opacity: 0.3; cursor: not-allowed; }
        .empty { text-align: center; padding: 60px 0; }
        .empty-icon { font-size: 36px; opacity: 0.2; margin-bottom: 16px; }
        .empty-text { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 300; color: rgba(245,239,230,0.3); }
        .empty-sub { font-size: 11px; color: rgba(245,239,230,0.2); margin-top: 8px; letter-spacing: 0.5px; }
        .copied { color: #80d080 !important; border-color: rgba(100,200,100,0.3) !important; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; backdrop-filter: blur(4px); }
        .modal { background: #0F1A2E; border: 1px solid rgba(200,80,80,0.25); border-radius: 10px; padding: 36px; max-width: 400px; width: 100%; }
        .modal-icon { font-size: 32px; text-align: center; margin-bottom: 16px; }
        .modal-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; color: #F5EFE6; text-align: center; margin-bottom: 10px; }
        .modal-desc { font-size: 12px; color: rgba(245,239,230,0.4); text-align: center; line-height: 1.7; margin-bottom: 8px; }
        .modal-event-name { font-size: 16px; color: #C9956C; text-align: center; font-family: 'Cormorant Garamond', serif; margin-bottom: 24px; }
        .modal-warning { font-size: 10px; color: rgba(200,80,80,0.6); text-align: center; margin-bottom: 28px; letter-spacing: 0.5px; line-height: 1.6; }
        .modal-btns { display: flex; gap: 12px; }
        .modal-btn-cancel { flex: 1; background: transparent; border: 1px solid rgba(245,239,230,0.1); color: rgba(245,239,230,0.4); font-family: 'Inter', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; padding: 14px; border-radius: 2px; cursor: pointer; transition: all 0.2s; }
        .modal-btn-cancel:hover { border-color: rgba(201,149,108,0.3); color: #C9956C; }
        .modal-btn-delete { flex: 1; background: rgba(200,60,60,0.15); border: 1px solid rgba(200,60,60,0.35); color: #f08080; font-family: 'Inter', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; padding: 14px; border-radius: 2px; cursor: pointer; transition: all 0.2s; }
        .modal-btn-delete:hover { background: rgba(200,60,60,0.25); }
      `}</style>

      {deleteConfirm && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🗑️</div>
            <p className="modal-title">Delete Event?</p>
            <p className="modal-desc">You are about to permanently delete:</p>
            <p className="modal-event-name">"{deleteConfirm.name}"</p>
            <p className="modal-warning">⚠️ This event will still count toward your quota even after deletion. This action cannot be undone.</p>
            <div className="modal-btns">
              <button className="modal-btn-cancel" onClick={cancelDelete}>Cancel</button>
              <button className="modal-btn-delete" onClick={deleteEvent}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="page">
        <nav className="navbar">
          <div className="nav-logo">TS Wedding <span>Capture</span></div>
          <div className="nav-right">
            <span className="nav-name">{name}</span>
            <button className="btn-logout" onClick={logout}>Logout</button>
          </div>
        </nav>

        <div className="container">
          <div className="top-bar">
            <h1 className="page-title">My <span>Events</span></h1>
            <button className="btn-new" onClick={() => router.push("/dashboard/new-event")}>+ New Event</button>
          </div>

          {!loading && events.length > 0 && (
            <div className="search-wrap">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9956C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input className="search-input" type="text" placeholder="Search events by name..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              {searchQuery && <button className="search-clear" onClick={() => setSearchQuery("")}>✕</button>}
              {searchQuery && <p className="search-count">{filteredEvents.length} of {events.length} events</p>}
            </div>
          )}

          {loading ? (
            <div className="spinner" />
          ) : events.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">✦</div>
              <p className="empty-text">No events yet</p>
              <p className="empty-sub">Create your first event using the button above!</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🔍</div>
              <p className="empty-text">No events found</p>
              <p className="empty-sub">Try a different search term</p>
            </div>
          ) : (
            <div className="events-list">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.event_token}
                  event={event}
                  toggling={toggling === event.event_token}
                  togglingGallery={togglingGallery === event.event_token}
                  deleting={deleting === event.event_token}
                  onToggle={toggleEvent}
                  onToggleGallery={toggleGalleryMode}
                  onDelete={confirmDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function EventCard({ event, toggling, togglingGallery, deleting, onToggle, onToggleGallery, onDelete }: any) {
  const [copied, setCopied] = useState(false);
  const [copiedGallery, setCopiedGallery] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const frontendUrl  = typeof window !== "undefined" ? window.location.origin : "";
  const guestUrl     = `${frontendUrl}/event/${event.event_token}`;
  const galleryUrl   = `${frontendUrl}/gallery/${event.event_token}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(guestUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyGalleryUrl = () => {
    navigator.clipboard.writeText(galleryUrl);
    setCopiedGallery(true);
    setTimeout(() => setCopiedGallery(false), 2000);
  };

  const downloadQR = () => {
    if (!qrRef.current) return;
    const canvas   = qrRef.current.querySelector("canvas");
    if (!canvas) return;
    const url      = canvas.toDataURL("image/png");
    const link     = document.createElement("a");
    link.href      = url;
    link.download  = `${event.event_name.replace(/\s+/g, "_")}_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="event-card">
      <div className="event-top">
        <p className="event-name">{event.event_name}</p>
        <span className={`badge ${event.active ? "badge-active" : "badge-inactive"}`}>
          {event.active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="event-meta">
        <div className="meta-item">
          <span className="meta-label">Photos Indexed</span>
          <span className="meta-value">{event.indexed_photos}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Drive Folder ID</span>
          <span className="meta-value">{event.folder_id}</span>
        </div>
      </div>

      {/* Face Scan QR URL */}
      <div className="meta-item" style={{ marginBottom: "16px" }}>
        <span className="meta-label" style={{ marginBottom: "6px" }}>Guest Face Scan URL</span>
        <div className="qr-row">
          <a href={guestUrl} target="_blank" className="qr-link">{guestUrl}</a>
          <button className={`btn-copy ${copied ? "copied" : ""}`} onClick={copyUrl}>
            {copied ? "Copied! ✓" : "Copy"}
          </button>
        </div>
      </div>

      {/* QR Code */}
      <div className="qr-display-section" ref={qrRef}>
        <div className="qr-canvas-wrapper">
          <QRCodeCanvas value={guestUrl} size={100} bgColor="#ffffff" fgColor="#000000" level="H" includeMargin={false} />
        </div>
        <button className="btn-download-qr" onClick={downloadQR}>Download QR</button>
      </div>

      {/* Gallery Mode Toggle */}
      <div className="gallery-section">
        <div className="gallery-row">
          <div className="gallery-info">
            <span className="gallery-label">📸 Show All Event Photos</span>
            <span className="gallery-desc">
              {event.gallery_enabled
                ? "ON — Anyone with the gallery link can see all photos"
                : "OFF — Guests only see their own matched photos"}
            </span>
          </div>
          <div className="toggle-wrap">
            <span className="toggle-label">{togglingGallery ? "..." : event.gallery_enabled ? "On" : "Off"}</span>
            <label className="toggle">
              <input
                type="checkbox"
                checked={!!event.gallery_enabled}
                disabled={togglingGallery}
                onChange={(e) => onToggleGallery(event.event_token, e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {/* Gallery URL — only show when enabled */}
        {event.gallery_enabled && (
          <div className="gallery-url-row">
            <span className="meta-label">Gallery URL:</span>
            <a href={galleryUrl} target="_blank" className="gallery-url">{galleryUrl}</a>
            <button className={`btn-copy ${copiedGallery ? "copied" : ""}`} onClick={copyGalleryUrl}>
              {copiedGallery ? "Copied! ✓" : "Copy"}
            </button>
          </div>
        )}
      </div>

      <div className="event-footer">
        <button className="btn-delete" onClick={() => onDelete(event.event_token, event.event_name)} disabled={deleting}>
          {deleting ? "Deleting..." : "Delete"}
        </button>
        <button className={`btn-toggle ${event.active ? "btn-deactivate" : "btn-activate"}`}
          onClick={() => onToggle(event.event_token, !event.active)} disabled={toggling}>
          {toggling ? "..." : event.active ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );
}