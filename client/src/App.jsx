import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header.jsx';
import InputForm from './components/InputForm.jsx';
import OutputPanel from './components/OutputPanel.jsx';
import LoadingState from './components/LoadingState.jsx';
import HistoryPanel from './components/HistoryPanel.jsx';
import Toast from './components/Toast.jsx';
import { generateDistractors, regenerateSingle } from './utils/api.js';

const HISTORY_KEY = 'distractorlab_history';

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { return []; }
}

function saveHistory(h) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 50)));
}

export default function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [regeneratingIndex, setRegeneratingIndex] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState(loadHistory);
  const [toasts, setToasts] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [tempKey, setTempKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const lastPayload = useRef(null);
  let toastId = useRef(0);

  const showToast = useCallback((message, type = 'info') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const handleSaveKey = () => {
    const trimmed = tempKey.trim();
    if (trimmed) {
      localStorage.setItem('gemini_api_key', trimmed);
      setApiKey(trimmed);
      showToast('Custom API Key saved successfully', 'success');
    } else {
      handleClearKey();
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setTempKey('');
    showToast('Custom API Key cleared', 'info');
  };

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToHistory = useCallback((payload, distractors) => {
    const entry = {
      ...payload,
      distractors,
      timestamp: Date.now(),
    };
    const updated = [entry, ...loadHistory()].slice(0, 50);
    setHistory(updated);
    saveHistory(updated);
  }, []);

  async function handleGenerate(payload) {
    lastPayload.current = payload;
    setIsLoading(true);
    setResult(null);
    try {
      const data = await generateDistractors(payload);
      const res = {
        question: payload.question,
        correctAnswer: payload.correctAnswer,
        distractors: data.distractors,
      };
      setResult(res);
      addToHistory(payload, data.distractors);
    } catch (err) {
      showToast(err.message || 'Failed to generate distractors', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegenerateAll() {
    if (lastPayload.current) {
      await handleGenerate(lastPayload.current);
    }
  }

  async function handleRegenerateSingle(index) {
    if (!lastPayload.current || !result) return;
    setRegeneratingIndex(index);
    try {
      const data = await regenerateSingle({
        ...lastPayload.current,
        existingDistractors: result.distractors.map(d => d.value),
        regenerateIndex: index,
      });
      setResult(prev => {
        const updated = [...prev.distractors];
        updated[index] = data.distractor;
        return { ...prev, distractors: updated };
      });
    } catch (err) {
      showToast(err.message || 'Failed to regenerate', 'error');
    } finally {
      setRegeneratingIndex(null);
    }
  }

  function handleHistorySelect(item) {
    setResult({
      question: item.question,
      correctAnswer: item.correctAnswer,
      distractors: item.distractors,
    });
    lastPayload.current = {
      question: item.question,
      correctAnswer: item.correctAnswer,
      concept: item.concept,
      difficulty: item.difficulty,
      strictMathsMode: item.strictMathsMode,
    };
    setHistoryOpen(false);
  }

  function handleClearHistory() {
    setHistory([]);
    saveHistory([]);
    showToast('History cleared', 'success');
  }

  return (
    <div className="app-container">
      <Header
        onToggleHistory={() => setHistoryOpen(true)}
        historyCount={history.length}
        onToggleSettings={() => setShowSettings(prev => !prev)}
        hasCustomKey={!!apiKey}
      />

      {showSettings && (
        <div className="settings-card">
          <div className="settings-card__header">
            <h3 className="settings-card__title">API Configuration</h3>
            <p className="settings-card__desc">
              Enter your own Gemini API Key. It is stored in your browser's local storage and only used for your generation requests.
            </p>
          </div>
          <div className="settings-card__body">
            <div className="form-group">
              <label className="form-label" htmlFor="api-key-input">Gemini API Key</label>
              <div className="settings-card__input-group">
                <input
                  id="api-key-input"
                  type="password"
                  className="form-input"
                  placeholder="Enter Gemini API Key (e.g. AIzaSy...)"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                />
                <div className="settings-card__actions">
                  <button type="button" className="btn btn--primary btn--sm" onClick={handleSaveKey}>
                    Save Key
                  </button>
                  {apiKey && (
                    <button type="button" className="btn btn--sm" onClick={handleClearKey}>
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="settings-card__footer">
              {apiKey ? (
                <div className="settings-status settings-status--success">
                  <span className="settings-status__dot"></span>
                  Custom API Key is active
                </div>
              ) : (
                <div className="settings-status settings-status--info">
                  <span className="settings-status__dot"></span>
                  Using default key/demo mode
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <InputForm onGenerate={handleGenerate} isLoading={isLoading} />

      {isLoading && <LoadingState />}

      {!isLoading && result && (
        <OutputPanel
          result={result}
          onRegenerateSingle={handleRegenerateSingle}
          regeneratingIndex={regeneratingIndex}
          onRegenerateAll={handleRegenerateAll}
          isLoading={isLoading}
          showToast={showToast}
        />
      )}

      {!isLoading && !result && (
        <div className="empty-state">
          <div className="empty-state__icon">✨</div>
          <div className="empty-state__title">Ready to generate</div>
          <div className="empty-state__text">
            Enter a question and correct answer above, then click Generate Distractors
          </div>
        </div>
      )}

      <HistoryPanel
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onSelect={handleHistorySelect}
        onClear={handleClearHistory}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
