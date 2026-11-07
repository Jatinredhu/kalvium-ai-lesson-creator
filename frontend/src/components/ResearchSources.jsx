import React, { useState } from 'react';
import { Book, Globe, Youtube, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ResearchSources({ researchData }) {
  const [activeTab, setActiveTab] = useState('all');

  const books = researchData?.books || [];
  const web = researchData?.webArticles || [];
  const videos = researchData?.youtubeVideos || [];

  const totalCount = books.length + web.length + videos.length;

  if (totalCount === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <p className="text-sm text-slate-500">
          No research sources loaded yet. Click <strong>Run Step 1</strong> or <strong>Run Complete Pipeline</strong> to fetch books, web documentation, and YouTube videos.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header & Tabs */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Automated Research Repository</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              {totalCount} Sources
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated multi-source research from Google Books, OpenLibrary, Web standards & YouTube.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'books' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Book className="w-3.5 h-3.5 text-blue-600" />
            <span>Books ({books.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('web')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'web' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>Web ({web.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'videos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Youtube className="w-3.5 h-3.5 text-rose-600" />
            <span>YouTube ({videos.length})</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Books Section */}
        {(activeTab === 'all' || activeTab === 'books') && books.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Book className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Books & Academic Treatises</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {books.map((b, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-sm font-bold text-slate-900 leading-snug">{b.title}</h5>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                        {b.source}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      By {b.authors?.join(', ')} &bull; {b.publishedYear}
                    </p>
                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                  {b.previewLink && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-end">
                      <a
                        href={b.previewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        <span>View Publication</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Web Articles Section */}
        {(activeTab === 'all' || activeTab === 'web') && web.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Standards & Technical Documentation</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {web.map((w, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-sm font-bold text-slate-900 leading-snug">{w.title}</h5>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700 font-medium mt-0.5">{w.sourceName}</p>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {w.snippet}
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-end">
                    <a
                      href={w.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                    >
                      <span>Read Documentation</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* YouTube Section */}
        {(activeTab === 'all' || activeTab === 'videos') && videos.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Youtube className="w-4 h-4 text-rose-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Supplementary Educational Videos</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((v, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div>
                    {v.thumbnail && (
                      <div className="relative rounded-lg overflow-hidden mb-3 aspect-video bg-slate-900 group">
                        <img 
                          src={v.thumbnail} 
                          alt={v.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {v.duration}
                        </span>
                      </div>
                    )}
                    <h5 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">{v.title}</h5>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {v.channelName} {v.views ? `• ${(v.views / 1000).toFixed(0)}k views` : ''}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-2 bg-white/80 p-2 rounded-lg border border-slate-100">
                      <strong>Focus:</strong> {v.relevanceNote}
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-end">
                    <a
                      href={v.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800"
                    >
                      <span>Watch Tutorial</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
