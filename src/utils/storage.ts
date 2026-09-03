import { MeetingMinutes, ExtractedActionItem } from '../types/minutes';
import { GODAVARI_PUSHKARALU_MINUTES } from '../data/sampleMinutes';

const STORAGE_KEY = 'cms_meeting_minutes_list_v1';
const CURRENT_ID_KEY = 'cms_current_active_mom_id_v1';

export function getAllStoredMinutes(): MeetingMinutes[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with official sample
      const initial = [GODAVARI_PUSHKARALU_MINUTES];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [GODAVARI_PUSHKARALU_MINUTES];
    }
    return parsed;
  } catch (err) {
    console.error('Failed to parse stored minutes:', err);
    return [GODAVARI_PUSHKARALU_MINUTES];
  }
}

export function saveMinutesList(list: MeetingMinutes[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save minutes list:', err);
  }
}

export function saveSingleMinutes(mom: MeetingMinutes): void {
  const all = getAllStoredMinutes();
  const idx = all.findIndex((m) => m.id === mom.id);
  const updatedMom = { ...mom, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    all[idx] = updatedMom;
  } else {
    all.unshift(updatedMom);
  }
  saveMinutesList(all);
}

export function deleteMinutes(id: string): MeetingMinutes[] {
  const all = getAllStoredMinutes();
  const filtered = all.filter((m) => m.id !== id);
  saveMinutesList(filtered);
  return filtered;
}

export function getActiveMinutesId(): string {
  try {
    return localStorage.getItem(CURRENT_ID_KEY) || GODAVARI_PUSHKARALU_MINUTES.id;
  } catch {
    return GODAVARI_PUSHKARALU_MINUTES.id;
  }
}

export function setActiveMinutesId(id: string): void {
  try {
    localStorage.setItem(CURRENT_ID_KEY, id);
  } catch (err) {
    console.error(err);
  }
}

/**
 * Extracts all Action Points from a Meeting Minutes instance for action tracking
 */
export function extractActionItemsFromMeeting(mom: MeetingMinutes): ExtractedActionItem[] {
  const actions: ExtractedActionItem[] = [];

  // From items discussed
  mom.itemsDiscussed.forEach((item) => {
    if (item.action && item.action.trim()) {
      actions.push({
        id: `act-${item.id}-main`,
        meetingId: mom.id,
        meetingTitle: mom.meetingTitle,
        sectionRef: `Item ${item.itemNumber}`,
        title: item.title,
        description: item.summary ? item.summary.slice(0, 140) + '...' : item.title,
        assignedTo: item.action.replace(/^Action:\s*/i, '').trim(),
        dueDate: item.actionDueDate,
        status: 'PENDING',
      });
    }

    item.subPoints.forEach((sp) => {
      if (sp.action && sp.action.trim()) {
        actions.push({
          id: `act-${sp.id}`,
          meetingId: mom.id,
          meetingTitle: mom.meetingTitle,
          sectionRef: `Item ${item.itemNumber}.${sp.label}`,
          title: sp.title || `${item.title} (${sp.label})`,
          description: sp.content,
          assignedTo: sp.action.replace(/^Action:\s*/i, '').trim(),
          status: 'PENDING',
        });
      }
    });
  });

  // From key directions
  mom.keyDirections.forEach((kd) => {
    if (kd.action && kd.action.trim()) {
      actions.push({
        id: `act-${kd.id}`,
        meetingId: mom.id,
        meetingTitle: mom.meetingTitle,
        sectionRef: `Direction ${kd.label}`,
        title: kd.title,
        description: kd.content,
        assignedTo: kd.action.replace(/^Action:\s*/i, '').trim(),
        status: 'PENDING',
      });
    }
  });

  return actions;
}

/**
 * Generates an official formatted plain text version
 */
export function generatePlainTextMinutes(mom: MeetingMinutes): string {
  let out = '';
  out += `MINUTES OF MEETING – ${mom.meetingTitle.toUpperCase()}\n`;
  if (mom.department) out += `(${mom.department})\n`;
  out += `Date:- ${mom.meetingDate}\n`;
  if (mom.venue) out += `Venue: ${mom.venue}\n`;
  out += `\nReviewed by: ${mom.reviewedBy}\n`;
  if (mom.inPresenceOf) out += `In the presence of: ${mom.inPresenceOf}\n`;
  out += `\nOfficers and Officials Attended:\n`;
  mom.attendees.forEach((att, idx) => {
    out += `${idx + 1}. ${att.name}, ${att.designation}${att.department ? ` (${att.department})` : ''}\n`;
  });

  out += `\nItems Discussed:\n`;
  mom.itemsDiscussed.forEach((item) => {
    out += `\n${item.itemNumber}. ${item.title}:\n`;
    if (item.summary) out += `${item.summary}\n`;
    if (item.subPoints && item.subPoints.length > 0) {
      item.subPoints.forEach((sp) => {
        const titlePart = sp.title ? `${sp.title}:\n` : '';
        out += `${sp.label}. ${titlePart}${sp.content}\n`;
        if (sp.action) {
          out += `Action: ${sp.action.replace(/^Action:\s*/i, '')}\n`;
        }
      });
    }
    if (item.action) {
      out += `Action: ${item.action.replace(/^Action:\s*/i, '')}\n`;
    }
  });

  if (mom.keyDirections && mom.keyDirections.length > 0) {
    out += `\n${mom.keyDirectionsTitle || "Key Directions / Inputs of the Hon'ble Minister / Chair:"}\n`;
    mom.keyDirections.forEach((kd) => {
      out += `${kd.label}. ${kd.title}:\n${kd.content}\n`;
      if (kd.action) {
        out += `Action: ${kd.action.replace(/^Action:\s*/i, '')}\n`;
      }
    });
  }

  if (mom.concludingDirective) {
    out += `\n${mom.concludingDirective}\n`;
  }

  if (mom.issuedBy) {
    out += `\nIssued by: ${mom.issuedBy}\n`;
  }

  return out;
}

