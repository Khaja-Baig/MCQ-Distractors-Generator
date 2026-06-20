import { Router } from 'express';

export function createGenerateRouter(aiService) {
  const router = Router();

  // POST /api/generate — Generate 3 distractors
  router.post('/generate', async (req, res) => {
    try {
      const { question, correctAnswer, concept, difficulty, strictMathsMode } = req.body;
      const apiKey = req.headers['x-gemini-api-key'];

      if (!question || !question.trim()) {
        return res.status(400).json({ error: 'Question is required' });
      }
      if (!correctAnswer || !correctAnswer.trim()) {
        return res.status(400).json({ error: 'Correct answer is required' });
      }

      const result = await aiService.generateDistractors({
        question: question.trim(),
        correctAnswer: correctAnswer.trim(),
        concept: concept?.trim() || undefined,
        difficulty: difficulty || 'Medium',
        strictMathsMode: !!strictMathsMode,
        apiKey,
      });

      // Validate response shape
      if (!result?.distractors || !Array.isArray(result.distractors) || result.distractors.length < 3) {
        return res.status(500).json({ error: 'AI returned an invalid response. Please try again.' });
      }

      res.json({ distractors: result.distractors.slice(0, 3) });
    } catch (err) {
      console.error('Generate error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate distractors' });
    }
  });

  // POST /api/regenerate-single — Regenerate one distractor
  router.post('/regenerate-single', async (req, res) => {
    try {
      const { question, correctAnswer, concept, difficulty, strictMathsMode, existingDistractors, regenerateIndex } = req.body;
      const apiKey = req.headers['x-gemini-api-key'];

      if (!question || !correctAnswer) {
        return res.status(400).json({ error: 'Question and correct answer are required' });
      }

      const result = await aiService.regenerateSingle({
        question: question.trim(),
        correctAnswer: correctAnswer.trim(),
        concept: concept?.trim() || undefined,
        difficulty: difficulty || 'Medium',
        strictMathsMode: !!strictMathsMode,
        existingDistractors: existingDistractors || [],
        regenerateIndex: regenerateIndex ?? 0,
        apiKey,
      });

      if (!result?.distractor) {
        return res.status(500).json({ error: 'AI returned an invalid response. Please try again.' });
      }

      res.json({ distractor: result.distractor });
    } catch (err) {
      console.error('Regenerate error:', err);
      res.status(500).json({ error: err.message || 'Failed to regenerate distractor' });
    }
  });

  return router;
}
