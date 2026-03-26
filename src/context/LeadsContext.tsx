import { createContext, useContext, useState, ReactNode } from "react";
import { Lead, sampleLeads } from "@/data/sampleLeads";

interface LeadsContextType {
  leads: Lead[];
  addLead: (lead: Omit<Lead, "id">) => void;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const LeadsProvider = ({ children }: { children: ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>(sampleLeads);

  const addLead = (lead: Omit<Lead, "id">) => {
    const newLead: Lead = {
      ...lead,
      id: crypto.randomUUID(),
    };
    setLeads((prev) => [newLead, ...prev]);
  };

  return (
    <LeadsContext.Provider value={{ leads, addLead }}>
      {children}
    </LeadsContext.Provider>
  );
};

export const useLeads = () => {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error("useLeads must be used within LeadsProvider");
  return ctx;
};
