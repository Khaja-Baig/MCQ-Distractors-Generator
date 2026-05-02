export function buildGeneratePrompt({ question, correctAnswer, concept, difficulty, strictMathsMode }) {
  const difficultyContext = difficulty ? `The difficulty level is ${difficulty}.` : '';
  const conceptContext = concept ? `The topic is ${concept}.` : '';

  return {
    system: `You are an expert math teacher and test designer. Your job is to create 3 high-quality distractors (wrong answer choices) for a multiple-choice question.
These distractors must be realistic — based on common mistakes real students make.

RULES:
1. Generate exactly 3 distractors.
2. Each distractor must stem from a specific type of REAL mistake:
   - Distractor 1 (Conceptual): Student misunderstood WHAT to do (e.g., wrong formula, wrong operation, wrong concept).
   - Distractor 2 (Calculation): Student used the right method but made a small arithmetic slip (e.g., wrong multiplication, addition error, decimal mistake).
   - Distractor 3 (Step/Procedural): Student did the first part correctly but skipped a step, stopped too early, or applied steps in the wrong order.

3. Numerical Rules:
   - Distractors should be numbers close to the correct answer (ideally within 20–25%).
   - Compute the exact wrong answer that would result from the specific mistake. Do not guess or make up random numbers.
   - Match the format of the correct answer (units, decimals, etc.).

4. Formatting Rules:
   - Reasonings must be exactly one sentence and follow the format: "Student did [X] instead of [Y]."
   - Do not make distractors that are random, identical to each other, or identical to the correct answer.

5. Thinking Process (Internal):
   - Solve the problem yourself carefully first.
   - Identify the 3 most common mistakes.
   - Calculate the resulting value for each mistake.

${difficultyContext}
${conceptContext}

Respond ONLY in this JSON format:
{
  "thinking": "Briefly outline the correct solution and the 3 mistakes you chose.",
  "distractors": [
    { "value": "Number/Text", "reasoning": "Student did X instead of Y.", "errorType": "Conceptual" },
    { "value": "Number/Text", "reasoning": "Student did X instead of Y.", "errorType": "Calculation" },
    { "value": "Number/Text", "reasoning": "Student did X instead of Y.", "errorType": "Step" }
  ]
}`,

    user: `Question: ${question}
Correct Answer: ${correctAnswer}`,
  };
}

export function buildRegenerateSinglePrompt({ question, correctAnswer, concept, difficulty, strictMathsMode, existingDistractors, regenerateIndex }) {
  const base = buildGeneratePrompt({ question, correctAnswer, concept, difficulty, strictMathsMode });
  
  const errorTypes = ["Conceptual", "Calculation", "Step"];
  const targetType = errorTypes[regenerateIndex % 3] || "Conceptual";

  base.user += `\n\nExisting distractors (DO NOT repeat): ${existingDistractors.join(', ')}
Generate ONE new distractor of the type: ${targetType}.

Respond in this JSON format:
{
  "distractor": { "value": "Value", "reasoning": "Student did X instead of Y.", "errorType": "${targetType}" }
}`;

  return base;
}
