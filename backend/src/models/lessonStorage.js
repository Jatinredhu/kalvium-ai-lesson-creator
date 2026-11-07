import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { getDbStatus } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../../data/lessons.json');

// Ensure data folder and file exist
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Mongoose Schema
const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  learningObjective: { type: String, required: true },
  targetAudience: { type: String, default: 'Undergraduate / Junior Developers' },
  durationMinutes: { type: Number, default: 45 },
  status: { 
    type: String, 
    enum: ['draft', 'researched', 'generated', 'qc_reviewed', 'published'], 
    default: 'draft' 
  },
  pipelineProgress: {
    research: { status: { type: String, default: 'pending' }, error: String },
    generation: { status: { type: String, default: 'pending' }, error: String },
    qcLayer1: { status: { type: String, default: 'pending' }, error: String },
    qcLayer2: { status: { type: String, default: 'pending' }, error: String },
  },
  researchData: {
    books: [
      {
        title: String,
        authors: [String],
        publishedYear: String,
        description: String,
        previewLink: String,
        source: String
      }
    ],
    webArticles: [
      {
        title: String,
        url: String,
        snippet: String,
        sourceName: String,
        reliability: String
      }
    ],
    youtubeVideos: [
      {
        title: String,
        url: String,
        videoId: String,
        channelName: String,
        duration: String,
        views: Number,
        thumbnail: String,
        relevanceNote: String
      }
    ]
  },
  content: {
    overview: String,
    timeline: [
      {
        timeRange: String, // e.g. "00:00 - 10:00 (10 mins)"
        title: String,
        concept: String,
        details: String,
        codeOrExample: String
      }
    ],
    markdownBody: String,
    practicalExercise: {
      title: String,
      instructions: String,
      starterCode: String,
      solutionCode: String
    },
    knowledgeCheck: [
      {
        question: String,
        options: [String],
        correctAnswerIndex: Number,
        explanation: String
      }
    ],
    supplementaryResources: [
      {
        title: String,
        type: { type: String, default: 'video' },
        url: String,
        note: String
      }
    ],
    references: [
      {
        title: String,
        type: String, // 'book', 'article', 'spec'
        url: String,
        citation: String
      }
    ]
  },
  qcReport1: {
    status: { type: String, default: 'pending' }, // 'passed', 'issues_found', 'pending'
    score: { type: Number, default: 0 }, // 0 to 100
    summary: String,
    lastAuditedAt: Date,
    issues: [
      {
        id: String,
        type: String, // 'factual_error', 'unsupported_claim', 'source_reliability', 'gap'
        severity: String, // 'high', 'medium', 'low'
        section: String,
        issue: String,
        recommendation: String,
        suggestedReplacement: String,
        status: { type: String, enum: ['pending', 'applied', 'dismissed'], default: 'pending' }
      }
    ]
  },
  qcReport2: {
    status: { type: String, default: 'pending' },
    score: { type: Number, default: 0 },
    summary: String,
    lastAuditedAt: Date,
    issues: [
      {
        id: String,
        type: String, // 'objective_alignment', 'clarity_structure', 'pacing_timing', 'practical_gap'
        severity: String,
        section: String,
        issue: String,
        recommendation: String,
        suggestedReplacement: String,
        status: { type: String, enum: ['pending', 'applied', 'dismissed'], default: 'pending' }
      }
    ]
  },
  instructorEdits: {
    notes: String,
    lastModifiedBy: String,
    version: { type: Number, default: 1 }
  }
}, { timestamps: true });

let MongooseLesson = null;
try {
  MongooseLesson = mongoose.model('Lesson', LessonSchema);
} catch (e) {
  MongooseLesson = mongoose.models.Lesson;
}

// File Storage Helpers
const readFromFile = () => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
};

const writeToFile = (lessons) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(lessons, null, 2), 'utf8');
};

// Unified Repository API
export const LessonStorage = {
  async create(data) {
    const { isMongoConnected } = getDbStatus();
    if (isMongoConnected && MongooseLesson) {
      const doc = new MongooseLesson(data);
      return await doc.save();
    } else {
      const lessons = readFromFile();
      const newLesson = {
        _id: crypto.randomUUID(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      lessons.unshift(newLesson);
      writeToFile(lessons);
      return newLesson;
    }
  },

  async findById(id) {
    const { isMongoConnected } = getDbStatus();
    if (isMongoConnected && MongooseLesson && mongoose.Types.ObjectId.isValid(id)) {
      const doc = await MongooseLesson.findById(id);
      if (doc) return doc;
    }
    const lessons = readFromFile();
    return lessons.find(l => String(l._id) === String(id)) || null;
  },

  async findAll() {
    const { isMongoConnected } = getDbStatus();
    if (isMongoConnected && MongooseLesson) {
      return await MongooseLesson.find().sort({ updatedAt: -1 });
    }
    const lessons = readFromFile();
    return lessons.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  async updateById(id, updateData) {
    const { isMongoConnected } = getDbStatus();
    if (isMongoConnected && MongooseLesson && mongoose.Types.ObjectId.isValid(id)) {
      const doc = await MongooseLesson.findByIdAndUpdate(
        id, 
        { ...updateData, updatedAt: new Date() }, 
        { new: true }
      );
      if (doc) return doc;
    }
    const lessons = readFromFile();
    const index = lessons.findIndex(l => String(l._id) === String(id));
    if (index === -1) return null;
    lessons[index] = {
      ...lessons[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    writeToFile(lessons);
    return lessons[index];
  },

  async deleteById(id) {
    const { isMongoConnected } = getDbStatus();
    if (isMongoConnected && MongooseLesson && mongoose.Types.ObjectId.isValid(id)) {
      await MongooseLesson.findByIdAndDelete(id);
      return true;
    }
    const lessons = readFromFile();
    const filtered = lessons.filter(l => String(l._id) !== String(id));
    writeToFile(filtered);
    return true;
  }
};
