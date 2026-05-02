import { GoogleGenAI } from '@google/genai';

// --- Mock data for demo mode (no API key needed) ---
const MOCK_DELAY = 1500;

function mockGenerate({ question, correctAnswer }) {
  const isNumeric = !isNaN(parseFloat(correctAnswer));
  if (isNumeric) {
    const num = parseFloat(correctAnswer);
    return {
      distractors: [
        { value: String(num * 2), reasoning: 'Student may have doubled the value instead of applying the correct operation.' },
        { value: String(Math.round(num * 0.75)), reasoning: 'Student may have used 75% instead of the correct percentage.' },
        { value: String(num + 10), reasoning: 'Student may have added a round number offset from miscalculation.' },
      ],
    };
  }
  return {
    distractors: [
      { value: correctAnswer + ' (partial)', reasoning: 'Student may have identified a related but incomplete concept.' },
      { value: 'Opposite of ' + correctAnswer, reasoning: 'Student may have confused the concept with its inverse.' },
      { value: 'Related Concept', reasoning: 'Student may have swapped the term for a closely related but distinct one.' },
    ],
  };
}

function mockRegenerateSingle({ correctAnswer }) {
  const isNumeric = !isNaN(parseFloat(correctAnswer));
  const num = parseFloat(correctAnswer);
  const value = isNumeric ? String(Math.round(num * 1.15)) : correctAnswer + ' (variant)';
  return {
    distractor: { value, reasoning: 'Student may have applied a slightly different, but incorrect, method.' },
  };
}

// --- Gemini AI service using new @google/genai SDK ---
function createGeminiService() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') return null;

  // New @google/genai client creation matching user's snippet
  const client = new GoogleGenAI({ apiKey });

  return {
    async generate(systemPrompt, userPrompt) {
      const fullPrompt = `${systemPrompt}\n\nUser Input:\n${userPrompt}`;
      
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      
      // The SDK returns text directly or via response.text
      const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty response from Gemini");
      
      // Handle potential markdown backticks in response
      const cleanJson = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      return JSON.parse(cleanJson);
    },
  };
}

export function createAIService() {
  const aiService = createGeminiService();

  if (aiService) {
    console.log('✓ AI Service: Google Gemini (gemini-2.5-flash)');
    return {
      async generateDistractors(promptData) {
        const { buildGeneratePrompt } = await import('../prompts/distractorPrompt.js');
        const { system, user } = buildGeneratePrompt(promptData);
        return aiService.generate(system, user);
      },
      async regenerateSingle(promptData) {
        const { buildRegenerateSinglePrompt } = await import('../prompts/distractorPrompt.js');
        const { system, user } = buildRegenerateSinglePrompt(promptData);
        return aiService.generate(system, user);
      },
    };
  }

  // Fallback to mock/demo mode
  console.log('⚠ AI Service: Demo Mode (no API key found)');
  console.log('  Set GEMINI_API_KEY in server/.env for real AI generation');
  return {
    async generateDistractors(promptData) {
      await new Promise(r => setTimeout(r, MOCK_DELAY));
      return mockGenerate(promptData);
    },
    async regenerateSingle(promptData) {
      await new Promise(r => setTimeout(r, MOCK_DELAY));
      return mockRegenerateSingle(promptData);
    },
  };
}
