import express from 'express';
import { LessonStorage } from '../models/lessonStorage.js';
import { researchSources } from '../services/researchService.js';
import { generateLessonContent } from '../services/lessonService.js';
import { runQCLayer1 } from '../services/qcLayer1Service.js';
import { runQCLayer2 } from '../services/qcLayer2Service.js';
import { getDbStatus } from '../config/db.js';

const router = express.Router();

// System status
router.get('/system/status', (req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    ok: true,
    database: dbStatus,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
    hasGroqKey: Boolean(process.env.GROQ_API_KEY)
  });
});

// List all lessons
router.get('/lessons', async (req, res) => {
  try {
    const lessons = await LessonStorage.findAll();
    res.json({ ok: true, lessons });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get single lesson
router.get('/lessons/:id', async (req, res) => {
  try {
    const lesson = await LessonStorage.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ ok: false, error: 'Lesson not found' });
    }
    res.json({ ok: true, lesson });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 1. Create a draft lesson (Validation for empty inputs)
router.post('/lessons', async (req, res) => {
  try {
    const { title, learningObjective, targetAudience, durationMinutes } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ ok: false, error: 'Lesson Title is required and cannot be empty.' });
    }
    if (!learningObjective || !learningObjective.trim()) {
      return res.status(400).json({ ok: false, error: 'Learning Objective is required and cannot be empty.' });
    }

    const lesson = await LessonStorage.create({
      title: title.trim(),
      learningObjective: learningObjective.trim(),
      targetAudience: targetAudience || 'Undergraduate / Junior Developers',
      durationMinutes: durationMinutes || 45,
      status: 'draft',
      pipelineProgress: {
        research: { status: 'idle' },
        generation: { status: 'idle' },
        qcLayer1: { status: 'idle' },
        qcLayer2: { status: 'idle' }
      }
    });

    res.status(201).json({ ok: true, lesson });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 2. Step: Research Sources (Books, Web, YouTube) - Allows retry
router.post('/lessons/:id/research', async (req, res) => {
  try {
    const lesson = await LessonStorage.findById(req.params.id);
    if (!lesson) return res.status(404).json({ ok: false, error: 'Lesson not found' });

    // Mark research running
    await LessonStorage.updateById(lesson._id, {
      'pipelineProgress.research': { status: 'in_progress' }
    });

    try {
      const researchData = await researchSources(lesson.title, lesson.learningObjective);
      const updated = await LessonStorage.updateById(lesson._id, {
        researchData,
        status: 'researched',
        'pipelineProgress.research': { status: 'completed' }
      });
      res.json({ ok: true, lesson: updated });
    } catch (researchErr) {
      await LessonStorage.updateById(lesson._id, {
        'pipelineProgress.research': { status: 'failed', error: researchErr.message }
      });
      res.status(502).json({ ok: false, error: `Research failed: ${researchErr.message}. You can retry this step.` });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 3. Step: Generate Structured 45-Minute Lesson Content - Allows retry
router.post('/lessons/:id/generate', async (req, res) => {
  try {
    const { apiKey, provider } = req.body || {};
    const lesson = await LessonStorage.findById(req.params.id);
    if (!lesson) return res.status(404).json({ ok: false, error: 'Lesson not found' });

    // Ensure research is present, otherwise run research first
    let researchData = lesson.researchData;
    if (!researchData || (!researchData.books?.length && !researchData.webArticles?.length)) {
      researchData = await researchSources(lesson.title, lesson.learningObjective);
      await LessonStorage.updateById(lesson._id, { researchData });
    }

    await LessonStorage.updateById(lesson._id, {
      'pipelineProgress.generation': { status: 'in_progress' }
    });

    try {
      const content = await generateLessonContent({
        title: lesson.title,
        learningObjective: lesson.learningObjective,
        researchData,
        apiKey,
        provider
      });

      const updated = await LessonStorage.updateById(lesson._id, {
        content,
        status: 'generated',
        'pipelineProgress.generation': { status: 'completed' }
      });
      res.json({ ok: true, lesson: updated });
    } catch (genErr) {
      await LessonStorage.updateById(lesson._id, {
        'pipelineProgress.generation': { status: 'failed', error: genErr.message }
      });
      res.status(502).json({ ok: false, error: `Lesson generation failed: ${genErr.message}. You can retry this step.` });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 4. Step: Run QC Layer 1 (Factual Accuracy & Sources) - Allows retry
router.post('/lessons/:id/qc1', async (req, res) => {
  try {
    const { apiKey, provider } = req.body || {};
    const lesson = await LessonStorage.findById(req.params.id);
    if (!lesson) return res.status(404).json({ ok: false, error: 'Lesson not found' });

    await LessonStorage.updateById(lesson._id, {
      'pipelineProgress.qcLayer1': { status: 'in_progress' }
    });

    try {
      const qcReport1 = await runQCLayer1({ lesson, apiKey, provider });
      const updated = await LessonStorage.updateById(lesson._id, {
        qcReport1,
        'pipelineProgress.qcLayer1': { status: 'completed' }
      });
      res.json({ ok: true, lesson: updated });
    } catch (qc1Err) {
      await LessonStorage.updateById(lesson._id, {
        'pipelineProgress.qcLayer1': { status: 'failed', error: qc1Err.message }
      });
      res.status(502).json({ ok: false, error: `QC Layer 1 failed: ${qc1Err.message}. You can retry this step.` });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 5. Step: Run QC Layer 2 (Instructional Quality) - Allows retry
router.post('/lessons/:id/qc2', async (req, res) => {
  try {
    const { apiKey, provider } = req.body || {};
    const lesson = await LessonStorage.findById(req.params.id);
    if (!lesson) return res.status(404).json({ ok: false, error: 'Lesson not found' });

    await LessonStorage.updateById(lesson._id, {
      'pipelineProgress.qcLayer2': { status: 'in_progress' }
    });

    try {
      const qcReport2 = await runQCLayer2({ lesson, apiKey, provider });
      const updated = await LessonStorage.updateById(lesson._id, {
        qcReport2,
        status: 'qc_reviewed',
        'pipelineProgress.qcLayer2': { status: 'completed' }
      });
      res.json({ ok: true, lesson: updated });
    } catch (qc2Err) {
      await LessonStorage.updateById(lesson._id, {
        'pipelineProgress.qcLayer2': { status: 'failed', error: qc2Err.message }
      });
      res.status(502).json({ ok: false, error: `QC Layer 2 failed: ${qc2Err.message}. You can retry this step.` });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 6. Complete One-Click Orchestration Pipeline (Research -> Generate -> QC1 -> QC2)
router.post('/lessons/:id/pipeline', async (req, res) => {
  try {
    const { apiKey, provider } = req.body || {};
    let lesson = await LessonStorage.findById(req.params.id);
    if (!lesson) return res.status(404).json({ ok: false, error: 'Lesson not found' });

    // Step 1: Research
    const researchData = await researchSources(lesson.title, lesson.learningObjective);
    lesson = await LessonStorage.updateById(lesson._id, {
      researchData,
      'pipelineProgress.research': { status: 'completed' }
    });

    // Step 2: Generate Content
    const content = await generateLessonContent({
      title: lesson.title,
      learningObjective: lesson.learningObjective,
      researchData,
      apiKey,
      provider
    });
    lesson = await LessonStorage.updateById(lesson._id, {
      content,
      'pipelineProgress.generation': { status: 'completed' }
    });

    // Step 3: Run QC Layer 1
    const qcReport1 = await runQCLayer1({ lesson, apiKey, provider });
    lesson = await LessonStorage.updateById(lesson._id, {
      qcReport1,
      'pipelineProgress.qcLayer1': { status: 'completed' }
    });

    // Step 4: Run QC Layer 2
    const qcReport2 = await runQCLayer2({ lesson, apiKey, provider });
    lesson = await LessonStorage.updateById(lesson._id, {
      qcReport2,
      status: 'qc_reviewed',
      'pipelineProgress.qcLayer2': { status: 'completed' }
    });

    res.json({ ok: true, lesson });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 7. Save Instructor Edits (Preserves previously saved work)
router.put('/lessons/:id', async (req, res) => {
  try {
    const { title, learningObjective, content, instructorNotes } = req.body;
    const lesson = await LessonStorage.findById(req.params.id);
    if (!lesson) return res.status(404).json({ ok: false, error: 'Lesson not found' });

    const currentVersion = lesson.instructorEdits?.version || 1;
    const updated = await LessonStorage.updateById(lesson._id, {
      ...(title ? { title: title.trim() } : {}),
      ...(learningObjective ? { learningObjective: learningObjective.trim() } : {}),
      ...(content ? { content } : {}),
      instructorEdits: {
        notes: instructorNotes || lesson.instructorEdits?.notes || '',
        lastModifiedBy: 'Instructor',
        version: currentVersion + 1
      }
    });

    res.json({ ok: true, lesson: updated, message: 'Instructor modifications saved successfully.' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 8. Apply QC Recommendation into Lesson Content
router.post('/lessons/:id/apply-qc', async (req, res) => {
  try {
    const { layer, issueId } = req.body; // layer: 'qc1' or 'qc2'
    const lesson = await LessonStorage.findById(req.params.id);
    if (!lesson) return res.status(404).json({ ok: false, error: 'Lesson not found' });

    const reportKey = layer === 'qc1' ? 'qcReport1' : 'qcReport2';
    const report = lesson[reportKey];
    if (!report || !report.issues) {
      return res.status(400).json({ ok: false, error: 'Report not available' });
    }

    const issueIndex = report.issues.findIndex(i => String(i.id) === String(issueId));
    if (issueIndex === -1) {
      return res.status(404).json({ ok: false, error: 'Issue not found in report' });
    }

    const issue = report.issues[issueIndex];
    let updatedMarkdown = lesson.content?.markdownBody || '';

    // If there is a suggested replacement or enhancement, inject or append it cleanly
    if (issue.suggestedReplacement) {
      if (!updatedMarkdown.includes(issue.suggestedReplacement)) {
        updatedMarkdown += `\n\n### Applied QC Enhancement (${issue.section || 'General'})\n${issue.suggestedReplacement}\n`;
      }
    }

    // Mark issue as applied
    report.issues[issueIndex].status = 'applied';

    const updated = await LessonStorage.updateById(lesson._id, {
      [reportKey]: report,
      content: {
        ...lesson.content,
        markdownBody: updatedMarkdown
      }
    });

    res.json({ ok: true, lesson: updated, message: `Recommendation from ${layer.toUpperCase()} successfully applied.` });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 9. Export Lesson in Markdown, HTML, or full JSON bundle
router.get('/lessons/:id/export', async (req, res) => {
  try {
    const { format = 'markdown' } = req.query;
    const lesson = await LessonStorage.findById(req.params.id);
    if (!lesson) return res.status(404).json({ ok: false, error: 'Lesson not found' });

    const safeTitle = lesson.title.replace(/[^a-zA-Z0-9_-]/g, '_');

    if (format === 'json') {
      res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}_full_lesson_bundle.json"`);
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(lesson, null, 2));
    }

    if (format === 'html') {
      const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${lesson.title} - Kalvium Lesson</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 900px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    h1, h2, h3 { color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    pre { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; }
    th { background: #f1f5f9; }
    .badge { display: inline-block; padding: 4px 10px; background: #e0f2fe; color: #0369a1; border-radius: 9999px; font-weight: 600; font-size: 12px; }
    .qc-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0; }
  </style>
</head>
<body>
  <span class="badge">45-Minute Lesson Plan</span>
  <h1>${lesson.title}</h1>
  <p><strong>Primary Learning Objective:</strong> ${lesson.learningObjective}</p>
  <div class="qc-box">
    <h3>Quality Control Validation Status</h3>
    <p><strong>QC Layer 1 (Factual Accuracy):</strong> Score: ${lesson.qcReport1?.score || 'N/A'}/100 (${lesson.qcReport1?.status || 'Passed'})</p>
    <p><strong>QC Layer 2 (Instructional Quality):</strong> Score: ${lesson.qcReport2?.score || 'N/A'}/100 (${lesson.qcReport2?.status || 'Passed'})</p>
  </div>
  <hr/>
  <div class="content">
    <pre>${lesson.content?.markdownBody || 'No markdown body.'}</pre>
  </div>
</body>
</html>`;
      res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}_lesson.html"`);
      res.setHeader('Content-Type', 'text/html');
      return res.send(htmlDoc);
    }

    // Default: Markdown export
    const fullMarkdownExport = `# ${lesson.title}
*Kalvium AI Research Lesson Plan (45 Minutes)*

> **Learning Objective:** ${lesson.learningObjective}  
> **Target Audience:** ${lesson.targetAudience}  
> **QC Layer 1 (Factual Accuracy):** Score ${lesson.qcReport1?.score || 0}/100 (${lesson.qcReport1?.status || 'Pending'})  
> **QC Layer 2 (Instructional Quality):** Score ${lesson.qcReport2?.score || 0}/100 (${lesson.qcReport2?.status || 'Pending'})  

---

${lesson.content?.markdownBody || ''}

---
### Quality Control Audit Records

#### QC Layer 1: Research & Factual Accuracy Audit
- **Status:** ${lesson.qcReport1?.status || 'N/A'}
- **Score:** ${lesson.qcReport1?.score || 'N/A'}/100
- **Summary:** ${lesson.qcReport1?.summary || 'N/A'}
- **Audited Issues:**
${(lesson.qcReport1?.issues || []).map((iss, i) => `  ${i + 1}. [${iss.severity.toUpperCase()}] **${iss.section}**: ${iss.issue}\n     *Recommendation:* ${iss.recommendation}\n     *Status:* ${iss.status}`).join('\n')}

#### QC Layer 2: Instructional Quality Audit
- **Status:** ${lesson.qcReport2?.status || 'N/A'}
- **Score:** ${lesson.qcReport2?.score || 'N/A'}/100
- **Summary:** ${lesson.qcReport2?.summary || 'N/A'}
- **Audited Issues:**
${(lesson.qcReport2?.issues || []).map((iss, i) => `  ${i + 1}. [${iss.severity.toUpperCase()}] **${iss.section}**: ${iss.issue}\n     *Recommendation:* ${iss.recommendation}\n     *Status:* ${iss.status}`).join('\n')}
`;

    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}_lesson.md"`);
    res.setHeader('Content-Type', 'text/markdown');
    res.send(fullMarkdownExport);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Delete lesson
router.delete('/lessons/:id', async (req, res) => {
  try {
    await LessonStorage.deleteById(req.params.id);
    res.json({ ok: true, message: 'Lesson deleted successfully.' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
