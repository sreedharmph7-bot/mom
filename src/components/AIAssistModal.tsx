import React, { useState } from 'react';
import {
  Sparkles,
  X,
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
} from 'lucide-react';
import { MeetingMinutes } from '../types/minutes';

interface AIAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyData: (data: Partial<MeetingMinutes>) => void;
}

const SAMPLE_RAW_NOTES = `Review of Emergency Health Preparedness for Upcoming Monsoon and Flood Operations
Date: 12 September 2026
Chaired by: Dr. C. Harikrishna, Principal Secretary to Govt, Health Department
Attended:
- Dr. M. Lakshmi, Director of Public Health
- Sri R. Koteswara Rao, Managing Director, Medical Infrastructure Corp
- All District Medical & Health Officers (DM&HOs) of coastal districts

Discussions & Key Points:
1. Disease Surveillance: Water-borne disease outbreaks like diarrhea, typhoid, and dengue must be monitored daily through 24/7 control rooms. Daily reporting by 6 PM is mandatory. Action assigned to Director of Public Health.
2. Drug & Antivenom Stocks: 3 months buffer stock of IV fluids, ORS, chlorine tablets, and snake antivenom must be pre-positioned at PHCs and CHCs in flood-prone mandals before 25 September. Action assigned to Managing Director, Infrastructure Corp.
3. Mobile Medical Units & Boats: 45 boat clinics and 120 mobile ambulances to be mobilized for marooned villages. Fuel and crew to be provided in coordination with Revenue & Police. Action assigned to DM&HOs and Joint Collectors.

Key Directions:
A. Dedicated WhatsApp emergency helpline for village health clinics. Action: IT Division.
B. Rapid Response Teams (RRT) on standby in all 14 vulnerable districts. Action: Director of Public Health.

Closing: The Principal Secretary directed all district teams to complete preparedness verification by 20 September without fail.`;

export const AIAssistModal: React.FC<AIAssistModalProps> = ({
  isOpen,
  onClose,
  onApplyData,
}) => {
  const [rawNotes, setRawNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<any>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!rawNotes.trim()) {
      setError('Please enter or paste meeting notes first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/format-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawNotes }),
      });

      const resJson = await response.json();

      if (!response.ok || !resJson.success) {
        throw new Error(resJson.error || 'Server failed to process notes with AI');
      }

      setParsedPreview(resJson.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to format notes. Please check server logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!parsedPreview) return;

    // Transform into MeetingMinutes partial
    const applied: Partial<MeetingMinutes> = {
      meetingTitle: parsedPreview.title || 'MINUTES OF REVIEW MEETING',
      department: parsedPreview.department || 'Department of Health & Family Welfare',
      meetingDate: parsedPreview.meetingDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      reviewedBy: parsedPreview.reviewedBy || 'Chairperson',
      inPresenceOf: parsedPreview.inPresenceOf || '',
      attendees: (parsedPreview.attendees || []).map((att: any, idx: number) => ({
        id: `att-ai-${idx}-${Date.now()}`,
        name: att.name || 'Officer',
        designation: att.designation || 'Member',
        department: att.department || '',
      })),
      itemsDiscussed: (parsedPreview.itemsDiscussed || []).map((item: any, idx: number) => ({
        id: `item-ai-${idx}-${Date.now()}`,
        itemNumber: idx + 1,
        title: item.title || `Agenda Item ${idx + 1}`,
        summary: item.summary || '',
        subPoints: (item.subPoints || []).map((sp: any, spIdx: number) => ({
          id: `sp-ai-${spIdx}-${Date.now()}`,
          label: sp.label || String.fromCharCode(65 + spIdx),
          title: sp.title || '',
          content: sp.content || '',
          action: sp.action ? (sp.action.startsWith('Action:') ? sp.action : `Action: ${sp.action}`) : '',
        })),
        action: item.action ? (item.action.startsWith('Action:') ? item.action : `Action: ${item.action}`) : '',
      })),
      keyDirectionsTitle: parsedPreview.keyDirectionsTitle || "Key Directions / Inputs of the Chair:",
      keyDirections: (parsedPreview.keyDirections || []).map((kd: any, idx: number) => ({
        id: `kd-ai-${idx}-${Date.now()}`,
        label: kd.label || String.fromCharCode(65 + idx),
        title: kd.title || `Direction ${idx + 1}`,
        content: kd.content || '',
        action: kd.action ? (kd.action.startsWith('Action:') ? kd.action : `Action: ${kd.action}`) : '',
      })),
      concludingDirective:
        parsedPreview.concludingDirective ||
        'The Chair directed all concerned officers to take up the above activities on a time-bound basis.',
    };

    onApplyData(applied);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold">AI Minutes Standardizer</h3>
              <p className="text-[11px] text-slate-400">
                Converts rough meeting notes into the statutory uniform format
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {!parsedPreview ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Paste Raw Notes or Audio Transcript:
                  </label>
                  <button
                    onClick={() => setRawNotes(SAMPLE_RAW_NOTES)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 underline font-medium cursor-pointer"
                  >
                    Load Sample Notes
                  </button>
                </div>
                <textarea
                  rows={9}
                  value={rawNotes}
                  onChange={(e) => setRawNotes(e.target.value)}
                  placeholder="Paste minutes notes, agenda bullet points, attendees, or decisions here..."
                  className="w-full p-3 text-xs text-slate-800 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-1">
                <span className="font-semibold text-slate-800">
                  Standard Format Enforcer:
                </span>
                <p>
                  Gemini will extract titles, reviewer names, attendee designations, map discussion points into lettered sub-points, parse all &quot;Action: [Officer]&quot; assignments, and form the concluding directive statement.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">
                    Standard Structure Parsed Successfully!
                  </span>
                </div>
                <button
                  onClick={() => setParsedPreview(null)}
                  className="text-xs text-emerald-700 underline font-medium cursor-pointer"
                >
                  Edit Raw Input
                </button>
              </div>

              {/* Preview Box */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold">Title:</span>{' '}
                  <span className="font-bold text-slate-900">
                    {parsedPreview.title}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Department:</span>{' '}
                  <span className="text-slate-800">{parsedPreview.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Reviewed by:</span>{' '}
                  <span className="text-slate-800">{parsedPreview.reviewedBy}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Attendees:</span>{' '}
                  <span className="text-slate-800">
                    {(parsedPreview.attendees || []).length} officials mapped
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">
                    Items Discussed:
                  </span>{' '}
                  <span className="text-slate-800">
                    {(parsedPreview.itemsDiscussed || []).length} agenda items structured
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Key Directions:</span>{' '}
                  <span className="text-slate-800">
                    {(parsedPreview.keyDirections || []).length} directives extracted
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
          >
            Cancel
          </button>

          {!parsedPreview ? (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Formatting to Standard...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Format to Standard</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply to Meeting Fields</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
