import React from 'react';

export default function LoadingState() {
  return (
    <div className="output-section" id="loading-state">
      <div className="output-divider">Generating…</div>
      {[1, 2, 3].map(i => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton-line skeleton-line--sm" />
          <div className="skeleton-line skeleton-line--md" />
          <div className="skeleton-line skeleton-line--reason" />
        </div>
      ))}
    </div>
  );
}
