import React, { useState } from 'react';
import {
  Printer,
  Copy,
  Download,
  Check,
  ZoomIn,
  ZoomOut,
  Highlighter,
  FileCheck,
  FileCode,
} from 'lucide-react';
import { MeetingMinutes } from '../types/minutes';
import { generatePlainTextMinutes, downloadAsWordDoc } from '../utils/storage';

interface OfficialDocumentViewProps {
  mom: MeetingMinutes;
  onEditSection?: (section: string) => void;
}

export const OfficialDocumentView: React.FC<OfficialDocumentViewProps> = ({ mom }) => {
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState<number>(100);
  const [highlightActions, setHighlightActions] = useState<boolean>(true);

  const handleCopyText = async () => {
    const text = generatePlainTextMinutes(mom);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(mom, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mom.meetingTitle.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 35)}_MOM.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full min-h-[calc(100vh-100px)] bg-slate-200/90 py-6 px-3 sm:px-6">
      {/* Top Floating Document Toolbar */}
      <div className="max-w-4xl mx-auto mb-5 bg-white/95 backdrop-blur-sm border border-slate-300 rounded-xl px-4 py-2.5 shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs font-medium">
            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Uniform Standard Document Layout</span>
          </div>
          <span className="text-slate-400 text-xs hidden sm:inline">
            1:1 Replica of Approved State MoM Format
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {/* Action Highlight Toggle */}
          <button
            onClick={() => setHighlightActions(!highlightActions)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
              highlightActions
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="Highlight Action items assigned to officers"
          >
            <Highlighter className="w-3.5 h-3.5 text-amber-600" />
            <span>Highlight Actions</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-100 rounded-md border border-slate-200 p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(75, z - 10))}
              className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] text-slate-700 min-w-[38px] text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(140, z + 10))}
              className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Copy Plaintext */}
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-md transition-colors cursor-pointer"
            title="Copy as clean text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          {/* Word Doc */}
          <button
            onClick={() => downloadAsWordDoc(mom)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-md transition-colors cursor-pointer"
            title="Download Word format"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Word (.doc)</span>
          </button>

          {/* Download JSON */}
          <button
            onClick={handleDownloadJSON}
            className="p-1 px-2 text-slate-600 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors cursor-pointer"
            title="Download JSON schema"
          >
            <FileCode className="w-3.5 h-3.5" />
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors font-medium cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Simulated Paper Sheet matching the enclosed 5-page PDF styling */}
      <div className="flex justify-center">
        <div
          id="official-mom-document"
          style={{
            transform: zoom === 100 ? 'none' : `scale(${zoom / 100})`,
            transformOrigin: 'top center',
          }}
          className="w-full max-w-[850px] bg-white text-black shadow-xl border border-slate-300 print:border-none print:shadow-none p-8 sm:p-14 print:p-0 transition-transform duration-150 font-serif leading-relaxed text-[15px]"
        >
          {/* Header Title Section */}
          <div className="text-center mb-6">
            <h1 className="text-[17px] font-bold tracking-tight uppercase leading-snug">
              MINUTES OF MEETING – {mom.meetingTitle}
            </h1>
            {mom.department && (
              <h2 className="text-[15px] font-bold text-neutral-900 mt-1">
                ({mom.department})
              </h2>
            )}
          </div>

          {/* Date Line */}
          <div className="text-right font-bold text-[15px] mb-5">
            Date:- {mom.meetingDate}
          </div>

          {/* Review & Presence Block */}
          <div className="space-y-2 mb-5">
            <p className="leading-relaxed">
              <span className="font-bold">Reviewed by:</span> {mom.reviewedBy}
            </p>
            {mom.inPresenceOf && (
              <p className="leading-relaxed">
                <span className="font-bold">In the presence of:</span> {mom.inPresenceOf}
              </p>
            )}
          </div>

          {/* Attendees List */}
          <div className="mb-6">
            <h3 className="font-bold text-[15px] mb-2">Officers and Officials Attended:</h3>
            <ol className="list-decimal pl-6 space-y-1">
              {mom.attendees.map((att) => (
                <li key={att.id} className="leading-snug">
                  <span className="font-medium">{att.name}</span>
                  {att.designation && <span>, {att.designation}</span>}
                  {att.department && <span> ({att.department})</span>}
                </li>
              ))}
            </ol>
          </div>

          {/* Items Discussed Section */}
          <div className="mb-6">
            <h3 className="font-bold text-[15px] mb-3">Items Discussed:</h3>

            <div className="space-y-6">
              {mom.itemsDiscussed.map((item) => (
                <div key={item.id} className="space-y-2">
                  {/* Item Title */}
                  <h4 className="font-bold text-[15px]">
                    {item.itemNumber}. {item.title}:
                  </h4>

                  {/* Summary context */}
                  {item.summary && (
                    <div className="whitespace-pre-line text-neutral-900 leading-relaxed text-justify">
                      {item.summary}
                    </div>
                  )}

                  {/* Sub-points */}
                  {item.subPoints && item.subPoints.length > 0 && (
                    <div className="space-y-3 pl-2 sm:pl-3">
                      {item.subPoints.map((sp) => (
                        <div key={sp.id} className="space-y-1">
                          <p className="leading-relaxed text-justify">
                            <span className="font-bold">
                              {sp.label}. {sp.title ? `${sp.title}: ` : ''}
                            </span>
                            <span className="text-neutral-900">{sp.content}</span>
                          </p>

                          {/* Sub-point action tag */}
                          {sp.action && (
                            <div className="text-right">
                              <span
                                className={`font-bold inline-block text-[14px] ${
                                  highlightActions
                                    ? 'bg-amber-100/90 text-amber-950 px-2 py-0.5 rounded border border-amber-200'
                                    : 'text-black'
                                }`}
                              >
                                {sp.action.startsWith('Action:') ? sp.action : `Action: ${sp.action}`}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Item-level action tag */}
                  {item.action && (
                    <div className="text-right pt-1">
                      <span
                        className={`font-bold inline-block text-[14px] ${
                          highlightActions
                            ? 'bg-amber-100/90 text-amber-950 px-2 py-0.5 rounded border border-amber-200'
                            : 'text-black'
                        }`}
                      >
                        {item.action.startsWith('Action:') ? item.action : `Action: ${item.action}`}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Key Directions Section */}
          {mom.keyDirections && mom.keyDirections.length > 0 && (
            <div className="mb-6 pt-2">
              <h3 className="font-bold text-[15px] mb-3">
                {mom.keyDirectionsTitle || "Key Directions / Inputs of the Hon'ble Minister for Health:"}
              </h3>

              <div className="space-y-4 pl-1 sm:pl-2">
                {mom.keyDirections.map((kd) => (
                  <div key={kd.id} className="space-y-1">
                    <p className="leading-relaxed text-justify">
                      <span className="font-bold">
                        {kd.label}. {kd.title}:
                      </span>{' '}
                      <span className="text-neutral-900">{kd.content}</span>
                    </p>

                    {kd.action && (
                      <div className="text-right">
                        <span
                          className={`font-bold inline-block text-[14px] ${
                            highlightActions
                              ? 'bg-amber-100/90 text-amber-950 px-2 py-0.5 rounded border border-amber-200'
                              : 'text-black'
                          }`}
                        >
                          {kd.action.startsWith('Action:') ? kd.action : `Action: ${kd.action}`}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concluding Directive */}
          {mom.concludingDirective && (
            <div className="mt-8 pt-4 border-t border-neutral-300">
              <p className="font-bold leading-relaxed text-justify text-[15px]">
                {mom.concludingDirective}
              </p>
            </div>
          )}

          {/* Optional Circulation and Dispatch Sign-off */}
          {(mom.issuedBy || (mom.copyTo && mom.copyTo.length > 0) || (mom.copySubmittedTo && mom.copySubmittedTo.length > 0)) && (
            <div className="mt-10 pt-4 border-t border-neutral-200 text-[13px] space-y-3 font-sans">
              {mom.issuedBy && (
                <div className="text-right font-semibold">
                  <span>// By Order of the Chairperson //</span>
                  <div className="mt-1 text-neutral-800">{mom.issuedBy}</div>
                </div>
              )}

              {mom.copySubmittedTo && mom.copySubmittedTo.length > 0 && (
                <div>
                  <span className="font-semibold text-neutral-700">Copy submitted to:</span>
                  <ul className="list-disc pl-5 text-neutral-600 mt-1">
                    {mom.copySubmittedTo.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {mom.copyTo && mom.copyTo.length > 0 && (
                <div>
                  <span className="font-semibold text-neutral-700">Copy to:</span>
                  <ul className="list-disc pl-5 text-neutral-600 mt-1">
                    {mom.copyTo.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
