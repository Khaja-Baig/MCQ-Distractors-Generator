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
  const lastPayload = useRef(null);
  let toastId = useRef(0);

  const showToast = useCallback((message, type = 'info') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

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
      />

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
