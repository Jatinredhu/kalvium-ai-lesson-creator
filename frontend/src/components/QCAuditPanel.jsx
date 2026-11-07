import React, { useState } from 'react';
import { 
  ShieldCheck, 
  GraduationCap, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  PlusCircle, 
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';

export default function QCAuditPanel({ 
  lesson, 
  onApplyQC, 
  isApplying 
}) {
  const [activeLayer, setActiveLayer] = useState('qc1'); // 'qc1' | 'qc2'

  const qc1 = lesson?.qcReport1;
  const qc2 = lesson?.qcReport2;

  const currentReport = activeLayer === 'qc1' ? qc1 : qc2;
  const isQc1 = activeLayer === 'qc1';

  if (!qc1?.issues && !qc2?.issues) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
        <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-800">No Quality Control Audits Executed Yet</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Execute <strong>Step 3 (QC Layer 1: Factual Accuracy)</strong> and <strong>Step 4 (QC Layer 2: Instructional Quality)</strong> to generate independent audit reports.
        </p>
      </div>
    );
  }

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'high':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">High Severity</span>;
      case 'medium':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Medium Severity</span>;
      default:
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">Low Severity</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header & Layer Switcher */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Dual Quality Control (QC) Audit Center
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Independent Validation</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Two isolated validation layers verifying factual correctness, source authority, objective alignment, and instructional quality.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveLayer('qc1')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isQc1 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>QC 1: Factual Accuracy ({qc1?.issues?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveLayer('qc2')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              !isQc1 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
            <span>QC 2: Instructional Quality ({qc2?.issues?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Layer Content */}
      <div className="p-6 space-y-6">
        {/* Layer Summary Box */}
        <div className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isQc1 ? 'bg-blue-50/60 border-blue-200' : 'bg-purple-50/60 border-purple-200'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {isQc1 ? 'QC Layer 1: Research & Factual Accuracy Audit' : 'QC Layer 2: Instructional Design & Pacing Audit'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                currentReport?.status === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {currentReport?.status?.toUpperCase() || 'REVIEW COMPLETE'}
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              {currentReport?.summary || 'Audit evaluation completed.'}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <div className="text-right">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Audit Score</span>
              <span className="text-2xl font-black text-slate-900">{currentReport?.score || 90}</span>
              <span className="text-xs text-slate-500 font-semibold">/100</span>
            </div>
          </div>
        </div>

        {/* Audit Issues List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Audit Findings & Actionable Recommendations ({currentReport?.issues?.length || 0})
            </h4>
            <span className="text-[11px] text-slate-400">
              Click "Apply Recommendation" to merge enhancements directly into the lesson.
            </span>
          </div>

          {(!currentReport?.issues || currentReport.issues.length === 0) ? (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
              No issues detected. Content complies with standard pedagogical thresholds.
            </div>
          ) : (
            <div className="space-y-3.5">
              {currentReport.issues.map((iss) => {
                const isApplied = iss.status === 'applied';

                return (
                  <div
                    key={iss.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isApplied 
                        ? 'bg-emerald-50/50 border-emerald-200 opacity-90' 
                        : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(iss.severity)}
                        <span className="text-xs font-bold text-slate-900">{iss.section || 'General'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">[{iss.type}]</span>
                      </div>

                      {isApplied && (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 self-start sm:self-auto">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Applied to Lesson</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      <strong>Issue:</strong> {iss.issue}
                    </p>

                    <div className="mt-2.5 p-3 bg-white rounded-lg border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                      <strong className="text-rose-600 flex items-center gap-1 mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Recommended Improvement:</span>
                      </strong>
                      <p>{iss.recommendation}</p>

                      {iss.suggestedReplacement && (
                        <div className="mt-2 pt-2 border-t border-slate-100 font-mono text-[11px] text-slate-800 bg-slate-50 p-2 rounded">
                          {iss.suggestedReplacement}
                        </div>
                      )}
                    </div>

                    {!isApplied && (
                      <div className="mt-3 flex items-center justify-end">
                        <button
                          onClick={() => onApplyQC(activeLayer, iss.id)}
                          disabled={isApplying}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Apply Recommendation to Lesson</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
