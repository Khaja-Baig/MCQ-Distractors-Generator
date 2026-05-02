const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function generateDistractors({ question, correctAnswer, concept, difficulty, strictMathsMode }) {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, correctAnswer, concept, difficulty, strictMathsMode }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `Server error (${res.status})`);
  }
  return res.json();
}

export async function regenerateSingle({ question, correctAnswer, concept, difficulty, strictMathsMode, existingDistractors, regenerateIndex }) {
  const res = await fetch(`${API_BASE}/regenerate-single`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, correctAnswer, concept, difficulty, strictMathsMode, existingDistractors, regenerateIndex }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `Server error (${res.status})`);
  }
  return res.json();
}

export function formatMCQText(question, correctAnswer, distractors) {
  const options = [
    { label: 'A', value: correctAnswer, correct: true },
    ...distractors.map((d, i) => ({ label: String.fromCharCode(66 + i), value: d.value })),
  ];
  let text = `Q: ${question}\n`;
  options.forEach(o => {
    text += `${o.label}) ${o.value}${o.correct ? ' ✓' : ''}\n`;
  });
  return text;
}

export function formatCSV(question, correctAnswer, distractors) {
  const escape = (s) => `"${String(s).replace(/"/g, '""')}"`;
  const header = 'Question,Correct Answer,Option B,Reason B,Option C,Reason C,Option D,Reason D';
  const row = [
    escape(question), escape(correctAnswer),
    ...distractors.flatMap(d => [escape(d.value), escape(d.reasoning)]),
  ].join(',');
  return header + '\n' + row;
}
