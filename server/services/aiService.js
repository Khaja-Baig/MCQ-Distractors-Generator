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
const clientCache = new Map();

function getGeminiClient(apiKey) {
  if (!apiKey) return null;
  if (clientCache.has(apiKey)) {
    return clientCache.get(apiKey);
  }
  const client = new GoogleGenAI({ apiKey });
  clientCache.set(apiKey, client);
  return client;
}

async function callGemini(client, systemPrompt, userPrompt) {
  const fullPrompt = `${systemPrompt}\n\nUser Input:\n${userPrompt}`;
  
  const response = await client.models.generateContent({
    model: 'gemini-3.5-flash',
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
}

export function createAIService() {
  const defaultApiKey = process.env.GEMINI_API_KEY;
  const hasDefaultKey = defaultApiKey && defaultApiKey !== 'your_gemini_api_key_here';

  if (hasDefaultKey) {
    console.log('✓ AI Service: Google Gemini (gemini-3.5-flash) [Default Key Configured]');
  } else {
    console.log('⚠ AI Service: Initialized in Demo Mode (no default GEMINI_API_KEY found)');
  }

  return {
    async generateDistractors(promptData) {
      const apiKey = promptData.apiKey || defaultApiKey;
      const hasKey = apiKey && apiKey !== 'your_gemini_api_key_here';

      if (!hasKey) {
        await new Promise(r => setTimeout(r, MOCK_DELAY));
        return mockGenerate(promptData);
      }

      try {
        const client = getGeminiClient(apiKey);
        const { buildGeneratePrompt } = await import('../prompts/distractorPrompt.js');
        const { system, user } = buildGeneratePrompt(promptData);
        return await callGemini(client, system, user);
      } catch (err) {
        console.error('Gemini generate error:', err);
        throw err;
      }
    },

    async regenerateSingle(promptData) {
      const apiKey = promptData.apiKey || defaultApiKey;
      const hasKey = apiKey && apiKey !== 'your_gemini_api_key_here';

      if (!hasKey) {
        await new Promise(r => setTimeout(r, MOCK_DELAY));
        return mockRegenerateSingle(promptData);
      }

      try {
        const client = getGeminiClient(apiKey);
        const { buildRegenerateSinglePrompt } = await import('../prompts/distractorPrompt.js');
        const { system, user } = buildRegenerateSinglePrompt(promptData);
        return await callGemini(client, system, user);
      } catch (err) {
        console.error('Gemini regenerateSingle error:', err);
        throw err;
      }
    },
  };
}
