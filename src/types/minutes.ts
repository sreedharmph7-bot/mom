export interface Attendee {
  id: string;
  name: string;
  designation: string;
  department?: string;
}

export interface SubPoint {
  id: string;
  label: string; // e.g., 'A', 'B', 'C' or bullet
  title?: string;
  content: string;
  action?: string; // Optional specific action tag for this sub-point
}

export interface AgendaItem {
  id: string;
  itemNumber: number;
  title: string;
  summary?: string;
  subPoints: SubPoint[];
  action?: string; // e.g. "Action: Commissioner, H&FW & DPH"
  actionDueDate?: string;
}

export interface KeyDirection {
  id: string;
  label: string; // 'A', 'B', 'C'...
  title: string;
  content: string;
  action?: string;
}

export type MeetingStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'CIRCULATED';
export type ConfidentialityLevel = 'OFFICIAL' | 'RESTRICTED' | 'CONFIDENTIAL' | 'INTERNAL';

export interface MeetingMinutes {
  id: string;
  fileNumber?: string;
  meetingTitle: string;
  department: string;
  meetingDate: string; // Format: DD-MM-YYYY
  time?: string;
  venue?: string;
  reviewedBy: string; // e.g. "Sri Satya Kumar Yadav, Hon’ble Minister for Health, Medical & Family Welfare & Medical Education"
  inPresenceOf?: string; // e.g. "Sri G. Veerapandian, IAS, Secretary, Health, Medical & Family Welfare Department"
  attendees: Attendee[];
  itemsDiscussed: AgendaItem[];
  keyDirectionsTitle?: string; // e.g. "Key Directions / Inputs of the Hon'ble Minister for Health:"
  keyDirections: KeyDirection[];
  concludingDirective: string;
  status: MeetingStatus;
  confidentiality: ConfidentialityLevel;
  issuedBy?: string;
  copySubmittedTo?: string[];
  copyTo?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExtractedActionItem {
  id: string;
  meetingId: string;
  meetingTitle: string;
  sectionRef: string; // e.g., "Item 1", "Item 2.D", "Key Direction B"
  title: string;
  description: string;
  assignedTo: string;
  dueDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}
