import React, { useState } from 'react';

const CONCEPTS = [
  'Percentages', 'Ratios', 'Fractions', 'Algebra', 'Geometry', 'Trigonometry',
  'Statistics', 'Probability', 'Arithmetic', 'Grammar', 'Vocabulary',
  'Reading Comprehension', 'Science', 'Physics', 'Chemistry', 'Biology',
  'History', 'Geography',
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function InputForm({ onGenerate, isLoading }) {
  const [question, setQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [concept, setConcept] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [strictMaths, setStrictMaths] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!question.trim()) e.question = 'Please enter a question';
    if (!correctAnswer.trim()) e.correctAnswer = 'Please enter the correct answer';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    onGenerate({
      question: question.trim(),
      correctAnswer: correctAnswer.trim(),
      concept: concept.trim() || undefined,
      difficulty,
      strictMathsMode: strictMaths,
    });
  }

  return (
    <form className="form-section" onSubmit={handleSubmit} id="input-form">
      <div className="form-group">
        <label className="form-label" htmlFor="question-input">Question</label>
        <textarea
          id="question-input"
          className={`form-textarea ${errors.question ? 'form-input--error' : ''}`}
          placeholder="e.g. What is 25% of 160?"
          value={question}
          onChange={(e) => { setQuestion(e.target.value); setErrors(prev => ({ ...prev, question: null })); }}
          rows={3}
        />
        {errors.question && <div className="form-error">{errors.question}</div>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="answer-input">Correct Answer</label>
        <input
          id="answer-input"
          type="text"
          className={`form-input ${errors.correctAnswer ? 'form-input--error' : ''}`}
          placeholder="e.g. 40"
          value={correctAnswer}
          onChange={(e) => { setCorrectAnswer(e.target.value); setErrors(prev => ({ ...prev, correctAnswer: null })); }}
        />
        {errors.correctAnswer && <div className="form-error">{errors.correctAnswer}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="concept-input">
            Concept <span className="form-sublabel">(optional)</span>
          </label>
          <input
            id="concept-input"
            type="text"
            className="form-input"
            placeholder="e.g. Percentages"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            list="concept-suggestions"
          />
          <datalist id="concept-suggestions">
            {CONCEPTS.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>

        <div className="form-group">
          <label className="form-label">Difficulty</label>
          <div className="difficulty-toggle">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                type="button"
                className={`difficulty-toggle__btn ${difficulty === d ? 'difficulty-toggle__btn--active' : ''}`}
                onClick={() => setDifficulty(d)}
                id={`difficulty-${d.toLowerCase()}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="toggle-row">
        <div>
          <div className="toggle-row__label">Strict Maths Mode</div>
          <div className="toggle-row__sublabel">Use rule-based error patterns for numerical questions</div>
        </div>
        <button
          type="button"
          className={`toggle-switch ${strictMaths ? 'toggle-switch--active' : ''}`}
          onClick={() => setStrictMaths(!strictMaths)}
          role="switch"
          aria-checked={strictMaths}
          id="strict-maths-toggle"
        />
      </div>

      <button
        type="submit"
        className="btn btn--primary btn--full"
        disabled={isLoading}
        id="generate-btn"
        style={{ marginTop: '0.75rem' }}
      >
        {isLoading ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
              <path d="M12 2v4m0 12v4m-7.07-14.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" strokeLinecap="round"/>
            </svg>
            Generating…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            Generate Distractors
          </>
        )}
      </button>
    </form>
  );
}
