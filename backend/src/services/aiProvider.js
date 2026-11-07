import axios from 'axios';

/**
 * Universal AI Provider Client
 * Automatically recognizes:
 * - Groq (starts with 'gsk_') -> llama-3.3-70b-versatile
 * - Gemini (starts with 'AIza') -> gemini-1.5-flash / gemini-2.0-flash
 * - OpenAI (starts with 'sk-') -> gpt-4o-mini
 * - Or respects explicit provider
 */

export const generateWithAI = async ({ prompt, systemPrompt, apiKey, provider = 'offline' }) => {
  const activeKey = (apiKey || process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '').trim();

  if (!activeKey || provider === 'offline') {
    return null; // Fallback cleanly to local synthesizer engine
  }

  // Auto-detect provider based on key format for foolproof execution
  let resolvedProvider = provider;
  if (activeKey.startsWith('gsk_')) {
    resolvedProvider = 'groq';
  } else if (activeKey.startsWith('AIza')) {
    resolvedProvider = 'gemini';
  } else if (activeKey.startsWith('sk-')) {
    resolvedProvider = 'openai';
  }

  try {
    if (resolvedProvider === 'groq') {
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      }, {
        headers: { 
          Authorization: `Bearer ${activeKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 25000
      });
      return response.data?.choices?.[0]?.message?.content || null;

    } else if (resolvedProvider === 'gemini') {
      // Try gemini-1.5-flash
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
          temperature: 0.3,
          maxOutputTokens: 3000
        }
      };
      const response = await axios.post(url, payload, { timeout: 25000 });
      return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

    } else {
      // OpenAI
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      }, {
        headers: { 
          Authorization: `Bearer ${activeKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 25000
      });
      return response.data?.choices?.[0]?.message?.content || null;
    }
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.error?.message || err.message;
    console.warn(`[AI Provider] Live API call to ${resolvedProvider} failed (Status ${status || 'unknown'}: ${msg}). Falling back to local synthesizer engine.`);
    return null;
  }
};
