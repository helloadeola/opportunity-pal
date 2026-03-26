import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStatusLabel } from "@/data/sampleLeads";
import { useLeads } from "@/context/LeadsContext";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads } = useLeads();
  const lead = leads.find((l) => l.id === id);

  if (!lead) {
    return (
      <div className="safe-bottom px-5 py-6 max-w-[480px] mx-auto text-center">
        <p className="text-muted-foreground">Lead not found.</p>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="safe-bottom px-5 py-6 max-w-[480px] mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-6 font-semibold text-sm"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-extrabold text-xl">
            {lead.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">{lead.name}</h1>
            <p className="text-muted-foreground font-medium">{lead.company}</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
            <span className="text-sm font-bold text-muted-foreground">Status</span>
            <StatusBadge lead={lead} />
          </div>
          <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
            <span className="text-sm font-bold text-muted-foreground">Category</span>
            <span className="text-sm font-bold text-foreground">{lead.category}</span>
          </div>
          {lead.notes && (
            <div className="p-4 bg-card rounded-lg border border-border">
              <span className="text-sm font-bold text-muted-foreground block mb-2">Notes</span>
              <p className="text-sm text-foreground">{lead.notes}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            size="lg"
            onClick={() => toast.success("Marked as reached out! Great job! 🎉")}
            className="font-bold"
          >
            <Send size={18} className="mr-2" />
            Reached Out
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => toast.success("Snoozed for 3 days. We'll remind you! 😴")}
            className="font-bold"
          >
            <Clock size={18} className="mr-2" />
            Snooze
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default LeadDetail;
