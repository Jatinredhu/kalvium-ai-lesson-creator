import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LessonInputForm from './components/LessonInputForm';
import PipelineStepper from './components/PipelineStepper';
import ResearchSources from './components/ResearchSources';
import LessonEditor from './components/LessonEditor';
import QCAuditPanel from './components/QCAuditPanel';
import ExportModal from './components/ExportModal';
import SettingsModal from './components/SettingsModal';
import { 
  Download, 
  Layers, 
  BookOpen, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

export default function App() {
  const [lessons, setLessons] = useState([]);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'editor' | 'qc'

  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(null); // 'research' | 'generation' | 'qcLayer1' | 'qcLayer2' | 'pipeline'
  const [isSaving, setIsSaving] = useState(false);
  const [isApplyingQC, setIsApplyingQC] = useState(false);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [bannerError, setBannerError] = useState('');

  // Fetch initial lessons
  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const res = await fetch('/api/lessons');
      const data = await res.json();
      if (data.ok && Array.isArray(data.lessons)) {
        setLessons(data.lessons);
        if (data.lessons.length > 0 && !activeLessonId) {
          setActiveLessonId(data.lessons[0]._id);
        }
      }
    } catch (e) {
      console.warn('Lessons fetch warning:', e.message);
    }
  };

  const getSettings = () => {
    const provider = localStorage.getItem('lessoncraft_provider') || 'offline';
    const apiKey = localStorage.getItem('lessoncraft_api_key') || '';
    return { provider, apiKey };
  };

  const activeLesson = lessons.find((l) => String(l._id) === String(activeLessonId)) || null;

  // 1. Create Lesson
  const handleCreateLesson = async (formData) => {
    setIsCreating(true);
    setBannerError('');
    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to create lesson draft');

      const created = data.lesson;
      setLessons((prev) => [created, ...prev]);
      setActiveLessonId(created._id);

      // Immediately run the full automated pipeline
      await handleRunAll(created._id);
    } catch (err) {
      setBannerError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  // 2. Run Step (Supports Retrying Individual Steps)
  const handleRunStep = async (stepKey, targetId = null) => {
    const id = targetId || activeLessonId;
    if (!id) return;

    setLoadingStep(stepKey);
    setBannerError('');
    const { provider, apiKey } = getSettings();

    try {
      const endpoint = 
        stepKey === 'research' ? `/api/lessons/${id}/research` :
        stepKey === 'generation' ? `/api/lessons/${id}/generate` :
        stepKey === 'qcLayer1' ? `/api/lessons/${id}/qc1` :
        `/api/lessons/${id}/qc2`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || `Step ${stepKey} failed.`);

      updateLocalLesson(data.lesson);

      if (stepKey === 'generation') {
        setActiveTab('editor');
      } else if (stepKey === 'qcLayer1' || stepKey === 'qcLayer2') {
        setActiveTab('qc');
      }
    } catch (err) {
      setBannerError(err.message);
      await fetchLessons();
    } finally {
      setLoadingStep(null);
    }
  };

  // 3. Run Entire Pipeline (One-Click Orchestration)
  const handleRunAll = async (targetId = null) => {
    const id = targetId || activeLessonId;
    if (!id) return;

    setLoadingStep('pipeline');
    setBannerError('');
    const { provider, apiKey } = getSettings();

    try {
      const res = await fetch(`/api/lessons/${id}/pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Pipeline execution failed.');

      updateLocalLesson(data.lesson);
      setActiveTab('editor');
    } catch (err) {
      setBannerError(err.message);
      await fetchLessons();
    } finally {
      setLoadingStep(null);
    }
  };

  // 4. Save Instructor Edits
  const handleSaveLesson = async (saveData) => {
    if (!activeLessonId) return;
    setIsSaving(true);
    setBannerError('');
    try {
      const res = await fetch(`/api/lessons/${activeLessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData)
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to save instructor modifications');

      updateLocalLesson(data.lesson);
    } catch (err) {
      setBannerError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Apply QC Recommendation
  const handleApplyQC = async (layer, issueId) => {
    if (!activeLessonId) return;
    setIsApplyingQC(true);
    setBannerError('');
    try {
      const res = await fetch(`/api/lessons/${activeLessonId}/apply-qc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layer, issueId })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to apply QC recommendation');

      updateLocalLesson(data.lesson);
    } catch (err) {
      setBannerError(err.message);
    } finally {
      setIsApplyingQC(false);
    }
  };

  const updateLocalLesson = (updated) => {
    setLessons((prev) => prev.map((l) => (String(l._id) === String(updated._id) ? updated : l)));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-900">
      {/* Clean Navbar with subtle Settings gear */}
      <Navbar
        lessons={lessons}
        activeLessonId={activeLessonId}
        onSelectLesson={(id) => setActiveLessonId(id)}
        onNewLesson={() => setActiveLessonId(null)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Banner */}
        {bannerError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-800 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{bannerError}</span>
            </div>
            <button
              onClick={() => setBannerError('')}
              className="text-rose-500 hover:text-rose-700 font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {/* View 1: New Lesson Form */}
        {!activeLesson ? (
          <LessonInputForm
            onSubmit={handleCreateLesson}
            isCreating={isCreating || loadingStep === 'pipeline'}
          />
        ) : (
          <div className="space-y-6">
            {/* Active Lesson Header & Tab Navigation Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Active Lesson
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    ID: {String(activeLesson._id).slice(0, 8)}...
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{activeLesson.title}</h2>
                <p className="text-xs text-slate-500 line-clamp-1">{activeLesson.learningObjective}</p>
              </div>

              {/* Central Navigation Tabs & Export Trigger */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('pipeline')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                      activeTab === 'pipeline' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Pipeline & Sources</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('editor')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                      activeTab === 'editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-rose-600" />
                    <span>Lesson Studio</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('qc')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                      activeTab === 'qc' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>QC Reports (Dual Layers)</span>
                  </button>
                </div>

                {/* Export Action */}
                <button
                  onClick={() => setIsExportOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Pipeline Stepper */}
            <PipelineStepper
              lesson={activeLesson}
              onRunStep={handleRunStep}
              onRunAll={() => handleRunAll(activeLesson._id)}
              loadingStep={loadingStep}
            />

            {/* TAB 1: Pipeline & Research Sources */}
            {activeTab === 'pipeline' && (
              <ResearchSources researchData={activeLesson.researchData} />
            )}

            {/* TAB 2: Lesson Studio */}
            {activeTab === 'editor' && (
              <LessonEditor
                lesson={activeLesson}
                onSave={handleSaveLesson}
                isSaving={isSaving}
              />
            )}

            {/* TAB 3: Dual QC Layers */}
            {activeTab === 'qc' && (
              <QCAuditPanel
                lesson={activeLesson}
                onApplyQC={handleApplyQC}
                isApplying={isApplyingQC}
              />
            )}
          </div>
        )}
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        lessonId={activeLesson?._id}
        lessonTitle={activeLesson?.title}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
