import React from 'react';

const RegenIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
  </svg>
);

export default function DistractorCard({ label, value, reasoning, errorType, onRegenerate, isRegenerating }) {
  return (
    <div className="distractor-card" id={`distractor-card-${label.toLowerCase()}`}>
      <div className="distractor-card__header">
        <div className="distractor-card__main">
          <div className="distractor-card__label">
            Option {label}
            {errorType && <span className="error-type-badge">{errorType}</span>}
          </div>
          <div className="distractor-card__value">{value}</div>
        </div>
        {onRegenerate && (
          <button
            className={`distractor-card__regen ${isRegenerating ? 'distractor-card__regen--loading' : ''}`}
            onClick={onRegenerate}
            disabled={isRegenerating}
            title="Regenerate this option"
            aria-label={`Regenerate option ${label}`}
          >
            <RegenIcon />
          </button>
        )}
      </div>
      {reasoning && (
        <div className="distractor-card__reasoning">
          <div className="distractor-card__reasoning-label">Why students pick this</div>
          {reasoning}
        </div>
      )}
    </div>
  );
}
