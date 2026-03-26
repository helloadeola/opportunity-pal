import { motion } from "framer-motion";
import { sampleLeads } from "@/data/sampleLeads";
import LeadCard from "@/components/LeadCard";

const AllLeads = () => {
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
          {sampleLeads.length} people waiting to hear from you.
        </p>
      </motion.div>

      <div className="flex flex-col gap-3">
        {sampleLeads.map((lead, i) => (
          <LeadCard key={lead.id} lead={lead} index={i} />
        ))}
      </div>
    </div>
  );
};

export default AllLeads;
