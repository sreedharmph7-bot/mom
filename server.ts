import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy init Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the server');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// AI Endpoint: Assist formatting rough notes into the uniform MoM standard schema
app.post('/api/ai/format-notes', async (req, res) => {
  try {
    const { rawNotes, meetingTitle, department } = req.body;

    if (!rawNotes || typeof rawNotes !== 'string') {
      return res.status(400).json({ error: 'rawNotes is required' });
    }

    const ai = getGeminiClient();

    const prompt = `You are an expert institutional minutes-of-meeting (MoM) secretary.
The organization strictly requires all meeting minutes to follow an exact uniform standard format with these specific sections:
1. Meeting Title & Department
2. Reviewed by / Chaired by (Name and Designation)
3. In the presence of (if any)
4. Officers and Officials Attended (list of attendees with designations)
5. Items Discussed: Each item has a title, summary/key learnings/context, and sub-points (A, B, C...) with assigned "Action: [Department/Officer]" tags.
6. Key Directions / Inputs of the Chair (lettered A, B, C...) with assigned "Action: [Department/Officer]" tags.
7. Concluding Directive statement directing time-bound implementation.

Given the following raw meeting notes, parse and structure them into JSON matching the uniform standard schema:

RAW NOTES:
"""
${rawNotes}
"""

${meetingTitle ? `Context Title: ${meetingTitle}` : ''}
${department ? `Context Department: ${department}` : ''}

Respond ONLY with valid JSON with this exact structure:
{
  "title": "...",
  "department": "...",
  "meetingDate": "DD-MM-YYYY",
  "reviewedBy": "...",
  "inPresenceOf": "...",
  "attendees": [
    { "name": "...", "designation": "...", "department": "..." }
  ],
  "itemsDiscussed": [
    {
      "title": "...",
      "summary": "...",
      "subPoints": [
        { "label": "A", "content": "...", "action": "..." }
      ],
      "action": "..."
    }
  ],
  "keyDirectionsTitle": "Key Directions / Inputs of the Hon'ble Minister / Chair",
  "keyDirections": [
    { "label": "A", "title": "...", "content": "...", "action": "..." }
  ],
  "concludingDirective": "..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text;
    if (!outputText) {
      return res.status(500).json({ error: 'Empty response from AI' });
    }

    const parsed = JSON.parse(outputText);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/format-notes:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to process notes with AI',
    });
  }
});

// Vite Middleware for development & Static file serving for production
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
