import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

function readEnvKey() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    // accept either VITE_GEMINI_API_KEY or GEMINI_API_KEY for convenience
    const matchV = content.match(/^VITE_GEMINI_API_KEY=(.*)$/m);
    const matchG = content.match(/^GEMINI_API_KEY=(.*)$/m);
    if (matchV) return matchV[1].trim();
    if (matchG) return matchG[1].trim();
  }
  if (process.env.VITE_GEMINI_API_KEY) return process.env.VITE_GEMINI_API_KEY;
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  return null;
}

(async () => {
  try {
    const key = readEnvKey();
    if (!key) {
      console.error('No VITE_GEMINI_API_KEY found in .env.local or environment.');
      process.exit(2);
    }

    const ai = new GoogleGenAI({ apiKey: key });

    console.log('Sending small test prompt to Gemini...');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Please reply with a short confirmation message: "API key working"',
      config: { maxOutputTokens: 64 }
    });

    // Try to show a concise summary of the returned text (but never print the key)
    const text = (response && (response.text || response.candidates?.[0]?.content?.text)) || JSON.stringify(response);
    console.log('Received response (truncated):\n', String(text).slice(0, 1000));
  } catch (err) {
    console.error('Error while calling Gemini API:', err);
    process.exit(1);
  }
})();
