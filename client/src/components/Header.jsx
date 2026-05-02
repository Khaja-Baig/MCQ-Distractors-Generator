import React from 'react';

export default function Header({ onToggleHistory, historyCount }) {
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
