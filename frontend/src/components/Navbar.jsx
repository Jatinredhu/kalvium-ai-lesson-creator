import React from 'react';
import { BookOpen, Database, Sparkles, Settings as SettingsIcon, PlusCircle, CheckCircle2 } from 'lucide-react';

export default function Navbar({ 
  systemStatus, 
  onOpenSettings, 
  onNewLesson, 
  lessons = [], 
  activeLessonId, 
  onSelectLesson 
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-sm shadow-rose-200">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">Kalvium</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                AI Research Intern
              </span>
            </div>
            <p className="text-xs text-slate-500">45-Minute Lesson Creator & Dual QC Engine</p>
          </div>
        </div>

        {/* Center: Lesson Selector */}
        {lessons.length > 0 && (
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Saved Lessons:</span>
            <select
              value={activeLessonId || ''}
              onChange={(e) => onSelectLesson(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 max-w-xs truncate focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              {lessons.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.title} (v{l.instructorEdits?.version || 1})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Actions & Status */}
        <div className="flex items-center gap-3">
          {/* Storage Mode Badge */}
          <div 
            title={systemStatus?.database?.type === 'mongodb' ? 'Connected to MongoDB' : 'Using Local Persistent Storage (Zero Setup)'}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>{systemStatus?.database?.type === 'mongodb' ? 'MongoDB Active' : 'Persistent Storage'}</span>
          </div>

          {/* New Lesson Button */}
          <button
            onClick={onNewLesson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Lesson</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Configure AI API Keys & Preferences"
          >
            <SettingsIcon className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}
