export interface Lead {
  id: string;
  name: string;
  company: string;
  category: string;
  notes: string;
  dueDate: Date;
  status: "overdue" | "due-today" | "upcoming";
  createdAt: Date;
  snoozedUntil?: Date;
  reachedOut?: boolean;
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
    status: "overdue",
    createdAt: daysAgo(10),
  },
  {
    id: "2",
    name: "James",
    company: "Meta",
    category: "Warm Lead",
    notes: "Connected on LinkedIn, wants to discuss partnership",
    dueDate: today,
    status: "due-today",
    createdAt: daysAgo(3),
  },
  {
    id: "3",
    name: "Amanda",
    company: "Podcast Network",
    category: "Speaking Engagement",
    notes: "Invited to speak on creator economy podcast",
    dueDate: daysFromNow(2),
    status: "upcoming",
    createdAt: daysAgo(5),
  },
  {
    id: "4",
    name: "Marcus",
    company: "Creator Monetization",
    category: "Opportunity",
    notes: "Exploring potential collaboration on tools",
    dueDate: daysFromNow(5),
    status: "upcoming",
    createdAt: daysAgo(7),
  },
  {
    id: "5",
    name: "Fanta",
    company: "Creator Platform",
    category: "Partnership",
    notes: "Discussed co-marketing opportunity",
    dueDate: daysAgo(3),
    status: "overdue",
    createdAt: daysAgo(8),
  },
];

export const getStatusLabel = (lead: Lead): string => {
  const diffMs = lead.dueDate.getTime() - new Date().setHours(0, 0, 0, 0);
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""} overdue`;
  if (diffDays === 0) return "Due today";
  return `Due in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
};
