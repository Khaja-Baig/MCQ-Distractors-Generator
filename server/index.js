import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createAIService } from './services/aiService.js';
import { createGenerateRouter } from './routes/generate.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize AI service
const aiService = createAIService();

// Mount routes
app.use('/api', createGenerateRouter(aiService));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🎯 DistractorLab API running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
