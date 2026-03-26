import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, PenLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLeads } from "@/context/LeadsContext";
import { getLeadStatus } from "@/data/sampleLeads";
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
      return dateB - dateA;
    });

  return (
    <div className="safe-bottom px-4 py-6 max-w-[480px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <h1 className="text-[28px] font-bold text-foreground tracking-tight mb-5">
          All Leads
        </h1>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-5">
        <button
          onClick={() => setTab("active")}
          className={`flex-1 pb-2.5 text-[13px] font-semibold transition-colors duration-200 border-b-2 ${
            tab === "active"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Active ({activeLeads.length})
        </button>
        <button
          onClick={() => setTab("completed")}
          className={`flex-1 pb-2.5 text-[13px] font-semibold transition-colors duration-200 border-b-2 ${
            tab === "completed"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Completed ({completedLeads.length})
        </button>
      </div>

      {/* Active tab */}
      {tab === "active" && (
        <div className="flex flex-col gap-2.5">
          {activeLeads.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-12 bg-card rounded-xl border border-border shadow-card"
            >
              <p className="text-foreground font-semibold text-[15px]">You're all caught up!</p>
              <p className="text-muted-foreground text-[13px]">
                Add a new lead to get started.
              </p>
              <button
                onClick={() => navigate("/add")}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-semibold mt-3"
              >
                <PenLine size={14} /> Add Quick Note
              </button>
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
        <div className="flex flex-col gap-2.5">
          {completedLeads.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-12 bg-card rounded-xl border border-border shadow-card"
            >
              <p className="text-foreground font-semibold text-[15px]">No wins yet.</p>
              <p className="text-muted-foreground text-[13px]">
                Keep going — you'll get there.
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