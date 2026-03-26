import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Lead } from "@/data/sampleLeads";
import StatusBadge from "./StatusBadge";

interface LeadCardProps {
  lead: Lead;
  index?: number;
  showCompleted?: boolean;
}

const LeadCard = ({ lead, index = 0, showCompleted = false }: LeadCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/leads/${lead.id}`)}
      className="w-full flex items-center gap-3 p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors text-left"
    >
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
        {lead.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-card-foreground truncate">{lead.name}</p>
        <p className="text-sm text-muted-foreground truncate">{lead.company}</p>
        {showCompleted && lead.dateCompleted && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(lead.dateCompleted, "MMM d, yyyy")}
          </p>
        )}
        {showCompleted && lead.outcomeNote && (
          <p className="text-xs text-muted-foreground truncate mt-0.5 italic">
            {lead.outcomeNote}
          </p>
        )}
      </div>
      {showCompleted ? (
        <span className="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap bg-emerald-500/15 text-emerald-600 flex items-center gap-1">
          <CheckCircle2 size={12} /> Done
        </span>
      ) : (
        <StatusBadge lead={lead} />
      )}
      <ChevronRight size={16} className="text-muted-foreground shrink-0" />
    </motion.button>
  );
};

export default LeadCard;
