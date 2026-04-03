import React, { useState, useEffect } from 'react';
import './SiteInspector.css';

const SiteInspector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [checks, setChecks] = useState({
    api: { status: 'loading', label: 'API Backend Connectivity', msg: 'Checking v1/health...' },
    db: { status: 'loading', label: 'Database Status', msg: 'Checking Prisma connection...' },
    seo_h1: { status: 'loading', label: 'H1 Tag Check', msg: 'Scanning for H1 tags...' },
    seo_meta: { status: 'loading', label: 'Meta Description', msg: 'Scanning meta tags...' },
    seo_og: { status: 'loading', label: 'Open Graph Data', msg: 'Scanning OG tags...' },
    seo_alt: { status: 'loading', label: 'Image Alt Text', msg: 'Scanning images...' },
  });

  const runChecks = async () => {
    // Reset all status to loading
    const newChecks = { ...checks };
    Object.keys(newChecks).forEach(key => newChecks[key].status = 'loading');
    setChecks({ ...newChecks });

    // 1. API & DB Checks
    try {
      const response = await fetch('/v1/health');
      const data = await response.json();

      if (response.ok && data.success) {
        setChecks(prev => ({
          ...prev,
          api: { status: 'success', label: 'API Backend Connectivity', msg: 'Backend is active and responding.' },
          db: { status: 'success', label: 'Database Status', msg: 'Prisma is connected to the database.' }
        }));
      } else {
        setChecks(prev => ({
          ...prev,
          api: { status: 'success', label: 'API Backend Connectivity', msg: 'Backend is active (but DB is down).' },
          db: { 
            status: 'error', 
            label: 'Database Status', 
            msg: data.message || 'Database connection failed. Check Vercel logs.' 
          }
        }));
      }
    } catch (error) {
      setChecks(prev => ({
        ...prev,
        api: { status: 'error', label: 'API Backend Connectivity', msg: 'Cannot reach the backend server.' },
        db: { status: 'error', label: 'Database Status', msg: 'Backend unreachable, cannot verify DB.' }
      }));
    }

    // 2. SEO Checks (Client Side)
    // H1 check
    const h1Count = document.querySelectorAll('h1').length;
    setChecks(prev => ({
      ...prev,
      seo_h1: { 
        status: h1Count === 1 ? 'success' : (h1Count === 0 ? 'error' : 'warning'), 
        label: 'H1 Tag Check', 
        msg: h1Count === 1 ? 'Perfect: Exactly one H1 tag found.' : (h1Count === 0 ? 'Missing: No H1 tag found on this page.' : `Warning: Multiple (${h1Count}) H1 tags found.`)
      }
    }));

    // Meta Description check
    const metaDesc = document.querySelector('meta[name="description"]');
    setChecks(prev => ({
      ...prev,
      seo_meta: {
        status: metaDesc ? 'success' : 'warning',
        label: 'Meta Description',
        msg: metaDesc ? 'Description found in head.' : 'Missing meta description tag.'
      }
    }));

    // OG check
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    setChecks(prev => ({
      ...prev,
      seo_og: {
        status: ogImage && ogTitle ? 'success' : 'warning',
        label: 'Open Graph Data',
        msg: ogImage && ogTitle ? 'OG tags (title, image) found.' : 'Missing some OG tags for social sharing.'
      }
    }));

    // Image Alt text check
    const imgs = Array.from(document.querySelectorAll('img'));
    const imgsWithoutAlt = imgs.filter(img => !img.alt);
    setChecks(prev => ({
      ...prev,
      seo_alt: {
        status: imgsWithoutAlt.length === 0 ? 'success' : 'warning',
        label: 'Image Alt Text',
        msg: imgsWithoutAlt.length === 0 ? `All ${imgs.length} images have alt text.` : `${imgsWithoutAlt.length} images are missing alt tags.`
      }
    }));
  };

  useEffect(() => {
    if (isOpen) {
      runChecks();
    }
  }, [isOpen]);

  const CheckIcon = ({ status }) => (
    <div className={`check-icon status-${status}`} />
  );

  return (
    <>
      <div 
        className={`site-inspector-trigger ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        title="Analyze Site Status"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        )}
      </div>

      {isOpen && (
        <div className="site-inspector-panel">
          <div className="inspector-header">
            <h3>Site Diagnostics</h3>
            <button className="refresh-btn" onClick={runChecks}>Refresh</button>
          </div>

          <div className="inspector-section">
            <span className="section-title">Critical Infrastructure</span>
            <div className="check-item">
              <CheckIcon status={checks.api.status} />
              <div className="check-content">
                <span className="check-label">{checks.api.label}</span>
                <span className="check-msg">{checks.api.msg}</span>
              </div>
            </div>
            <div className="check-item">
              <CheckIcon status={checks.db.status} />
              <div className="check-content">
                <span className="check-label">{checks.db.label}</span>
                <span className="check-msg">{checks.db.msg}</span>
              </div>
            </div>
          </div>

          <div className="inspector-section">
            <span className="section-title">SEO & Metadata</span>
            <div className="check-item">
              <CheckIcon status={checks.seo_h1.status} />
              <div className="check-content">
                <span className="check-label">{checks.seo_h1.label}</span>
                <span className="check-msg">{checks.seo_h1.msg}</span>
              </div>
            </div>
            <div className="check-item">
              <CheckIcon status={checks.seo_meta.status} />
              <div className="check-content">
                <span className="check-label">{checks.seo_meta.label}</span>
                <span className="check-msg">{checks.seo_meta.msg}</span>
              </div>
            </div>
            <div className="check-item">
              <CheckIcon status={checks.seo_og.status} />
              <div className="check-content">
                <span className="check-label">{checks.seo_og.label}</span>
                <span className="check-msg">{checks.seo_og.msg}</span>
              </div>
            </div>
            <div className="check-item">
              <CheckIcon status={checks.seo_alt.status} />
              <div className="check-content">
                <span className="check-label">{checks.seo_alt.label}</span>
                <span className="check-msg">{checks.seo_alt.msg}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SiteInspector;
