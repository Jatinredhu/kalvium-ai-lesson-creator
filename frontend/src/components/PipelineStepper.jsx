import React from 'react';
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  GraduationCap, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  PlayCircle 
} from 'lucide-react';

export default function PipelineStepper({ 
  lesson, 
  onRunStep, 
  onRunAll, 
  loadingStep 
}) {
  const progress = lesson?.pipelineProgress || {};

  const steps = [
    {
      key: 'research',
      title: '1. Multi-Source Research',
      subtitle: 'Google Books, OpenLibrary, MDN/Web & YouTube',
      icon: Search,
      state: progress.research?.status || (lesson?.researchData?.books?.length ? 'completed' : 'idle'),
      error: progress.research?.error
    },
    {
      key: 'generation',
      title: '2. 45-Min Lesson Synthesis',
      subtitle: 'Timeline, Markdown, Hands-on Lab & Quizzes',
      icon: Sparkles,
      state: progress.generation?.status || (lesson?.content?.markdownBody ? 'completed' : 'idle'),
      error: progress.generation?.error
    },
    {
      key: 'qcLayer1',
      title: '3. QC Layer 1: Factual Accuracy',
      subtitle: 'Verify correctness, source reliability & gaps',
      icon: ShieldCheck,
      state: progress.qcLayer1?.status || (lesson?.qcReport1?.status && lesson?.qcReport1?.status !== 'pending' ? 'completed' : 'idle'),
      error: progress.qcLayer1?.error
    },
    {
      key: 'qcLayer2',
      title: '4. QC Layer 2: Instructional Quality',
      subtitle: 'Objective alignment, 45m pacing & clarity',
      icon: GraduationCap,
      state: progress.qcLayer2?.status || (lesson?.qcReport2?.status && lesson?.qcReport2?.status !== 'pending' ? 'completed' : 'idle'),
      error: progress.qcLayer2?.error
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Workflow Execution Pipeline</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {lesson?.status?.toUpperCase()}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Execute steps sequentially, or re-run any individual step if adjustments or retries are needed.
          </p>
        </div>

        <button
          onClick={onRunAll}
          disabled={Boolean(loadingStep)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
        >
          {loadingStep === 'pipeline' ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Orchestrating Pipeline...</span>
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4 text-rose-400" />
              <span>Run Complete Pipeline (One-Click)</span>
            </>
          )}
        </button>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((s, index) => {
          const StepIcon = s.icon;
          const isLoading = loadingStep === s.key || loadingStep === 'pipeline';
          const isCompleted = s.state === 'completed';
          const isFailed = s.state === 'failed';

          return (
            <div
              key={s.key}
              className={`relative rounded-xl border p-4 flex flex-col justify-between transition-all ${
                isCompleted 
                  ? 'bg-emerald-50/40 border-emerald-200' 
                  : isFailed 
                  ? 'bg-rose-50/50 border-rose-200' 
                  : isLoading
                  ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/20'
                  : 'bg-slate-50/60 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : isFailed 
                      ? 'bg-rose-100 text-rose-700' 
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}>
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isFailed ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>

                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    isCompleted 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : isFailed 
                      ? 'bg-rose-100 text-rose-700' 
                      : isLoading
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isLoading ? 'Running' : s.state}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900">{s.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{s.subtitle}</p>

                {isFailed && s.error && (
                  <p className="mt-2 text-[11px] text-rose-600 bg-rose-100/60 p-2 rounded-lg font-mono">
                    {s.error}
                  </p>
                )}
              </div>

              {/* Step Action / Retry Button */}
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Step {index + 1} of 4</span>
                <button
                  onClick={() => onRunStep(s.key)}
                  disabled={Boolean(loadingStep)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    isFailed 
                      ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                      : isCompleted 
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' 
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                  }`}
                  title={isFailed ? 'Retry this failed step' : isCompleted ? 'Re-run step' : 'Execute step'}
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isFailed ? 'Retry Step' : isCompleted ? 'Re-run' : 'Run'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
