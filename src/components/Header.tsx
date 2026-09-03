import React from 'react';
import {
  FileText,
  Edit3,
  Eye,
  CheckSquare,
  FolderOpen,
  Plus,
  Sparkles,
  Printer,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { MeetingMinutes } from '../types/minutes';

interface HeaderProps {
  currentMom: MeetingMinutes;
  activeView: 'editor' | 'preview' | 'actions' | 'archive';
  onViewChange: (view: 'editor' | 'preview' | 'actions' | 'archive') => void;
  onNewMeeting: () => void;
  onLoadSample: () => void;
  onOpenAI: () => void;
  onPrint: () => void;
  onExportWord: () => void;
  actionCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMom,
  activeView,
  onViewChange,
  onNewMeeting,
  onLoadSample,
  onOpenAI,
  onPrint,
  onExportWord,
  actionCount,
}) => {
  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-40 shadow-sm print:hidden">
      {/* Top Banner: Standard Identifier */}
      <div className="bg-slate-950 px-4 py-1 text-xs text-slate-400 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium text-slate-300">Institutional Standard MoM System</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 rounded text-[11px]">
            Uniform Format Enforced
          </span>
          <span className="text-slate-400 hidden sm:inline text-[11px]">
            All meetings follow the enclosed statutory format
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onLoadSample}
            className="text-[11px] text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors cursor-pointer"
            title="Load Godavari Pushkaralu-2027 Sample"
          >
            Load Enclosed MoM Sample
          </button>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400 text-[11px]">Doc Ref: {currentMom.fileNumber || 'STANDARD-MOM'}</span>
        </div>
      </div>

      {/* Main Navigation & View Switcher */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Meeting Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-semibold shadow-inner">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-semibold text-slate-100 tracking-tight leading-tight">
                Meeting Minutes CMS
              </h1>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                  currentMom.status === 'APPROVED'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : currentMom.status === 'UNDER_REVIEW'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {currentMom.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[280px] sm:max-w-md">
              {currentMom.meetingTitle || 'Untitled Meeting'}
            </p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-lg border border-slate-700/70 text-xs">
          <button
            id="nav-tab-editor"
            onClick={() => onViewChange('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeView === 'editor'
                ? 'bg-slate-900 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Field Entry CMS</span>
          </button>

          <button
            id="nav-tab-preview"
            onClick={() => onViewChange('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeView === 'preview'
                ? 'bg-slate-900 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Standard Document View</span>
          </button>

          <button
            id="nav-tab-actions"
            onClick={() => onViewChange('actions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer relative ${
              activeView === 'actions'
                ? 'bg-slate-900 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Action Tracker</span>
            {actionCount > 0 && (
              <span className="bg-emerald-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                {actionCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-archive"
            onClick={() => onViewChange('archive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeView === 'archive'
                ? 'bg-slate-900 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Archive</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-ai-assist"
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 text-xs font-medium transition-colors cursor-pointer"
            title="Parse raw notes with AI into the uniform format"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">AI Format Assistant</span>
          </button>

          <button
            id="btn-new-meeting"
            onClick={onNewMeeting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">New Meeting</span>
          </button>

          <div className="h-5 w-px bg-slate-700 mx-1 hidden sm:block" />

          <button
            id="btn-print-doc"
            onClick={onPrint}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            title="Print / Export PDF in standard layout"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            id="btn-export-word"
            onClick={onExportWord}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            title="Download as Word document (.doc)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
