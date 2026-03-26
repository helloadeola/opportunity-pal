export interface Lead {
  id: string;
  name: string;
  company: string;
  category: string;
  notes: string;
  dueDate: Date;
  createdAt: Date;
  snoozedUntil?: Date;
  reachedOut?: boolean;
  completed?: boolean;
  archived?: boolean;
  lastContactDate?: Date;
  dateCompleted?: Date;
  outcomeNote?: string;
  audioUrl?: string;
}

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d;
};
const daysFromNow = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d;
};

export const sampleLeads: Lead[] = [];

export type LeadStatus = "overdue" | "due-today" | "upcoming";

export const getDaysDiff = (lead: Lead): number => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const dueStart = new Date(lead.dueDate);
  dueStart.setHours(0, 0, 0, 0);
  return Math.round((dueStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
};

export const getLeadStatus = (lead: Lead): LeadStatus => {
  const diff = getDaysDiff(lead);
  if (diff < 0) return "overdue";
  if (diff === 0) return "due-today";
  return "upcoming";
};

export const getStatusLabel = (lead: Lead): string => {
  const diff = getDaysDiff(lead);
  if (diff < 0) return `${Math.abs(diff)} day${Math.abs(diff) > 1 ? "s" : ""} overdue`;
  if (diff === 0) return "Due today";
  return `In ${diff} day${diff > 1 ? "s" : ""}`;
};
