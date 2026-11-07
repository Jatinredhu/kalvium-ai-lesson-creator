import React, { useState, useEffect } from 'react';
import { X, Key, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, onSaveSettings }) {
  const [provider, setProvider] = useState('offline');
  const [apiKey, setApiKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const savedProv = localStorage.getItem('kalvium_ai_provider') || 'offline';
    const savedKey = localStorage.getItem('kalvium_ai_key') || '';
    setProvider(savedProv);
    setApiKey(savedKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('kalvium_ai_provider', provider);
    localStorage.setItem('kalvium_ai_key', apiKey.trim());
    if (onSaveSettings) {
      onSaveSettings({ provider, apiKey: apiKey.trim() });
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Engine & API Keys</h3>
              <p className="text-xs text-slate-500">Configure your LLM provider or run 100% offline.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Generation Engine Mode
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white cursor-pointer transition-all">
                <input
                  type="radio"
                  name="provider"
                  value="offline"
                  checked={provider === 'offline'}
                  onChange={() => setProvider('offline')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-900">
                    Smart Pedagogical Synthesizer (Offline / Zero Key)
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Fetches real books, web links & YouTube videos without any LLM API key required.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white cursor-pointer transition-all">
                <input
                  type="radio"
                  name="provider"
                  value="gemini"
                  checked={provider === 'gemini'}
                  onChange={() => setProvider('gemini')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-900">
                    Google Gemini (Gemini 1.5 / 2.0 Flash)
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Free tier available at Google AI Studio.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white cursor-pointer transition-all">
                <input
                  type="radio"
                  name="provider"
                  value="groq"
                  checked={provider === 'groq'}
                  onChange={() => setProvider('groq')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-900">
                    Groq Cloud (Llama 3.3 70B Versatile)
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    High-speed free tier at groq.com.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white cursor-pointer transition-all">
                <input
                  type="radio"
                  name="provider"
                  value="openai"
                  checked={provider === 'openai'}
                  onChange={() => setProvider('openai')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-900">
                    OpenAI (GPT-4o-mini)
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Uses OpenAI API key.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {provider !== 'offline' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                API Key for {provider.toUpperCase()}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Paste your ${provider} API key here...`}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Stored strictly in your local browser storage; never shared or committed.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {savedSuccess ? 'Settings saved!' : ''}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
