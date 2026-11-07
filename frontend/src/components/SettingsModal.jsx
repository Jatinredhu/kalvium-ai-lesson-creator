import React, { useState, useEffect } from 'react';
import { X, Settings as SettingsIcon, Check, Zap, Sparkles } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const [provider, setProvider] = useState('offline');
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedProvider = localStorage.getItem('lessoncraft_provider') || 'offline';
      const savedKey = localStorage.getItem('lessoncraft_api_key') || '';
      setProvider(savedProvider);
      setApiKey(savedKey);
      setSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('lessoncraft_provider', provider);
    localStorage.setItem('lessoncraft_api_key', apiKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Engine Configuration</h3>
              <p className="text-xs text-slate-500">Configure LLM providers or run 100% offline.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Generation Engine
            </label>
            <div className="space-y-2">
              {/* Option 1: Offline Default */}
              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                provider === 'offline' 
                  ? 'border-rose-300 bg-rose-50/40' 
                  : 'border-slate-200 bg-slate-50/40 hover:bg-white'
              }`}>
                <input
                  type="radio"
                  name="provider"
                  value="offline"
                  checked={provider === 'offline'}
                  onChange={() => setProvider('offline')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-900">
                    Built-in Pedagogical Engine (Default / Zero Key)
                  </span>
                  <span className="block text-[11px] text-slate-500 leading-snug">
                    Synthesizes real Google Books, web standards & YouTube videos offline with zero setup.
                  </span>
                </div>
              </label>

              {/* Option 2: Groq */}
              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                provider === 'groq' 
                  ? 'border-rose-300 bg-rose-50/40' 
                  : 'border-slate-200 bg-slate-50/40 hover:bg-white'
              }`}>
                <input
                  type="radio"
                  name="provider"
                  value="groq"
                  checked={provider === 'groq'}
                  onChange={() => setProvider('groq')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Groq Cloud (Llama 3.1 Instant)</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">Free Tier</span>
                  </div>
                  <span className="block text-[11px] text-slate-500 leading-snug">
                    Ultra-fast open models via free API key at console.groq.com.
                  </span>
                </div>
              </label>

              {/* Option 3: Gemini */}
              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                provider === 'gemini' 
                  ? 'border-rose-300 bg-rose-50/40' 
                  : 'border-slate-200 bg-slate-50/40 hover:bg-white'
              }`}>
                <input
                  type="radio"
                  name="provider"
                  value="gemini"
                  checked={provider === 'gemini'}
                  onChange={() => setProvider('gemini')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Google Gemini (Gemini 1.5 Flash)</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">Free Tier</span>
                  </div>
                  <span className="block text-[11px] text-slate-500 leading-snug">
                    Free API keys from Google AI Studio (aistudio.google.com).
                  </span>
                </div>
              </label>

              {/* Option 4: OpenAI */}
              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                provider === 'openai' 
                  ? 'border-rose-300 bg-rose-50/40' 
                  : 'border-slate-200 bg-slate-50/40 hover:bg-white'
              }`}>
                <input
                  type="radio"
                  name="provider"
                  value="openai"
                  checked={provider === 'openai'}
                  onChange={() => setProvider('openai')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-900">OpenAI (GPT-4o-mini)</span>
                  <span className="block text-[11px] text-slate-500 leading-snug">
                    Requires OpenAI API key with available credits.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* API Key Input (Only shown if a live provider is selected) */}
          {provider !== 'offline' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                API Key ({provider.toUpperCase()})
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Paste your ${provider} API key here...`}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Stored locally in your browser. (You can also set it in <code className="text-slate-600">backend/.env</code>).
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600">
              {saved ? '✓ Saved successfully!' : ''}
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
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
