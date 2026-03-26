import { Lead, getStatusLabel } from "@/data/sampleLeads";

const StatusBadge = ({ lead }: { lead: Lead }) => {
  const label = getStatusLabel(lead);
  const base = "text-xs font-bold px-3 py-1 rounded-full";

  if (lead.status === "overdue") {
    return <span className={`${base} bg-destructive/15 text-destructive`}>{label}</span>;
  }
  if (lead.status === "due-today") {
    return <span className={`${base} bg-warning/15 text-warning-foreground`}>{label}</span>;
  }
  return <span className={`${base} bg-primary/10 text-primary`}>{label}</span>;
};

export default StatusBadge;