/**
 * Downloads meeting minutes as Microsoft Word-compatible HTML file
 */
export function downloadAsWordDoc(mom: MeetingMinutes): void {
  const content = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${mom.meetingTitle}</title>
      <style>
        body { font-family: "Calibri", "Arial", sans-serif; font-size: 11pt; line-height: 1.4; color: #000; margin: 1in; }
        .header-title { font-weight: bold; font-size: 13pt; text-align: center; margin-bottom: 2px; }
        .dept-title { font-weight: bold; font-size: 11pt; text-align: center; margin-bottom: 12px; }
        .date-line { font-weight: bold; text-align: right; margin-bottom: 14px; }
        .section-label { font-weight: bold; margin-top: 10px; margin-bottom: 4px; }
        .attendees-list { margin-left: 20px; }
        .item-heading { font-weight: bold; margin-top: 16px; margin-bottom: 6px; }
        .sub-heading { font-weight: bold; margin-top: 8px; margin-bottom: 4px; }
        .action-tag { font-weight: bold; text-align: right; margin-top: 6px; margin-bottom: 12px; }
        .concluding { font-weight: bold; margin-top: 20px; line-height: 1.4; }
      </style>
    </head>
    <body>
      <div class="header-title">MINUTES OF MEETING – ${mom.meetingTitle.toUpperCase()}</div>
      <div class="dept-title">(${mom.department})</div>
      <div class="date-line">Date:- ${mom.meetingDate}</div>

      <p><b>Reviewed by:</b> ${mom.reviewedBy}</p>
      ${mom.inPresenceOf ? `<p><b>In the presence of:</b> ${mom.inPresenceOf}</p>` : ''}

      <div class="section-label">Officers and Officials Attended:</div>
      <ol class="attendees-list">
        ${mom.attendees.map((a) => `<li>${a.name}, ${a.designation}${a.department ? ` (${a.department})` : ''}</li>`).join('')}
      </ol>

      <div class="section-label" style="margin-top: 18px;">Items Discussed:</div>
      ${mom.itemsDiscussed
        .map(
          (item) => `
        <div class="item-heading">${item.itemNumber}. ${item.title}:</div>
        ${item.summary ? `<p>${item.summary.replace(/\n/g, '<br>')}</p>` : ''}
        ${
          item.subPoints && item.subPoints.length > 0
            ? item.subPoints
                .map(
                  (sp) => `
              <div style="margin-left: 15px; margin-top: 8px;">
                <b>${sp.label}. ${sp.title ? `${sp.title}:` : ''}</b>
                <p style="margin-top: 2px;">${sp.content.replace(/\n/g, '<br>')}</p>
                ${sp.action ? `<div class="action-tag"><b>Action: ${sp.action.replace(/^Action:\s*/i, '')}</b></div>` : ''}
              </div>
            `,
                )
                .join('')
            : ''
        }
        ${item.action ? `<div class="action-tag"><b>Action: ${item.action.replace(/^Action:\s*/i, '')}</b></div>` : ''}
      `,
        )
        .join('')}

      ${
        mom.keyDirections && mom.keyDirections.length > 0
          ? `
        <div class="item-heading" style="margin-top: 20px;">${mom.keyDirectionsTitle || "Key Directions / Inputs of the Hon'ble Minister for Health:"}</div>
        ${mom.keyDirections
          .map(
            (kd) => `
          <div style="margin-left: 15px; margin-top: 10px;">
            <b>${kd.label}. ${kd.title}:</b>
            <p style="margin-top: 2px;">${kd.content.replace(/\n/g, '<br>')}</p>
            ${kd.action ? `<div class="action-tag"><b>Action: ${kd.action.replace(/^Action:\s*/i, '')}</b></div>` : ''}
          </div>
        `,
          )
          .join('')}
      `
          : ''
      }

      <div class="concluding">${mom.concludingDirective}</div>
    </body>
    </html>
  `;

  const blob = new Blob([content], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${mom.meetingTitle.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40)}_MoM.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
