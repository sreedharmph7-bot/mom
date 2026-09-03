import React, { useState, useMemo } from 'react';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Search,
  Printer,
  Download,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';
import { MeetingMinutes, ExtractedActionItem } from '../types/minutes';
import { extractActionItemsFromMeeting } from '../utils/storage';

interface ActionTrackerViewProps {
  mom: MeetingMinutes;
  onUpdateActionStatus?: (actionId: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => void;
}

export const ActionTrackerView: React.FC<ActionTrackerViewProps> = ({ mom }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  // Track status overrides locally for this session
  const [statusOverrides, setStatusOverrides] = useState<Record<string, 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>>({});
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});

  // Extract action items
  const baseActions = useMemo(() => extractActionItemsFromMeeting(mom), [mom]);

  const actionItems: ExtractedActionItem[] = useMemo(() => {
    return baseActions.map((act) => ({
      ...act,
      status: statusOverrides[act.id] || act.status,
    }));
  }, [baseActions, statusOverrides]);

  // Unique assignees for filter
  const assignees = useMemo(() => {
    const set = new Set<string>();
    baseActions.forEach((a) => {
      // Split if multiple departments separated by /
      a.assignedTo.split('/').forEach((part) => {
        const trimmed = part.trim();
        if (trimmed) set.add(trimmed);
      });
      set.add(a.assignedTo);
    });
    return Array.from(set).sort();
  }, [baseActions]);

  // Filtered action items
  const filteredActions = useMemo(() => {
    return actionItems.filter((act) => {
      const matchesSearch =
        act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.sectionRef.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAssignee =
        selectedAssignee === 'ALL' ||
        act.assignedTo.toLowerCase().includes(selectedAssignee.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || act.status === statusFilter;

      return matchesSearch && matchesAssignee && matchesStatus;
    });
  }, [actionItems, searchTerm, selectedAssignee, statusFilter]);

  const toggleStatus = (id: string) => {
    setStatusOverrides((prev) => {
      const current = prev[id] || 'PENDING';
      const next =
        current === 'PENDING' ? 'IN_PROGRESS' : current === 'IN_PROGRESS' ? 'COMPLETED' : 'PENDING';
      return { ...prev, [id]: next };
    });
  };

  const handlePrintATR = () => {
    window.print();
  };

  const stats = useMemo(() => {
    const total = actionItems.length;
    const completed = actionItems.filter((a) => a.status === 'COMPLETED').length;
    const inProgress = actionItems.filter((a) => a.status === 'IN_PROGRESS').length;
    const pending = actionItems.filter((a) => a.status === 'PENDING').length;
    return { total, completed, inProgress, pending };
  }, [actionItems]);

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-200">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Action Items Matrix & Action Taken Report (ATR)
              </h2>
              <p className="text-xs text-slate-500">
                Extracted directly from statutory decisions in: <strong>{mom.meetingTitle}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintATR}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print ATR Report</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Action Points</div>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across all agenda items</div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-xs text-amber-800 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Action</span>
          </div>
          <div className="text-2xl font-bold text-amber-950 mt-0.5">{stats.pending}</div>
          <div className="text-[11px] text-amber-700 mt-1">Awaiting compliance</div>
        </div>

        <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-xs text-sky-800 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>In Progress</span>
          </div>
          <div className="text-2xl font-bold text-sky-950 mt-0.5">{stats.inProgress}</div>
          <div className="text-[11px] text-sky-700 mt-1">Under execution</div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-xs text-emerald-800 font-medium flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Completed</span>
          </div>
          <div className="text-2xl font-bold text-emerald-950 mt-0.5">{stats.completed}</div>
          <div className="text-[11px] text-emerald-700 mt-1">Compliance recorded</div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action item, description, or officer..."
            className="w-full text-xs text-slate-800 focus:outline-none placeholder-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="bg-transparent text-slate-700 text-xs focus:outline-none cursor-pointer max-w-[160px]"
            >
              <option value="ALL">All Departments</option>
              {assignees.map((ass) => (
                <option key={ass} value={ass}>
                  {ass}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-slate-700 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions Table (Printable format for ATR) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Action Items Roster ({filteredActions.length} items)
          </span>
          <span className="text-[11px] text-slate-500">
            Click status button to toggle Pending → In Progress → Completed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4 w-16">Ref</th>
                <th className="py-2.5 px-4">Action Item & Decision Details</th>
                <th className="py-2.5 px-4 w-52">Assigned Officer / Department</th>
                <th className="py-2.5 px-4 w-32 text-center">Status</th>
                <th className="py-2.5 px-4 w-60">Action Taken / Compliance Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActions.map((act) => {
                return (
                  <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500 align-top">
                      {act.sectionRef}
                    </td>

                    <td className="py-3 px-4 align-top space-y-1">
                      <div className="font-semibold text-slate-900">{act.title}</div>
                      <p className="text-slate-600 leading-relaxed line-clamp-3">
                        {act.description}
                      </p>
                    </td>

                    <td className="py-3 px-4 align-top font-semibold text-amber-900">
                      <span className="inline-block bg-amber-50 border border-amber-200 px-2 py-1 rounded text-[11px]">
                        {act.assignedTo}
                      </span>
                    </td>

                    <td className="py-3 px-4 align-top text-center">
                      <button
                        onClick={() => toggleStatus(act.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer shadow-2xs ${
                          act.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                            : act.status === 'IN_PROGRESS'
                            ? 'bg-sky-100 text-sky-800 border-sky-300 hover:bg-sky-200'
                            : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                        }`}
                      >
                        {act.status === 'COMPLETED' && <CheckCircle className="w-3 h-3" />}
                        {act.status === 'IN_PROGRESS' && <Clock className="w-3 h-3" />}
                        {act.status === 'PENDING' && <AlertCircle className="w-3 h-3" />}
                        <span>{act.status}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 align-top">
                      <input
                        type="text"
                        value={actionNotes[act.id] || ''}
                        onChange={(e) =>
                          setActionNotes({ ...actionNotes, [act.id]: e.target.value })
                        }
                        placeholder="Enter compliance update..."
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-slate-50/50 focus:bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </td>
                  </tr>
                );
              })}

              {filteredActions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400 text-xs">
                    No matching action items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
