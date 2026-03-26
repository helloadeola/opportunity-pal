import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Lead } from "@/data/sampleLeads";
import StatusBadge from "./StatusBadge";

const LeadCard = ({ lead, index = 0 }: { lead: Lead; index?: number }) => {
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
      </div>
      <StatusBadge lead={lead} />
      <ChevronRight size={16} className="text-muted-foreground shrink-0" />
    </motion.button>
  );
};

export default LeadCard;
