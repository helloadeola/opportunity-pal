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

export const sampleLeads: Lead[] = [
  {
    id: "1",
    name: "Sarah",
    company: "TechCrunch",
    category: "Opportunity",
    notes: "Met at conference, interested in feature article",
    dueDate: daysAgo(5),
    createdAt: daysAgo(10),
  },
  {
    id: "2",
    name: "James",
    company: "Meta",
    category: "Warm Lead",
    notes: "Connected on LinkedIn, wants to discuss partnership",
    dueDate: today,
    createdAt: daysAgo(3),
  },
  {
    id: "3",
    name: "Amanda",
    company: "Podcast Network",
    category: "Speaking Engagement",
    notes: "Invited to speak on creator economy podcast",
    dueDate: daysFromNow(2),
    createdAt: daysAgo(5),
  },
  {
    id: "4",
    name: "Marcus",
    company: "Creator Monetization",
    category: "Opportunity",
    notes: "Exploring potential collaboration on tools",
    dueDate: daysFromNow(5),
    createdAt: daysAgo(7),
  },
  {
    id: "5",
    name: "Fanta",
    company: "Creator Platform",
    category: "Partnership",
    notes: "Discussed co-marketing opportunity",
    dueDate: daysAgo(3),
    createdAt: daysAgo(8),
  },
];

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
