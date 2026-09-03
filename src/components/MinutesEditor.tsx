import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Lock,
  Calendar,
  Users,
  ListOrdered,
  Compass,
  FileCheck2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import {
  MeetingMinutes,
  Attendee,
  AgendaItem,
  SubPoint,
  KeyDirection,
  MeetingStatus,
  ConfidentialityLevel,
} from '../types/minutes';

interface MinutesEditorProps {
  mom: MeetingMinutes;
  onChange: (updated: MeetingMinutes) => void;
  onOpenAI?: () => void;
}

const COMMON_ACTION_ASSIGNEES = [
  'All Concerned HODs',
  'HOD Committee / CHFW',
  'Commissioner, H&FW & DPH',
  'DME / DPH&FW / DSH',
  'APMSIDC',
  'NTRVST / District Administration / Police',
  'District Collectors / Tourism Department',
  'IT Cell / Monitoring Unit',
  'Finance Controller',
];

export const MinutesEditor: React.FC<MinutesEditorProps> = ({
  mom,
  onChange,
  onOpenAI,
}) => {
  const [activeSection, setActiveSection] = useState<string>('header');

  // Quick field updates
  const updateField = <K extends keyof MeetingMinutes>(field: K, value: MeetingMinutes[K]) => {
    onChange({ ...mom, [field]: value });
  };

  // Attendees management
  const addAttendee = () => {
    const newAtt: Attendee = {
      id: `att-${Date.now()}`,
      name: '',
      designation: '',
      department: '',
    };
    onChange({ ...mom, attendees: [...mom.attendees, newAtt] });
  };

  const updateAttendee = (id: string, updates: Partial<Attendee>) => {
    const updated = mom.attendees.map((a) => (a.id === id ? { ...a, ...updates } : a));
    onChange({ ...mom, attendees: updated });
  };

  const removeAttendee = (id: string) => {
    onChange({ ...mom, attendees: mom.attendees.filter((a) => a.id !== id) });
  };

  // Agenda items management
  const addAgendaItem = () => {
    const nextNum = mom.itemsDiscussed.length + 1;
    const newItem: AgendaItem = {
      id: `item-${Date.now()}`,
      itemNumber: nextNum,
      title: '',
      summary: '',
      subPoints: [],
      action: '',
    };
    onChange({ ...mom, itemsDiscussed: [...mom.itemsDiscussed, newItem] });
  };

  const updateAgendaItem = (id: string, updates: Partial<AgendaItem>) => {
    const updated = mom.itemsDiscussed.map((item) =>
      item.id === id ? { ...item, ...updates } : item,
    );
    onChange({ ...mom, itemsDiscussed: updated });
  };

  const removeAgendaItem = (id: string) => {
    const filtered = mom.itemsDiscussed
      .filter((item) => item.id !== id)
      .map((item, index) => ({ ...item, itemNumber: index + 1 }));
    onChange({ ...mom, itemsDiscussed: filtered });
  };

  const moveAgendaItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === mom.itemsDiscussed.length - 1)
    ) {
      return;
    }
    const newItems = [...mom.itemsDiscussed];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);
    const renumbered = newItems.map((item, idx) => ({ ...item, itemNumber: idx + 1 }));
    onChange({ ...mom, itemsDiscussed: renumbered });
  };

  // Sub-points management
  const addSubPoint = (itemId: string) => {
    const targetItem = mom.itemsDiscussed.find((i) => i.id === itemId);
    if (!targetItem) return;

    // Determine default label e.g. A, B, C...
    const count = targetItem.subPoints.length;
    const nextLabel = String.fromCharCode(65 + count); // 65 is 'A'

    const newSp: SubPoint = {
      id: `sp-${Date.now()}`,
      label: nextLabel,
      title: '',
      content: '',
      action: '',
    };

    updateAgendaItem(itemId, { subPoints: [...targetItem.subPoints, newSp] });
  };

  const updateSubPoint = (itemId: string, spId: string, updates: Partial<SubPoint>) => {
    const targetItem = mom.itemsDiscussed.find((i) => i.id === itemId);
    if (!targetItem) return;

    const updatedSp = targetItem.subPoints.map((sp) =>
      sp.id === spId ? { ...sp, ...updates } : sp,
    );
    updateAgendaItem(itemId, { subPoints: updatedSp });
  };

  const removeSubPoint = (itemId: string, spId: string) => {
    const targetItem = mom.itemsDiscussed.find((i) => i.id === itemId);
    if (!targetItem) return;

    const filtered = targetItem.subPoints.filter((sp) => sp.id !== spId);
    updateAgendaItem(itemId, { subPoints: filtered });
  };

  // Key directions management
  const addKeyDirection = () => {
    const count = mom.keyDirections.length;
    const nextLabel = String.fromCharCode(65 + count);
    const newKd: KeyDirection = {
      id: `kd-${Date.now()}`,
      label: nextLabel,
      title: '',
      content: '',
      action: '',
    };
    onChange({ ...mom, keyDirections: [...mom.keyDirections, newKd] });
  };

  const updateKeyDirection = (id: string, updates: Partial<KeyDirection>) => {
    const updated = mom.keyDirections.map((kd) =>
      kd.id === id ? { ...kd, ...updates } : kd,
    );
    onChange({ ...mom, keyDirections: updated });
  };

  const removeKeyDirection = (id: string) => {
    onChange({
      ...mom,
      keyDirections: mom.keyDirections.filter((kd) => kd.id !== id),
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Standard Schema Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-100">
                Uniform Standard Minutes Form (Field-Restricted)
              </h2>
              <span className="flex items-center gap-1 text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Format Standard Locked
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              The layout and statutory hierarchy are enforced. Enter details in the structured fields below.
            </p>
          </div>
        </div>

        {onOpenAI && (
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Draft from Rough Notes</span>
          </button>
        )}
      </div>

      {/* Section Quick Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-slate-200">
        {[
          { id: 'header', label: '1. Title & Date', icon: Calendar },
          { id: 'attendance', label: '2. Attendees', icon: Users },
          { id: 'items', label: '3. Items Discussed', icon: ListOrdered },
          { id: 'directions', label: '4. Key Directions', icon: Compass },
          { id: 'conclusion', label: '5. Concluding Directives', icon: FileCheck2 },
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSection(sec.id);
                document.getElementById(`section-${sec.id}`)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-medium whitespace-nowrap cursor-pointer transition-colors ${
                isActive
                  ? 'bg-white border-t-2 border-emerald-600 text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: HEADER & DATE */}
      <section
        id="section-header"
        className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Section 1: Meeting Identification & Leadership</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Fixed Official Header</span>
        </div>

        <div className="space-y-4">
          {/* Prefix indicator + Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Meeting Title <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500">
              <span className="bg-slate-100 px-3 py-2 text-xs font-mono font-bold text-slate-600 border-r border-slate-300 select-none">
                MINUTES OF MEETING –
              </span>
              <input
                id="input-meeting-title"
                type="text"
                value={mom.meetingTitle}
                onChange={(e) => updateField('meetingTitle', e.target.value)}
                placeholder="REVIEW OF PREPAREDNESS FOR GODAVARI PUSHKARALU–2027"
                className="w-full px-3 py-2 text-sm font-semibold uppercase text-slate-900 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Title is rendered in capital letters on the top of the official document.
            </p>
          </div>

          {/* Department / Subtitle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Department / Sub-Header (Enclosed in parentheses)
            </label>
            <input
              id="input-department"
              type="text"
              value={mom.department}
              onChange={(e) => updateField('department', e.target.value)}
              placeholder="Health, Medical & Family Welfare Department – Preparedness and Action Plan"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Date, Time, Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Date (Date:- DD-MM-YYYY) <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-meeting-date"
                type="text"
                value={mom.meetingDate}
                onChange={(e) => updateField('meetingDate', e.target.value)}
                placeholder="24-08-2026"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                File / Reference No.
              </label>
              <input
                type="text"
                value={mom.fileNumber || ''}
                onChange={(e) => updateField('fileNumber', e.target.value)}
                placeholder="HM&FW/PKL-2027/REV-01"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Meeting Status
              </label>
              <select
                value={mom.status}
                onChange={(e) => updateField('status', e.target.value as MeetingStatus)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
              >
                <option value="DRAFT">Draft</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved & Issued</option>
                <option value="CIRCULATED">Circulated to Departments</option>
              </select>
            </div>
          </div>

          {/* Reviewed By & In the Presence Of */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Reviewed by: (Chairperson / Minister / Secretary) <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-reviewed-by"
                type="text"
                value={mom.reviewedBy}
                onChange={(e) => updateField('reviewedBy', e.target.value)}
                placeholder="Sri Satya Kumar Yadav, Hon’ble Minister for Health, Medical & Family Welfare & Medical Education"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                In the presence of: (Optional)
              </label>
              <input
                id="input-presence-of"
                type="text"
                value={mom.inPresenceOf || ''}
                onChange={(e) => updateField('inPresenceOf', e.target.value)}
                placeholder="Sri G. Veerapandian, IAS, Secretary, Health, Medical & Family Welfare Department"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ATTENDANCE */}
      <section
        id="section-attendance"
        className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Section 2: Officers and Officials Attended</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard numbered attendance roster. Add participants with designations.
            </p>
          </div>
          <button
            onClick={addAttendee}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Attendee</span>
          </button>
        </div>

        <div className="space-y-3">
          {mom.attendees.map((att, index) => (
            <div
              key={att.id}
              className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3"
            >
              <span className="w-6 text-center font-bold text-slate-500 text-sm pt-2">
                {index + 1}.
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">
                    Full Name & Salutation
                  </label>
                  <input
                    type="text"
                    value={att.name}
                    onChange={(e) => updateAttendee(att.id, { name: e.target.value })}
                    placeholder="Sri. KVN Chakradhar Babu, IAS"
                    className="w-full px-2.5 py-1.5 bg-white rounded border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">
                    Official Designation
                  </label>
                  <input
                    type="text"
                    value={att.designation}
                    onChange={(e) => updateAttendee(att.id, { designation: e.target.value })}
                    placeholder="Commissioner, H&FW & Director, DSH"
                    className="w-full px-2.5 py-1.5 bg-white rounded border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">
                    Department / Directorate
                  </label>
                  <input
                    type="text"
                    value={att.department || ''}
                    onChange={(e) => updateAttendee(att.id, { department: e.target.value })}
                    placeholder="Health & Family Welfare"
                    className="w-full px-2.5 py-1.5 bg-white rounded border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <button
                onClick={() => removeAttendee(att.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer mt-3"
                title="Remove attendee"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {mom.attendees.length === 0 && (
            <div className="text-center py-6 border border-dashed border-slate-300 rounded-lg text-slate-500 text-xs">
              No attendees added yet. Click &quot;Add Attendee&quot; above.
            </div>
          )}
        </div>
      </section>

      {/* SECTION 3: ITEMS DISCUSSED */}
      <section
        id="section-items"
        className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <ListOrdered className="w-4 h-4 text-emerald-600" />
              <span>Section 3: Items Discussed (Agenda & Action Plan)</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Each item has discussion text, sub-points (A, B, C...) and standard &quot;Action: [Officer]&quot; assignments.
            </p>
          </div>
          <button
            onClick={addAgendaItem}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Agenda Item</span>
          </button>
        </div>

        <div className="space-y-6">
          {mom.itemsDiscussed.map((item, itemIdx) => (
            <div
              key={item.id}
              className="border border-slate-300/90 rounded-xl p-4 sm:p-5 bg-slate-50/50 space-y-4 shadow-sm"
            >
              {/* Item Header bar */}
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-7 h-7 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    {item.itemNumber}
                  </span>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateAgendaItem(item.id, { title: e.target.value })}
                    placeholder={`Item ${item.itemNumber} Title (e.g. Preparedness & Health Action plan...)`}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveAgendaItem(itemIdx, 'up')}
                    disabled={itemIdx === 0}
                    className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveAgendaItem(itemIdx, 'down')}
                    disabled={itemIdx === mom.itemsDiscussed.length - 1}
                    className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeAgendaItem(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer ml-1"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Summary / Preamble */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Discussion Summary / Preamble
                </label>
                <textarea
                  rows={2}
                  value={item.summary || ''}
                  onChange={(e) => updateAgendaItem(item.id, { summary: e.target.value })}
                  placeholder="Enter background deliberation details or leave blank if item has only sub-points..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Sub-points container */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 uppercase flex items-center gap-1.5">
                    <span>Sub-clauses / Detailed Sub-points</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      ({item.subPoints.length} added)
                    </span>
                  </label>
                  <button
                    onClick={() => addSubPoint(item.id)}
                    className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Sub-point (A, B, C...)</span>
                  </button>
                </div>

                {item.subPoints.map((sp) => (
                  <div
                    key={sp.id}
                    className="bg-white border border-slate-200 rounded-lg p-3 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={sp.label}
                        onChange={(e) => updateSubPoint(item.id, sp.id, { label: e.target.value })}
                        className="w-10 text-center px-1 py-1 font-bold text-xs bg-slate-100 border border-slate-300 rounded focus:outline-none focus:border-emerald-500"
                        title="Sub-clause label"
                      />
                      <input
                        type="text"
                        value={sp.title || ''}
                        onChange={(e) => updateSubPoint(item.id, sp.id, { title: e.target.value })}
                        placeholder="Sub-heading (e.g. Ghat-wise planning and projected pilgrim load)"
                        className="w-full px-2.5 py-1 text-xs font-semibold text-slate-800 border border-slate-300 rounded focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => removeSubPoint(item.id, sp.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={sp.content}
                      onChange={(e) => updateSubPoint(item.id, sp.id, { content: e.target.value })}
                      placeholder="Enter detailed observation, decision or deliberation..."
                      className="w-full px-2.5 py-1.5 text-xs text-slate-700 border border-slate-200 rounded focus:outline-none focus:border-emerald-500 leading-relaxed"
                    />

                    {/* Sub-point action tag */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Action:
                        </span>
                        <input
                          type="text"
                          value={sp.action || ''}
                          onChange={(e) => updateSubPoint(item.id, sp.id, { action: e.target.value })}
                          placeholder="HOD Committee / DME / NTRVST / DPH&FW..."
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">Quick:</span>
                        {['All Concerned HODs', 'APMSIDC', 'CHFW', 'DME'].map((chip) => (
                          <button
                            key={chip}
                            onClick={() => updateSubPoint(item.id, sp.id, { action: chip })}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 cursor-pointer"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall Item Action */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                  <span className="text-xs font-bold text-amber-900 whitespace-nowrap">
                    Overall Item Action:
                  </span>
                  <input
                    type="text"
                    value={item.action || ''}
                    onChange={(e) => updateAgendaItem(item.id, { action: e.target.value })}
                    placeholder="Action: Commissioner, H&FW & DPH"
                    className="w-full px-2.5 py-1 text-xs font-bold text-amber-950 bg-white border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[11px] text-amber-800 font-medium">Assign:</span>
                  {COMMON_ACTION_ASSIGNEES.slice(0, 4).map((chip) => (
                    <button
                      key={chip}
                      onClick={() => updateAgendaItem(item.id, { action: `Action: ${chip}` })}
                      className="text-[10px] bg-white hover:bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {mom.itemsDiscussed.length === 0 && (
            <div className="text-center py-8 border border-dashed border-slate-300 rounded-xl text-slate-500 text-xs">
              No items discussed yet. Click &quot;Add Agenda Item&quot; to begin.
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4: KEY DIRECTIONS */}
      <section
        id="section-directions"
        className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Section 4: Key Directions / Inputs of the Chair</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Specific high-priority policy directives and decisions issued by the Chair/Minister.
            </p>
          </div>
          <button
            onClick={addKeyDirection}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Key Direction</span>
          </button>
        </div>

        {/* Custom Section Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Section Header Title
          </label>
          <input
            type="text"
            value={mom.keyDirectionsTitle || ''}
            onChange={(e) => updateField('keyDirectionsTitle', e.target.value)}
            placeholder="Key Directions / Inputs of the Hon'ble Minister for Health:"
            className="w-full px-3 py-1.5 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-4">
          {mom.keyDirections.map((kd) => (
            <div
              key={kd.id}
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={kd.label}
                  onChange={(e) => updateKeyDirection(kd.id, { label: e.target.value })}
                  className="w-10 text-center font-bold text-xs py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={kd.title}
                  onChange={(e) => updateKeyDirection(kd.id, { title: e.target.value })}
                  placeholder="Direction Title (e.g. Dedicated public portal for NGOs, spiritual organisations...)"
                  className="w-full px-3 py-1 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => removeKeyDirection(kd.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                  title="Remove direction"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <textarea
                rows={3}
                value={kd.content}
                onChange={(e) => updateKeyDirection(kd.id, { content: e.target.value })}
                placeholder="Enter specific policy directive text..."
                className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200">
                <div className="flex items-center gap-1.5 flex-1 min-w-[220px]">
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Action:
                  </span>
                  <input
                    type="text"
                    value={kd.action || ''}
                    onChange={(e) => updateKeyDirection(kd.id, { action: e.target.value })}
                    placeholder="Action: CHFW / IT Cell / All Concerned HODs"
                    className="w-full px-2 py-1 text-xs font-bold text-amber-950 bg-white border border-slate-300 rounded focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">Quick:</span>
                  {['All Concerned HODs', 'APMSIDC', 'CHFW', 'NTRUHS'].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => updateKeyDirection(kd.id, { action: `Action: ${chip}` })}
                      className="text-[10px] bg-white hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {mom.keyDirections.length === 0 && (
            <div className="text-center py-6 border border-dashed border-slate-300 rounded-lg text-slate-500 text-xs">
              No key directions added. Click &quot;Add Key Direction&quot; above.
            </div>
          )}
        </div>
      </section>

      {/* SECTION 5: CONCLUDING DIRECTIVE */}
      <section
        id="section-conclusion"
        className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            <span>Section 5: Concluding Directive & Dispatch</span>
          </div>
          <span className="text-xs text-slate-400">Statutory Closing</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Concluding Directive Statement <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="input-concluding-directive"
            rows={3}
            value={mom.concludingDirective}
            onChange={(e) => updateField('concludingDirective', e.target.value)}
            placeholder="The Hon’ble Minister directed all concerned officers to take up the above activities on a time-bound basis and ensure that..."
            className="w-full px-3 py-2 text-xs font-medium text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Issued By / Authority
            </label>
            <input
              type="text"
              value={mom.issuedBy || ''}
              onChange={(e) => updateField('issuedBy', e.target.value)}
              placeholder="Office of the Secretary to Government, HM&FW Department"
              className="w-full px-3 py-1.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Confidentiality Classification
            </label>
            <select
              value={mom.confidentiality}
              onChange={(e) => updateField('confidentiality', e.target.value as ConfidentialityLevel)}
              className="w-full px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
            >
              <option value="OFFICIAL">Official</option>
              <option value="RESTRICTED">Restricted</option>
              <option value="INTERNAL">Internal Use Only</option>
              <option value="CONFIDENTIAL">Confidential</option>
            </select>
          </div>
        </div>

        {/* Helpful Info Tip */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            All entries are automatically saved to your local meeting repository. Click <strong>Standard Document View</strong> in the header at any time to see the 1:1 replica of the official document ready to print or export.
          </span>
        </div>
      </section>
    </div>
  );
};
