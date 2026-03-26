import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, PenLine, PartyPopper, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLeads } from "@/context/LeadsContext";
import { getLeadStatus, getDaysDiff } from "@/data/sampleLeads";
import LeadCard from "@/components/LeadCard";

type Tab = "active" | "completed";

const AllLeads = () => {
  const navigate = useNavigate();
  const { leads } = useLeads();
  const [tab, setTab] = useState<Tab>("active");

  const activeLeads = leads
    .filter((l) => !l.completed && !l.archived)
    .sort((a, b) => {
      const statusA = getLeadStatus(a);
      const statusB = getLeadStatus(b);
      const order = { overdue: 0, "due-today": 1, upcoming: 2 };
      if (order[statusA] !== order[statusB]) return order[statusA] - order[statusB];
      return a.dueDate.getTime() - b.dueDate.getTime();
    });

  const completedLeads = leads
    .filter((l) => l.completed)
    .sort((a, b) => {
      const dateA = a.dateCompleted?.getTime() || 0;
      const dateB = b.dateCompleted?.getTime() || 0;
      return dateB - dateA; // newest first
    });

  return (
    <div className="safe-bottom px-5 py-6 max-w-[480px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-extrabold text-foreground mb-4">
          All Leads 📋
        </h1>
      </motion.div>

      {/* Tabs */}
      <div className="flex bg-muted rounded-lg p-1 mb-6">
        <button
          onClick={() => setTab("active")}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-bold transition-colors ${
            tab === "active"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Active ({activeLeads.length})
        </button>
        <button
          onClick={() => setTab("completed")}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-bold transition-colors ${
            tab === "completed"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Completed ({completedLeads.length})
        </button>
      </div>

      {/* Active tab */}
      {tab === "active" && (
        <div className="flex flex-col gap-3">
          {activeLeads.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-10 bg-card rounded-xl border border-border"
            >
              <PartyPopper size={36} className="text-primary" />
              <p className="text-foreground font-bold">You're all caught up! 🎉</p>
              <p className="text-muted-foreground text-sm font-medium text-center px-6">
                Add a new lead to get started.
              </p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => navigate("/voice")}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 rounded-lg text-primary text-sm font-bold"
                >
                  <Mic size={16} /> Voice Note
                </button>
                <button
                  onClick={() => navigate("/add")}
                  className="flex items-center gap-1.5 px-4 py-2 bg-accent/10 rounded-lg text-accent text-sm font-bold"
                >
                  <PenLine size={16} /> Quick Note
                </button>
              </div>
            </motion.div>
          ) : (
            activeLeads.map((lead, i) => (
              <LeadCard key={lead.id} lead={lead} index={i} />
            ))
          )}
        </div>
      )}

      {/* Completed tab */}
      {tab === "completed" && (
        <div className="flex flex-col gap-3">
          {completedLeads.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-10 bg-card rounded-xl border border-border"
            >
              <Trophy size={36} className="text-muted-foreground" />
              <p className="text-foreground font-bold">No wins yet!</p>
              <p className="text-muted-foreground text-sm font-medium text-center px-6">
                Keep going — you'll be here soon. 💪
              </p>
            </motion.div>
          ) : (
            completedLeads.map((lead, i) => (
              <LeadCard key={lead.id} lead={lead} index={i} showCompleted />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AllLeads;
