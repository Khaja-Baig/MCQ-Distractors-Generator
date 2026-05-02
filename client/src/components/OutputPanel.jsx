import React from 'react';
import DistractorCard from './DistractorCard.jsx';
import { formatMCQText, formatCSV } from '../utils/api.js';

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
  </svg>
);

export default function OutputPanel({ result, onRegenerateSingle, regeneratingIndex, onRegenerateAll, isLoading, showToast }) {
  if (!result) return null;

  const { question, correctAnswer, distractors } = result;
  const labels = ['B', 'C', 'D'];

  function handleCopyAll() {
    const text = formatMCQText(question, correctAnswer, distractors);
    navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!', 'success'));
  }

  function handleExportCSV() {
    const csv = formatCSV(question, correctAnswer, distractors);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'distractors.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV downloaded!', 'success');
  }

  return (
    <div className="output-section" id="output-section">
      <div className="output-divider">Generated Results</div>

      <div className="correct-answer-card" id="correct-answer-card">
        <div className="correct-answer-card__badge">✓</div>
        <div>
          <div className="correct-answer-card__label">CORRECT ANSWER (A)</div>
          <div className="correct-answer-card__text">{correctAnswer}</div>
        </div>
      </div>

      {distractors.map((d, i) => (
        <DistractorCard
          key={`${labels[i]}-${d.value}`}
          label={labels[i]}
          value={d.value}
          reasoning={d.reasoning}
          errorType={d.errorType}
          onRegenerate={() => onRegenerateSingle(i)}
          isRegenerating={regeneratingIndex === i}
        />
      ))}

      <div className="action-bar">
        <button className="btn btn--sm" onClick={handleCopyAll} id="copy-all-btn">
          <CopyIcon /> Copy All
        </button>
        <button className="btn btn--sm" onClick={handleExportCSV} id="export-csv-btn">
          <DownloadIcon /> Export CSV
        </button>
        <button className="btn btn--sm" onClick={onRegenerateAll} disabled={isLoading} id="regenerate-all-btn">
          <RefreshIcon /> Regenerate All
        </button>
      </div>
    </div>
  );
}
