import { GoogleGenAI } from '@google/genai';

export const fetchEventsFromGemini = async () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not set in environment');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = [
    'Scour the internet for a diverse list of upcoming events and activities in Lenawee County, Michigan.',
    'Include a variety of event types like festivals, concerts, markets, sports, community gatherings, and family-friendly activities.',
    'Return a list of at least 15 events.',
    '',
    'Format your entire response as a single JSON object inside a JSON markdown block (```json ... ```).',
    'The JSON object must have a single key "events" which is an array of event objects.',
    'Each event object in the array must have the following properties:',
    '- "name": string',
    '- "description": string',
    '- "date": string (YYYY-MM-DD)',
    '- "time": string',
    '- "location": object (with "venue" and "address")',
    '- "isKidFriendly": boolean',
    '- "sourceUrl": string',
  ].join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const textResponse = (response.text ?? '').trim();
  let jsonString = textResponse;
  const jsonBlockMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch && jsonBlockMatch[1]) {
    jsonString = jsonBlockMatch[1];
  }

  if (!jsonString) throw new Error('Empty response from Gemini');

  const parsed = JSON.parse(jsonString);
  const events = parsed.events || [];
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  return { events, sources };
};
