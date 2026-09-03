import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { MinutesEditor } from './components/MinutesEditor';
import { OfficialDocumentView } from './components/OfficialDocumentView';
import { ActionTrackerView } from './components/ActionTrackerView';
import { MeetingArchiveModal } from './components/MeetingArchiveModal';
import { AIAssistModal } from './components/AIAssistModal';
import { MeetingMinutes } from './types/minutes';
import {
  getAllStoredMinutes,
  saveSingleMinutes,
  deleteMinutes,
  getActiveMinutesId,
  setActiveMinutesId,
  downloadAsWordDoc,
  extractActionItemsFromMeeting,
} from './utils/storage';
import { GODAVARI_PUSHKARALU_MINUTES, CREATE_EMPTY_TEMPLATE } from './data/sampleMinutes';
import { Columns, Eye, Edit3 } from 'lucide-react';

export default function App() {
  const [minutesList, setMinutesList] = useState<MeetingMinutes[]>([]);
  const [currentMomId, setCurrentMomId] = useState<string>('');
  const [activeView, setActiveView] = useState<'editor' | 'preview' | 'actions' | 'archive'>('editor');
  const [splitScreen, setSplitScreen] = useState<boolean>(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize from storage on mount
  useEffect(() => {
    const list = getAllStoredMinutes();
    setMinutesList(list);

    const savedId = getActiveMinutesId();
    const found = list.find((m) => m.id === savedId);
    if (found) {
      setCurrentMomId(found.id);
    } else if (list.length > 0) {
      setCurrentMomId(list[0].id);
      setActiveMinutesId(list[0].id);
    }
  }, []);

  // Find active minutes
  const currentMom = useMemo(() => {
    return (
      minutesList.find((m) => m.id === currentMomId) ||
      minutesList[0] ||
      GODAVARI_PUSHKARALU_MINUTES
    );
  }, [minutesList, currentMomId]);

  // Total action count
  const actionCount = useMemo(() => {
    return extractActionItemsFromMeeting(currentMom).length;
  }, [currentMom]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Handle updates to the active meeting minutes
  const handleUpdateCurrentMom = (updated: MeetingMinutes) => {
    saveSingleMinutes(updated);
    setMinutesList((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m)),
    );
  };

  // Create new meeting from empty standard template
  const handleNewMeeting = () => {
    const newTemplate = CREATE_EMPTY_TEMPLATE();
    saveSingleMinutes(newTemplate);
    setMinutesList((prev) => [newTemplate, ...prev]);
    setCurrentMomId(newTemplate.id);
    setActiveMinutesId(newTemplate.id);
    setActiveView('editor');
    showToast('New meeting created with standard uniform fields');
  };

  // Load official enclosed Godavari Pushkaralu sample
  const handleLoadOfficialSample = () => {
    const exists = minutesList.find((m) => m.id === GODAVARI_PUSHKARALU_MINUTES.id);
    if (!exists) {
      saveSingleMinutes(GODAVARI_PUSHKARALU_MINUTES);
      setMinutesList((prev) => [GODAVARI_PUSHKARALU_MINUTES, ...prev]);
    }
    setCurrentMomId(GODAVARI_PUSHKARALU_MINUTES.id);
    setActiveMinutesId(GODAVARI_PUSHKARALU_MINUTES.id);
    setActiveView('preview');
    showToast('Loaded enclosed Godavari Pushkaralu–2027 official sample');
  };

  // Duplicate an existing meeting as a fresh template
  const handleDuplicateMeeting = (source: MeetingMinutes) => {
    const dup: MeetingMinutes = {
      ...source,
      id: `mom-copy-${Date.now()}`,
      fileNumber: `${source.fileNumber || 'MOM'}-COPY`,
      meetingTitle: `${source.meetingTitle} (COPY)`,
      meetingDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveSingleMinutes(dup);
    setMinutesList((prev) => [dup, ...prev]);
    setCurrentMomId(dup.id);
    setActiveMinutesId(dup.id);
    setActiveView('editor');
    showToast('Meeting duplicated. Edit fields as needed.');
  };

  // Delete meeting
  const handleDeleteMeeting = (id: string) => {
    const updated = deleteMinutes(id);
    setMinutesList(updated);
    if (currentMomId === id && updated.length > 0) {
      setCurrentMomId(updated[0].id);
      setActiveMinutesId(updated[0].id);
    }
    showToast('Meeting deleted from repository');
  };

  // Select meeting from archive
  const handleSelectMeeting = (id: string) => {
    setCurrentMomId(id);
    setActiveMinutesId(id);
    setActiveView('editor');
  };

  // Import JSON
  const handleImportJSON = (imported: MeetingMinutes) => {
    saveSingleMinutes(imported);
    setMinutesList((prev) => [imported, ...prev]);
    setCurrentMomId(imported.id);
    setActiveMinutesId(imported.id);
    setActiveView('editor');
    showToast('Imported meeting minutes successfully');
  };

  // Apply AI extracted data
  const handleApplyAIData = (partial: Partial<MeetingMinutes>) => {
    const updated: MeetingMinutes = {
      ...currentMom,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    handleUpdateCurrentMom(updated);
    showToast('AI draft applied to standard fields');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased">
      {/* Institutional App Header */}
      <Header
        currentMom={currentMom}
        activeView={activeView}
        onViewChange={(v) => {
          setActiveView(v);
          if (v !== 'editor') setSplitScreen(false);
        }}
        onNewMeeting={handleNewMeeting}
        onLoadSample={handleLoadOfficialSample}
        onOpenAI={() => setIsAIModalOpen(true)}
        onPrint={() => window.print()}
        onExportWord={() => downloadAsWordDoc(currentMom)}
        actionCount={actionCount}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full pb-16">
        {/* Editor View */}
        {activeView === 'editor' && (
          <div>
            {/* Split screen toggle for desktop */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-3 pb-1 flex justify-end print:hidden">
              <button
                onClick={() => setSplitScreen(!splitScreen)}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                  splitScreen
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
                title="View Field Editor and Standard Document Preview side-by-side"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>{splitScreen ? 'Single Column Mode' : 'Side-by-Side Live Preview'}</span>
              </button>
            </div>

            {splitScreen ? (
              <div className="max-w-[1700px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="max-h-[calc(100vh-140px)] overflow-y-auto pr-2">
                  <div className="sticky top-0 bg-slate-100 py-1 z-10 flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                      Field-Restricted Entry Form
                    </span>
                  </div>
                  <MinutesEditor
                    mom={currentMom}
                    onChange={handleUpdateCurrentMom}
                    onOpenAI={() => setIsAIModalOpen(true)}
                  />
                </div>

                <div className="max-h-[calc(100vh-140px)] overflow-y-auto pl-2 border-l border-slate-300">
                  <div className="sticky top-0 bg-slate-100 py-1 z-10 flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      Live Standard Document Preview (1:1 Replica)
                    </span>
                  </div>
                  <OfficialDocumentView mom={currentMom} />
                </div>
              </div>
            ) : (
              <MinutesEditor
                mom={currentMom}
                onChange={handleUpdateCurrentMom}
                onOpenAI={() => setIsAIModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* Standard Official Document View */}
        {activeView === 'preview' && (
          <OfficialDocumentView mom={currentMom} />
        )}

        {/* Action Items Matrix / ATR */}
        {activeView === 'actions' && (
          <ActionTrackerView mom={currentMom} />
        )}

        {/* Meeting Archive / Repository */}
        {activeView === 'archive' && (
          <MeetingArchiveModal
            minutesList={minutesList}
            currentMomId={currentMom.id}
            onSelectMeeting={handleSelectMeeting}
            onNewMeeting={handleNewMeeting}
            onDuplicateMeeting={handleDuplicateMeeting}
            onDeleteMeeting={handleDeleteMeeting}
            onImportJSON={handleImportJSON}
          />
        )}
      </main>

      {/* AI Assistant Modal */}
      <AIAssistModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onApplyData={handleApplyAIData}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-fade-in print:hidden">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
