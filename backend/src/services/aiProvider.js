import axios from 'axios';

/**
 * Universal AI Provider Client
 * Supports:
 * - Google Gemini (v1beta / gemini-1.5-flash)
 * - OpenAI (gpt-4o-mini / gpt-3.5-turbo)
 * - Groq (llama-3.3-70b-versatile / llama-3.1-8b-instant)
 * - Offline Intelligent Engine (if no API key configured)
 */

export const generateWithAI = async ({ prompt, systemPrompt, apiKey, provider = 'gemini' }) => {
  const activeKey = apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;

  if (!activeKey) {
    return null; // Signals caller to use the smart local synthesizer
  }

  try {
    if (provider === 'gemini' || activeKey.startsWith('AIza')) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: systemPrompt ? `${systemPrompt}\n\nTask:\n${prompt}` : prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 3000
        }
      };
      const response = await axios.post(url, payload, { timeout: 25000 });
      return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } else if (provider === 'groq' || activeKey.startsWith('gsk_')) {
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        temperature: 0.4
      }, {
        headers: { Authorization: `Bearer ${activeKey}` },
        timeout: 25000
      });
      return response.data?.choices?.[0]?.message?.content || null;
    } else {
      // Default to OpenAI compatible
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        temperature: 0.4
      }, {
        headers: { Authorization: `Bearer ${activeKey}` },
        timeout: 25000
      });
      return response.data?.choices?.[0]?.message?.content || null;
    }
  } catch (err) {
    console.warn(`[AI Provider] Live API call failed (${err.message}). Falling back to local synthesizer engine.`);
    return null;
  }
};
