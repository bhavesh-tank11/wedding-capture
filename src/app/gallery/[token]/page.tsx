"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const BACKEND = "https://bhvi2383-live-wedding-ai.hf.space";

export default function GalleryPage() {
  const params = useParams();
  const token = params.token as string;
  const [status, setStatus] = useState<"loading"|"done"|"error">("loading");
  const [eventName, setEventName] = useState("");
  const [photos, setPhotos] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND}/gallery/${token}`);
        const data = await res.json();
        if (data.status === "success") {
          setEventName(data.event_name);
          setPhotos(data.data || []);
          setStatus("done");
        } else {
          setErrorMsg(data.message || "Could not load gallery.");
          setStatus("error");
        }
      } catch {
        setErrorMsg("Could not connect to server.");
        setStatus("error");
      }
    };
    if (token) load();
  }, [token]);

  const filtered = photos.filter(p =>
    (p?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060B18; font-family: 'Inter', sans-serif; min-height: 100vh; }
        .page { min-height: 100vh; background: radial-gradient(ellipse at 50% -5%, #1a0e2e 0%, #060B18 55%); color: #F5EFE6; display: flex; flex-direction: column; align-items: center; padding: 0 20px 72px; }
        .content { width: 100%; max-width: 700px; }
        .header { display: flex; flex-direction: column; align-items: center; padding: 44px 0 32px; border-bottom: 1px solid rgba(201,149,108,0.12); margin-bottom: 36px; }
        .brand-eyebrow { font-size: 10px; font-weight: 500; letter-spacing: 4px; text-transform: uppercase; color: #C9956C; margin-bottom: 10px; }
        .brand-title { font-family: 'Cormorant Garamond', serif; font-size: 30px; font-weight: 300; letter-spacing: 2px; color: #F5EFE6; text-align: center; }
        .brand-title span { color: #C9956C; font-weight: 600; }
        .brand-sub { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(245,239,230,0.3); margin-top: 8px; }
        .count-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 8px; }
        .count-label { font-size: 11px; color: rgba(245,239,230,0.3); letter-spacing: 1px; }
        .count-label span { color: #C9956C; }
        .search-wrap { position: relative; margin-bottom: 28px; }
        .search-input { width: 100%; background: #0F1A2E; border: 1px solid rgba(201,149,108,0.15); border-radius: 4px; padding: 12px 16px 12px 40px; color: #F5EFE6; font-family: 'Inter', sans-serif; font-size: 13px; outline: none; transition: border-color 0.2s; }
        .search-input:focus { border-color: rgba(201,149,108,0.4); }
        .search-input::placeholder { color: rgba(245,239,230,0.2); }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); opacity: 0.3; pointer-events: none; }
        .search-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: rgba(245,239,230,0.3); cursor: pointer; font-size: 16px; padding: 2px 6px; }
        .search-clear:hover { color: #C9956C; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; width: 100%; }
        .photo-card { background: #0F1A2E; border: 1px solid rgba(201,149,108,0.1); border-radius: 6px; overflow: hidden; transition: all 0.25s; }
        .photo-card:hover { border-color: rgba(201,149,108,0.35); transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.5); }
        .photo-thumb { width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; background: #0a1020; }
        .photo-thumb-fallback { width: 100%; aspect-ratio: 4/3; background: #0a1020; display: flex; align-items: center; justify-content: center; color: rgba(201,149,108,0.3); font-size: 28px; }
        .card-footer { padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(201,149,108,0.08); }
        .photo-num { font-size: 9px; letter-spacing: 1.5px; color: rgba(201,149,108,0.4); }
        .dl-btn { display: inline-flex; align-items: center; gap: 5px; text-decoration: none; font-size: 9px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #C9956C; transition: color 0.2s; font-family: 'Inter', sans-serif; }
        .dl-btn:hover { color: #e8b888; }
        .center-msg { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; text-align: center; width: 100%; }
        .center-msg h2 { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 300; color: rgba(245,239,230,0.5); }
        .center-msg p { font-size: 12px; color: rgba(245,239,230,0.3); letter-spacing: 1px; }
        .spinner { width: 40px; height: 40px; border: 2px solid rgba(201,149,108,0.2); border-top-color: #C9956C; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .footer { margin-top: 52px; font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(245,239,230,0.12); text-align: center; }
        .empty { text-align: center; padding: 40px 0; }
        .empty-icon { font-size: 30px; opacity: 0.2; margin-bottom: 12px; }
        .empty-text { font-family: 'Cormorant Garamond', serif; font-size: 19px; font-weight: 300; color: rgba(245,239,230,0.3); }
        @media (max-width: 480px) { .grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <div className="page">
        <div className="content">

          {status === "loading" && (
            <div className="center-msg">
              <div className="spinner" />
              <p>Loading gallery...</p>
            </div>
          )}

          {status === "error" && (
            <div className="center-msg">
              <div style={{ fontSize: "32px", opacity: 0.2 }}>✦</div>
              <h2>Gallery Unavailable</h2>
              <p>{errorMsg}</p>
            </div>
          )}

          {status === "done" && (
            <>
              <div className="header">
                <p className="brand-eyebrow">✦ &nbsp;Bhavesh.ai&nbsp; ✦</p>
                <h1 className="brand-title"><span>{eventName}</span></h1>
                <p className="brand-sub">Complete Event Gallery</p>
              </div>

              <div className="search-wrap">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9956C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input className="search-input" type="text" placeholder="Search photos by filename..."
                  value={search} onChange={(e) => setSearch(e.target.value)} />
                {search && <button className="search-clear" onClick={() => setSearch("")}>✕</button>}
              </div>

              <div className="count-bar">
                <p className="count-label">
                  <span>{filtered.length}</span> of <span>{photos.length}</span> photos
                </p>
              </div>

              {filtered.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">🔍</div>
                  <p className="empty-text">No photos found</p>
                </div>
              ) : (
                <div className="grid">
                  {filtered.map((item, index) => (
                    <div className="photo-card" key={index}>
                      <img 
                           src={`${BACKEND}/thumbnail?file_id=${item.file_id || ""}&url=${encodeURIComponent(item.thumbnail || "")}`} 
                           alt={item.name}
                           className="gallery-thumb"
                           loading="lazy"
                          /> {
                          e.currentTarget.style.display = "none";
                          const f = e.currentTarget.nextElementSibling as HTMLElement;
                          if (f) f.style.display = "flex";
                        }}
                      />
                      <div className="photo-thumb-fallback" style={{ display: "none" }}>🖼️</div>
                      <div className="card-footer">
                        <span className="photo-num">#{String(index + 1).padStart(2, "0")}</span>
                        <a 
                          href={`/api/download?url=${encodeURIComponent(item.link)}`} 
                          download="wedding-photo.jpg" 
                          className="dl-btn"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          Save
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="footer">
                <p>Powered by Bhavesh.ai &nbsp;·&nbsp; AI Wedding Technology</p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}