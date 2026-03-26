/**
 * Smart extraction: parse a voice note transcript to extract
 * name, company, category, and follow-up date.
 */

export interface ExtractedData {
  name: string;
  company: string;
  category: string;
  dueDate: Date;
  dueDateLabel: string;
}

const categoryKeywords: Record<string, string[]> = {
  Opportunity: ["opportunity", "potential", "deal", "business"],
  "Warm Lead": ["warm", "connection", "connected", "vibe", "interested", "intro"],
  "Speaking Engagement": ["speaking", "talk", "panel", "event", "keynote", "podcast", "conference", "stage"],
  Partnership: ["partnership", "partner", "collaborate", "collaboration", "co-market", "joint"],
  Collaboration: ["collab", "project together", "work together", "team up"],
};

// Common company name indicators
const knownCompanies = [
  "Google", "Meta", "Apple", "Amazon", "Microsoft", "Netflix", "Spotify",
  "TechCrunch", "Forbes", "Bloomberg", "Tesla", "OpenAI", "Stripe", "Shopify",
  "Uber", "Airbnb", "Twitter", "LinkedIn", "Slack", "Zoom", "Figma",
  "Notion", "Canva", "Adobe", "Salesforce", "HubSpot", "TikTok", "Snap",
  "Pinterest", "Reddit", "Discord", "Twitch", "YouTube",
];

const titleWords = new Set([
  "ceo", "cto", "cfo", "coo", "vp", "director", "manager", "founder",
  "cofounder", "co-founder", "president", "head", "lead", "chief",
  "engineer", "designer", "developer", "analyst", "consultant",
  "i", "we", "they", "he", "she", "it", "the", "a", "an", "my",
  "about", "with", "and", "but", "for", "that", "this", "just",
  "really", "also", "very", "today", "tomorrow", "next", "last",
]);

function extractName(text: string): string {
  const lower = text.toLowerCase();

  // Pattern: "met [Name]", "spoke with [Name]", "talked to [Name]"
  const metPatterns = [
    /\b(?:met|met with|spoke with|spoke to|talked to|talking to|chatted with|connected with|meeting with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
  ];

  for (const pattern of metPatterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const name = match[1].trim();
      if (!titleWords.has(name.toLowerCase())) return name;
    }
  }

  // Pattern: "[Name] from [Company]"
  const fromPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+from\s+/;
  const fromMatch = text.match(fromPattern);
  if (fromMatch?.[1]) {
    const name = fromMatch[1].trim();
    if (!titleWords.has(name.toLowerCase()) && !lower.startsWith(name.toLowerCase())) {
      return name;
    }
  }

  // Pattern: "his/her name is [Name]", "[Name] is the/a"
  const nameIsPattern = /\bname\s+is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/;
  const nameIsMatch = text.match(nameIsPattern);
  if (nameIsMatch?.[1]) return nameIsMatch[1].trim();

  return "";
}

function extractCompany(text: string): string {
  // Pattern: "from [Company]", "at [Company]", "works at [Company]"
  const fromPatterns = [
    /\b(?:from|at|works at|working at|over at|with)\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,2})/,
  ];

  for (const pattern of fromPatterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const company = match[1].trim();
      // Don't return common non-company words
      if (!titleWords.has(company.toLowerCase()) && company.length > 1) {
        return company;
      }
    }
  }

  // Check for known company names
  const lower = text.toLowerCase();
  for (const company of knownCompanies) {
    if (lower.includes(company.toLowerCase())) return company;
  }

  return "";
}

function extractCategory(text: string): string {
  const lower = text.toLowerCase();

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) return category;
    }
  }

  return "Other";
}

function extractDueDate(text: string): { date: Date; label: string } {
  const lower = text.toLowerCase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const addDays = (n: number): Date => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  // "tomorrow"
  if (lower.includes("tomorrow")) {
    return { date: addDays(1), label: "Tomorrow (from transcript)" };
  }

  // "in X days"
  const inDaysMatch = lower.match(/in\s+(\d+)\s+days?/);
  if (inDaysMatch) {
    const n = parseInt(inDaysMatch[1], 10);
    if (n > 0 && n <= 90) {
      return { date: addDays(n), label: `In ${n} day${n > 1 ? "s" : ""} (from transcript)` };
    }
  }

  // "next week" / "this week"
  if (lower.includes("next week")) {
    return { date: addDays(7), label: "Next week (from transcript)" };
  }
  if (lower.includes("this week")) {
    return { date: addDays(3), label: "This week (from transcript)" };
  }

  // "end of week" / "friday"
  if (lower.includes("end of week") || lower.includes("friday")) {
    const dayOfWeek = today.getDay();
    const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 6;
    return { date: addDays(daysUntilFriday || 7), label: "End of week (from transcript)" };
  }

  // "next month"
  if (lower.includes("next month")) {
    return { date: addDays(30), label: "Next month (from transcript)" };
  }

  // "couple days" / "few days"
  if (lower.includes("couple days") || lower.includes("couple of days")) {
    return { date: addDays(2), label: "In 2 days (from transcript)" };
  }
  if (lower.includes("few days")) {
    return { date: addDays(3), label: "In 3 days (from transcript)" };
  }

  // Default: 3 days
  return { date: addDays(3), label: "Default: 3 days from now" };
}

export function extractFromTranscript(transcript: string): ExtractedData {
  const name = extractName(transcript);
  const company = extractCompany(transcript);
  const category = extractCategory(transcript);
  const { date, label } = extractDueDate(transcript);

  return {
    name,
    company,
    category,
    dueDate: date,
    dueDateLabel: label,
  };
}
