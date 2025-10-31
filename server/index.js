import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchEventsFromGemini } from './geminiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the Vite build
app.use(express.static(path.join(__dirname, '..', 'dist')));

// API endpoint to fetch events (server-side, keeps API key secret)
app.get('/api/events', async (req, res) => {
  try {
    const result = await fetchEventsFromGemini();
    res.json(result);
  } catch (err) {
    console.error('Error in /api/events:', err);
    res.status(500).json({ error: 'Failed to fetch events from Gemini' });
  }
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
