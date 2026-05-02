import React from 'react';

export default function HistoryPanel({ isOpen, onClose, history, onSelect, onClear }) {
  return (
    <>
      <div className={`history-overlay ${isOpen ? 'history-overlay--open' : ''}`} onClick={onClose} />
      <aside className={`history-panel ${isOpen ? 'history-panel--open' : ''}`} id="history-panel">
        <div className="history-panel__header">
          <div className="history-panel__title">History</div>
          <button className="btn btn--icon" onClick={onClose} aria-label="Close history">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="history-panel__body">
          {history.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">📋</div>
              <div className="empty-state__title">No history yet</div>
              <div className="empty-state__text">Generated distractors will appear here</div>
            </div>
          ) : (
            history.map((item, i) => (
              <div className="history-item" key={item.timestamp} onClick={() => onSelect(item)}>
                <div className="history-item__question">{item.question}</div>
                <div className="history-item__meta">
                  {item.difficulty} · {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
        {history.length > 0 && (
          <div className="history-panel__footer">
            <button className="btn btn--sm btn--full" onClick={onClear} id="clear-history-btn">
              Clear History
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
