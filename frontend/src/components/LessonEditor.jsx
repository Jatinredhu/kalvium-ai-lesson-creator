import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Save, 
  Eye, 
  Edit3, 
  Columns, 
  Clock, 
  Code, 
  HelpCircle, 
  CheckCircle2, 
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function LessonEditor({ lesson, onSave, isSaving }) {
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'edit' | 'preview'
  const [activeTab, setActiveTab] = useState('markdown'); // 'markdown' | 'timeline' | 'exercise' | 'quiz'

  // Editable local state
  const [title, setTitle] = useState(lesson?.title || '');
  const [learningObjective, setLearningObjective] = useState(lesson?.learningObjective || '');
  const [markdownBody, setMarkdownBody] = useState(lesson?.content?.markdownBody || '');
  const [instructorNotes, setInstructorNotes] = useState(lesson?.instructorEdits?.notes || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when active lesson changes
  useEffect(() => {
    setTitle(lesson?.title || '');
    setLearningObjective(lesson?.learningObjective || '');
    setMarkdownBody(lesson?.content?.markdownBody || '');
    setInstructorNotes(lesson?.instructorEdits?.notes || '');
    setSaveSuccess(false);
  }, [lesson?._id, lesson?.instructorEdits?.version, lesson?.content?.markdownBody]);

  const handleSave = async () => {
    await onSave({
      title,
      learningObjective,
      content: {
        ...(lesson?.content || {}),
        markdownBody
      },
      instructorNotes
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const timeline = lesson?.content?.timeline || [];
  const exercise = lesson?.content?.practicalExercise;
  const quiz = lesson?.content?.knowledgeCheck || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Top Toolbar */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Instructor Review & Live Studio
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              Revision v{lesson?.instructorEdits?.version || 1}
            </span>
            {saveSuccess && (
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Refine content, apply QC findings, inspect 45-minute lesson pacing, and test coding exercises.
          </p>
        </div>

        {/* View Switchers & Save */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Subtabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab('markdown')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'markdown' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Lesson Body
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'timeline' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              45-Min Pacing
            </button>
            <button
              onClick={() => setActiveTab('exercise')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'exercise' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Lab Code
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'quiz' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Quizzes ({quiz.length})
            </button>
          </div>

          {/* View Modes for Markdown */}
          {activeTab === 'markdown' && (
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs">
              <button
                onClick={() => setViewMode('edit')}
                className={`p-1.5 rounded-lg ${viewMode === 'edit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                title="Editor Only"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`p-1.5 rounded-lg ${viewMode === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                title="Split Editor & Preview"
              >
                <Columns className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`p-1.5 rounded-lg ${viewMode === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                title="Preview Only"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Edits'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        {/* Title and Objective Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Lesson Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Target Learning Objective
            </label>
            <input
              type="text"
              value={learningObjective}
              onChange={(e) => setLearningObjective(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
        </div>

        {/* TAB 1: Markdown Body */}
        {activeTab === 'markdown' && (
          <div className="space-y-4">
            <div className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Editor Pane */}
              {(viewMode === 'edit' || viewMode === 'split') && (
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Markdown Source Editor
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {markdownBody.length} chars
                    </span>
                  </div>
                  <textarea
                    rows={26}
                    value={markdownBody}
                    onChange={(e) => setMarkdownBody(e.target.value)}
                    className="w-full p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/30 leading-relaxed resize-y"
                    placeholder="# Lesson content..."
                  />
                </div>
              )}

              {/* Preview Pane */}
              {(viewMode === 'preview' || viewMode === 'split') && (
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Live Formatted Preview
                    </span>
                    <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      Instructor View
                    </span>
                  </div>
                  <div className="w-full h-[520px] p-6 bg-slate-50 border border-slate-200 rounded-xl overflow-y-auto prose prose-slate max-w-none text-xs leading-relaxed">
                    <ReactMarkdown>{markdownBody}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: 45-Minute Timeline Pacing */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>45-Minute Lesson Pacing Blueprint:</strong> Designed for high student engagement with balanced cognitive intervals.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timeline.map((block, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        {block.timeRange}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Phase {idx + 1}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{block.title}</h4>
                    <p className="text-xs text-rose-600 font-medium mt-0.5">{block.concept}</p>
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{block.details}</p>
                  </div>
                  {block.codeOrExample && (
                    <div className="mt-4 pt-3 border-t border-slate-200">
                      <pre className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto">
                        {block.codeOrExample}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Hands-on Lab Code */}
        {activeTab === 'exercise' && (
          <div className="space-y-6">
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
              <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-600" />
                <span>{exercise?.title || 'Interactive Lab Challenge'}</span>
              </h4>
              <p className="text-xs text-indigo-800 mt-1">{exercise?.instructions}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Student Starter Code
                </span>
                <pre className="p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl overflow-x-auto h-80 border border-slate-800">
                  {exercise?.starterCode || '// No starter code'}
                </pre>
              </div>

              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Instructor Reference Solution
                </span>
                <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto h-80 border border-slate-800">
                  {exercise?.solutionCode || '// No solution code'}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Knowledge Checks */}
        {activeTab === 'quiz' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900">
              <HelpCircle className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                <strong>Formative Knowledge Checks:</strong> Interactive concept verification questions presented during Phase 4.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quiz.map((q, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Question {idx + 1}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Single Choice
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{q.question}</h4>

                  <div className="mt-3 space-y-1.5">
                    {q.options?.map((opt, oIdx) => {
                      const isCorrect = oIdx === q.correctAnswerIndex;
                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-lg text-xs font-medium border flex items-center justify-between ${
                            isCorrect 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' 
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{opt}</span>
                          {isCorrect && (
                            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                              Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mt-3 p-2.5 bg-slate-100 rounded-lg text-[11px] text-slate-600 leading-relaxed border border-slate-200">
                      <strong>Pedagogical Rationale:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
