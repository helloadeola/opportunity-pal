import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, CheckCircle2, Archive } from "lucide-react";
import { format } from "date-fns";
import { Lead } from "@/data/sampleLeads";
import StatusBadge from "./StatusBadge";

interface LeadCardProps {
  lead: Lead;
  index?: number;
  showCompleted?: boolean;
  showArchived?: boolean;
}

const LeadCard = ({ lead, index = 0, showCompleted = false, showArchived = false }: LeadCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      onClick={() => navigate(`/leads/${lead.id}`)}
      className="w-full flex items-center gap-3.5 p-4 bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover hover:bg-accent/40 transition-all duration-200 text-left group"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
        {lead.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-card-foreground truncate text-[15px] leading-tight">
          {lead.name}
        </p>
        <p className="text-[13px] text-muted-foreground truncate mt-0.5">
          {lead.company || "No company"}
        </p>
        {showCompleted && lead.dateCompleted && (
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {format(lead.dateCompleted, "MMM d, yyyy")}
          </p>
        )}
        {showCompleted && lead.outcomeNote && (
          <p className="text-[12px] text-muted-foreground truncate mt-0.5 italic">
            {lead.outcomeNote}
          </p>
        )}
        {showArchived && (
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Archived
          </p>
        )}
      </div>
      {showArchived ? (
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap bg-secondary text-muted-foreground border border-border flex items-center gap-1">
          <Archive size={11} /> Archived
        </span>
      ) : showCompleted ? (
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap bg-success/10 text-success border border-success/20 flex items-center gap-1">
          <CheckCircle2 size={11} /> Done
        </span>
      ) : (
        <StatusBadge lead={lead} />
      )}
      <ChevronRight size={14} className="text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground transition-colors" />
    </motion.button>
  );
};

export default LeadCard;