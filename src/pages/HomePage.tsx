import { useState } from "react";
import { getLeadStatus } from "@/data/sampleLeads";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, PenLine, PartyPopper, Settings, Trash2, X } from "lucide-react";
import { useLeads } from "@/context/LeadsContext";
import LeadCard from "@/components/LeadCard";
import { toast } from "sonner";

const HomePage = () => {
  const navigate = useNavigate();
  const { leads } = useLeads();

  const followUps = leads
    .filter((l) => {
      if (l.completed) return false;
      const status = getLeadStatus(l);
      if (status === "overdue" || status === "due-today") return true;
      // upcoming but within 3 days
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const dueStart = new Date(l.dueDate);
      dueStart.setHours(0, 0, 0, 0);
      const diff = Math.round((dueStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 3;
    })
    .sort((a, b) => {
      const statusA = getLeadStatus(a);
      const statusB = getLeadStatus(b);
      const order = { overdue: 0, "due-today": 1, upcoming: 2 };
      if (order[statusA] !== order[statusB]) return order[statusA] - order[statusB];
      // within same group: overdue = oldest first (earliest due), others = soonest first
      return a.dueDate.getTime() - b.dueDate.getTime();
    });

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
          {followUps.length > 0
            ? "You've got this. Here's who needs you today."
            : "Looking good! Nothing urgent right now."}
        </p>
      </motion.div>

      <section className="mb-8">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Today's Follow-Ups
        </h2>
        <div className="flex flex-col gap-3">
          {followUps.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-8 bg-card rounded-xl border border-border"
            >
              <PartyPopper size={36} className="text-primary" />
              <p className="text-foreground font-bold">You're all caught up! 🎉</p>
              <p className="text-muted-foreground text-sm font-medium">
                No follow-ups due right now. Go relax!
              </p>
            </motion.div>
          ) : (
            followUps.map((lead, i) => (
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
