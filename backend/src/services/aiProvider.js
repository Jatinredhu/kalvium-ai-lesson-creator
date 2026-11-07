/**
 * Universal AI Provider Client
 * Supports:
 * - Groq (qwen/qwen3.8-27b, openai/gpt-oss-120b)
 * - Google Gemini (gemini-1.5-flash)
 * - OpenAI (gpt-4o-mini)
 */

export const generateWithAI = async ({ prompt, systemPrompt, apiKey, provider }) => {
  const activeKey = (apiKey || process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '').trim();

  if (!activeKey) {
    return null; // Offline mode
  }

  // If user explicitly chose offline in frontend
  if (provider === 'offline' && !apiKey) {
    return null;
  }

  // Auto-detect provider based on key format
  let resolvedProvider = provider;
  if (activeKey.startsWith('gsk_')) {
    resolvedProvider = 'groq';
  } else if (activeKey.startsWith('AIza')) {
    resolvedProvider = 'gemini';
  } else if (activeKey.startsWith('sk-')) {
    resolvedProvider = 'openai';
  } else if (!resolvedProvider || resolvedProvider === 'offline') {
    resolvedProvider = 'groq';
  }

  try {
    if (resolvedProvider === 'groq') {
      const modelsToTry = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

      for (const groqModel of modelsToTry) {
        try {
          const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${activeKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: groqModel,
              messages: [
                ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                { role: 'user', content: prompt }
              ],
              temperature: 0.3
            })
          });

          const data = await res.json();
          if (data.choices && data.choices[0]?.message?.content) {
            console.log(`[AI Provider] Live lesson generation powered by Groq (${groqModel})`);
            return data.choices[0].message.content;
          }
        } catch (mErr) {
          continue;
        }
      }
      return null;

    } else if (resolvedProvider === 'gemini') {
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

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;

    } else {
      // OpenAI
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          temperature: 0.3
        })
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content || null;
    }
  } catch (err) {
    console.warn(`[AI Provider] Live API call failed: ${err.message}. Falling back to local synthesizer.`);
    return null;
  }
};
