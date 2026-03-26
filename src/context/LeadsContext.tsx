import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Lead, sampleLeads } from "@/data/sampleLeads";

interface LeadsContextType {
  leads: Lead[];
  addLead: (lead: Omit<Lead, "id">) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const LeadsProvider = ({ children }: { children: ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>(sampleLeads);

  const addLead = useCallback((lead: Omit<Lead, "id">) => {
    const newLead: Lead = {
      ...lead,
      id: crypto.randomUUID(),
    };
    setLeads((prev) => [newLead, ...prev]);
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  }, []);

  return (
    <LeadsContext.Provider value={{ leads, addLead, updateLead }}>
      {children}
    </LeadsContext.Provider>
  );
};

export const useLeads = () => {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error("useLeads must be used within LeadsProvider");
  return ctx;
};
