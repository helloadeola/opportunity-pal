import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Lead, sampleLeads } from "@/data/sampleLeads";

const STORAGE_KEY = "follow_through_leads";

const serializeLeads = (leads: Lead[]): string =>
  JSON.stringify(leads, (_, v) => (v instanceof Date ? v.toISOString() : v));

const deserializeLeads = (json: string): Lead[] => {
  const dateKeys = ["dueDate", "createdAt", "snoozedUntil", "lastContactDate", "dateCompleted"];
  return JSON.parse(json, (key, value) =>
    dateKeys.includes(key) && typeof value === "string" ? new Date(value) : value
  );
};

const loadLeads = (): Lead[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return deserializeLeads(stored);
  } catch {
    // corrupted data — fall through to defaults
  }
  return sampleLeads;
};

interface LeadsContextType {
  leads: Lead[];
  addLead: (lead: Omit<Lead, "id">) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  clearAllData: () => void;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const LeadsProvider = ({ children }: { children: ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>(loadLeads);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, serializeLeads(leads));
  }, [leads]);

  const addLead = useCallback((lead: Omit<Lead, "id">) => {
    const newLead: Lead = { ...lead, id: crypto.randomUUID() };
    setLeads((prev) => [newLead, ...prev]);
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  }, []);

  const clearAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("hasCompletedOnboarding");
    localStorage.removeItem("userName");
    setLeads(sampleLeads);
  }, []);

  return (
    <LeadsContext.Provider value={{ leads, addLead, updateLead, clearAllData }}>
      {children}
    </LeadsContext.Provider>
  );
};

export const useLeads = () => {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error("useLeads must be used within LeadsProvider");
  return ctx;
};
