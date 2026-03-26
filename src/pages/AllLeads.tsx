import { motion } from "framer-motion";
import { useLeads } from "@/context/LeadsContext";
import LeadCard from "@/components/LeadCard";

const AllLeads = () => {
  const { leads } = useLeads();

  return (
    <div className="safe-bottom px-5 py-6 max-w-[480px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-extrabold text-foreground mb-1">
          All Leads 📋
        </h1>
        <p className="text-muted-foreground font-medium mb-6">
          {leads.length} {leads.length === 1 ? "person" : "people"} waiting to hear from you.
        </p>
      </motion.div>

      <div className="flex flex-col gap-3">
        {leads.map((lead, i) => (
          <LeadCard key={lead.id} lead={lead} index={i} />
        ))}
      </div>
    </div>
  );
};

export default AllLeads;
