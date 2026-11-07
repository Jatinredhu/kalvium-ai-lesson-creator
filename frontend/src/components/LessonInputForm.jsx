import React, { useState } from 'react';
import { Sparkles, Play, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

const SAMPLES = [
  {
    name: 'Sample 1 (Kalvium Prompt)',
    title: 'HTTP Requests and Responses',
    objective: 'Explain GET and POST methods and distinguish between 2xx, 4xx, and 5xx response status categories.',
    audience: 'Undergraduate / Junior Software Engineers',
    duration: 45
  },
  {
    name: 'Sample 2 (Database Indexing)',
    title: 'Database Indexing & Query Optimization',
    objective: 'Explain B-Tree vs Hash index structures and demonstrate how composite index column ordering impacts query execution plans.',
    audience: 'Backend Developers / CS Students',
    duration: 45
  }
];

export default function LessonInputForm({ onSubmit, isCreating }) {
  const [title, setTitle] = useState('');
  const [learningObjective, setLearningObjective] = useState('');
  const [targetAudience, setTargetAudience] = useState('Undergraduate / Junior Software Engineers');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [error, setError] = useState('');

  const loadSample = (sample) => {
    setTitle(sample.title);
    setLearningObjective(sample.objective);
    setTargetAudience(sample.audience);
    setDurationMinutes(sample.duration);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a Lesson Title before proceeding.');
      return;
    }
    if (!learningObjective.trim()) {
      setError('Please provide a Learning Objective before proceeding.');
      return;
    }
    setError('');
    onSubmit({
      title: title.trim(),
      learningObjective: learningObjective.trim(),
      targetAudience,
      durationMinutes
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create a New Lesson</h2>
          <p className="text-sm text-slate-500 mt-1">
            Specify the title and learning objective. The pipeline will research books, websites, and YouTube videos, synthesize a 45-minute lesson, and execute dual QC layers.
          </p>
        </div>

        {/* Quick Samples */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Quick Test Inputs:</span>
          {SAMPLES.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadSample(s)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 text-slate-700 transition-colors"
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Lesson Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
            placeholder="e.g. HTTP Requests and Responses"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Learning Objective <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={learningObjective}
            onChange={(e) => { setLearningObjective(e.target.value); setError(''); }}
            placeholder="e.g. Explain GET and POST methods and distinguish between 2xx, 4xx, and 5xx response status categories."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Target Audience
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Target Duration (Fixed to 45 Minutes)
            </label>
            <div className="flex items-center px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium">
              45 Minutes (Pedagogical Standard)
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end">
          <button
            type="submit"
            disabled={isCreating}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white font-semibold text-sm shadow-md shadow-rose-500/20 disabled:opacity-60 transition-all"
          >
            {isCreating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Initializing Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Launch Lesson Generation Pipeline</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
