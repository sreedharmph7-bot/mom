import React, { useState } from 'react';
import {
  Folder,
  Plus,
  Trash2,
  Copy,
  Calendar,
  CheckCircle2,
  FileText,
  Search,
  ArrowRight,
  Upload,
  Download,
  ShieldAlert,
} from 'lucide-react';
import { MeetingMinutes } from '../types/minutes';

interface MeetingArchiveModalProps {
  minutesList: MeetingMinutes[];
  currentMomId: string;
  onSelectMeeting: (id: string) => void;
  onNewMeeting: () => void;
  onDuplicateMeeting: (mom: MeetingMinutes) => void;
  onDeleteMeeting: (id: string) => void;
  onImportJSON: (imported: MeetingMinutes) => void;
}

export const MeetingArchiveModal: React.FC<MeetingArchiveModalProps> = ({
  minutesList,
  currentMomId,
  onSelectMeeting,
  onNewMeeting,
  onDuplicateMeeting,
  onDeleteMeeting,
  onImportJSON,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = minutesList.filter((m) => {
    const matchesSearch =
      m.meetingTitle.toLowerCase().includes(search.toLowerCase()) ||
      m.department.toLowerCase().includes(search.toLowerCase()) ||
      m.reviewedBy.toLowerCase().includes(search.toLowerCase()) ||
      (m.fileNumber && m.fileNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = filterStatus === 'ALL' || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.meetingTitle && json.itemsDiscussed) {
          const imported: MeetingMinutes = {
            ...json,
            id: `mom-imported-${Date.now()}`,
          };
          onImportJSON(imported);
        } else {
          alert('Invalid file format. Please upload a valid MoM JSON export.');
        }
      } catch (err) {
        alert('Failed to read JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-200">
              <Folder className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Institutional Minutes Archive & Repository
              </h2>
              <p className="text-xs text-slate-500">
                All records stored strictly in the uniform standard format.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer border border-slate-300 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={onNewMeeting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Meeting</span>
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search archive by title, department, or reviewer..."
            className="w-full text-xs text-slate-800 focus:outline-none placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="CIRCULATED">Circulated</option>
          </select>
        </div>
      </div>

      {/* Meeting Cards List */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((m) => {
          const isCurrent = m.id === currentMomId;
          const actionCount = m.itemsDiscussed.reduce(
            (acc, item) =>
              acc +
              (item.action ? 1 : 0) +
              item.subPoints.filter((sp) => sp.action).length,
            0,
          ) + m.keyDirections.filter((kd) => kd.action).length;

          return (
            <div
              key={m.id}
              className={`bg-white rounded-xl border p-4 sm:p-5 transition-all shadow-sm hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isCurrent ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200'
              }`}
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      m.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : m.status === 'UNDER_REVIEW'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {m.status}
                  </span>

                  {isCurrent && (
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Active in Editor
                    </span>
                  )}

                  <span className="text-xs text-slate-400 font-mono">
                    {m.fileNumber || 'STANDARD-MOM'}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {m.meetingTitle}
                </h3>

                <p className="text-xs text-slate-600 truncate">{m.department}</p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Date: {m.meetingDate}</span>
                  </span>
                  <span>•</span>
                  <span>Reviewed by: {m.reviewedBy.split(',')[0]}</span>
                  <span>•</span>
                  <span>{m.itemsDiscussed.length} Agenda Items</span>
                  <span>•</span>
                  <span className="text-amber-800 font-medium">
                    {actionCount} Actions Tagged
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => onDuplicateMeeting(m)}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
                  title="Duplicate as new meeting template"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {minutesList.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete meeting minutes "${m.meetingTitle}"?`)) {
                        onDeleteMeeting(m.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 cursor-pointer"
                    title="Delete meeting"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => onSelectMeeting(m.id)}
                  className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    isCurrent
                      ? 'bg-slate-900 hover:bg-slate-800 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                  }`}
                >
                  <span>{isCurrent ? 'Open in Editor' : 'Switch & Open'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
            No meetings matching your filter.
          </div>
        )}
      </div>
    </div>
  );
};
