import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, PenLine } from "lucide-react";
import { useLeads } from "@/context/LeadsContext";
import LeadCard from "@/components/LeadCard";

const HomePage = () => {
  const navigate = useNavigate();
  const { leads } = useLeads();
  const urgentLeads = leads
    .filter((l) => l.status === "overdue" || l.status === "due-today" || l.status === "upcoming")
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return (
    <div className="safe-bottom px-5 py-6 max-w-[480px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Follow Through ✨
        </h1>
        <p className="text-muted-foreground mt-1 font-medium">
          You've got this. Here's who needs you today.
        </p>
      </motion.div>

      <section className="mb-8">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Today's Follow-Ups
        </h2>
        <div className="flex flex-col gap-3">
          {urgentLeads.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              All clear! No follow-ups right now 🎉
            </p>
          ) : (
            urgentLeads.map((lead, i) => (
              <LeadCard key={lead.id} lead={lead} index={i} />
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Capture
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/voice")}
            className="flex flex-col items-center gap-2 p-5 bg-primary/10 rounded-xl border border-primary/20 hover:bg-primary/15 transition-colors"
          >
            <Mic size={28} className="text-primary" />
            <span className="font-bold text-primary text-sm">Voice Note</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/add")}
            className="flex flex-col items-center gap-2 p-5 bg-accent/10 rounded-xl border border-accent/20 hover:bg-accent/15 transition-colors"
          >
            <PenLine size={28} className="text-accent" />
            <span className="font-bold text-accent text-sm">Quick Note</span>
          </motion.button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
