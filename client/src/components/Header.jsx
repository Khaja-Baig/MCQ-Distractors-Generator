import React from 'react';

export default function Header({ onToggleHistory, historyCount, onToggleSettings, hasCustomKey }) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <div className="app-header__icon">🎯</div>
        <div>
          <div className="app-header__title">DistractorLab</div>
          <div className="app-header__subtitle">Smart MCQ distractor generator</div>
        </div>
      </div>
      <div className="app-header__actions">
        <button className={`btn btn--ghost btn--sm ${hasCustomKey ? 'btn--has-key' : ''}`} onClick={onToggleSettings} id="settings-toggle-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
          </svg>
          {hasCustomKey ? 'API Key Active' : 'API Key'}
        </button>
        <button className="btn btn--ghost btn--sm" onClick={onToggleHistory} id="history-toggle-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          History{historyCount > 0 ? ` (${historyCount})` : ''}
        </button>
      </div>
    </header>
  );
}
