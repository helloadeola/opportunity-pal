import { Lead, getLeadStatus, getStatusLabel } from "@/data/sampleLeads";

const StatusBadge = ({ lead }: { lead: Lead }) => {
  const status = getLeadStatus(lead);
  const label = getStatusLabel(lead);
  const base = "text-[11px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap border";

  if (status === "overdue") {
    return <span className={`${base} border-destructive/30 text-destructive bg-destructive/8`}>⏳ {label}</span>;
  }
  if (status === "due-today") {
    return <span className={`${base} border-warning/30 text-warning bg-warning/8`}>⏰ {label}</span>;
  }
  return <span className={`${base} border-muted-foreground/20 text-muted-foreground bg-muted`}>{label}</span>;
};

export default StatusBadge;