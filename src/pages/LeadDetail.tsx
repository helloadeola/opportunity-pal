import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ArrowLeft, Send, Clock, CheckCircle2, CalendarClock, ArrowRight, CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getStatusLabel, getLeadStatus } from "@/data/sampleLeads";
import { useLeads } from "@/context/LeadsContext";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ActionSheet = null | "reached-out" | "snooze" | "reschedule";

const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, updateLead } = useLeads();
  const lead = leads.find((l) => l.id === id);
  const [activeSheet, setActiveSheet] = useState<ActionSheet>(null);
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);

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

  const status = getLeadStatus(lead);

  const handleSnooze = (days: number) => {
    updateLead(lead.id, { dueDate: daysFromNow(days) });
    setActiveSheet(null);
    toast.success(`Snoozed for ${days} day${days > 1 ? "s" : ""}. We'll remind you! 😴`);
  };

  const handleSnoozeCustom = () => {
    if (!customDate) return;
    updateLead(lead.id, { dueDate: customDate });
    setActiveSheet(null);
    setCustomDate(undefined);
    toast.success(`Snoozed until ${format(customDate, "MMM d")}. You're on it! 📅`);
  };

  const handleMarkCompleted = () => {
    updateLead(lead.id, { completed: true, lastContactDate: new Date(), reachedOut: true });
    setActiveSheet(null);
    toast.success("Amazing! Marked as completed! 🎉🎉🎉");
    navigate("/");
  };

  const handleReachedOutSnooze = () => {
    updateLead(lead.id, { lastContactDate: new Date(), reachedOut: true });
    setActiveSheet("snooze");
  };

  const handleKeepFollowing = () => {
    updateLead(lead.id, { lastContactDate: new Date(), reachedOut: true });
    setActiveSheet("reschedule");
  };

  const handleReschedule = (days: number) => {
    updateLead(lead.id, { dueDate: daysFromNow(days) });
    setActiveSheet(null);
    toast.success(`You're doing great! We'll check in again in ${days} day${days > 1 ? "s" : ""}. 💪`);
  };

  return (
    <div className="safe-bottom px-5 py-6 max-w-[480px] mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-6 font-semibold text-sm"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-extrabold text-xl shrink-0">
            {lead.name[0]}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold text-foreground truncate">{lead.name}</h1>
            {lead.company && (
              <p className="text-muted-foreground font-medium truncate">{lead.company}</p>
            )}
          </div>
        </div>

        {/* Completed banner */}
        {lead.completed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20 flex items-center gap-2"
          >
            <CheckCircle2 size={18} className="text-success" />
            <span className="text-sm font-bold text-success">Completed! You nailed it! 🎉</span>
          </motion.div>
        )}

        {/* Info cards */}
        <div className="space-y-3 mt-6 mb-6">
          <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
            <span className="text-sm font-bold text-muted-foreground">Status</span>
            {lead.completed ? (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-success/15 text-success">Completed</span>
            ) : (
              <StatusBadge lead={lead} />
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
            <span className="text-sm font-bold text-muted-foreground">Category</span>
            <span className="text-sm font-bold text-foreground">{lead.category}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
            <span className="text-sm font-bold text-muted-foreground">Added</span>
            <span className="text-sm font-medium text-foreground">
              {format(lead.createdAt, "MMM d, yyyy")}
            </span>
          </div>

          {lead.lastContactDate && (
            <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
              <span className="text-sm font-bold text-muted-foreground">Last Contact</span>
              <span className="text-sm font-medium text-foreground">
                {format(lead.lastContactDate, "MMM d, yyyy")}
              </span>
            </div>
          )}

          {!lead.completed && (
            <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
              <span className="text-sm font-bold text-muted-foreground">Follow-up</span>
              <span className="text-sm font-medium text-foreground">
                {format(lead.dueDate, "MMM d, yyyy")}
              </span>
            </div>
          )}

          {lead.audioUrl && (
            <div className="p-4 bg-card rounded-lg border border-border">
              <span className="text-sm font-bold text-muted-foreground block mb-2">🎙️ Voice Note</span>
              <audio src={lead.audioUrl} controls className="w-full h-10" />
            </div>
          )}

          {lead.notes && (
            <div className="p-4 bg-card rounded-lg border border-border">
              <span className="text-sm font-bold text-muted-foreground block mb-2">Notes</span>
              <p className="text-sm text-foreground leading-relaxed">{lead.notes}</p>
            </div>
          )}
        </div>

        {/* Action buttons - only show if not completed */}
        {!lead.completed && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button size="lg" className="font-bold" onClick={() => setActiveSheet("reached-out")}>
              <Send size={18} className="mr-2" />
              Reached Out
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="font-bold"
              onClick={() => setActiveSheet("snooze")}
            >
              <Clock size={18} className="mr-2" />
              Snooze
            </Button>
          </div>
        )}
      </motion.div>

      {/* Action Sheets Overlay */}
      <AnimatePresence>
        {activeSheet && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/30 flex items-end justify-center"
            onClick={() => { setActiveSheet(null); setCustomDate(undefined); }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[480px] bg-card rounded-t-2xl border-t border-border p-5 pb-10"
            >
              {/* Close button */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-extrabold text-foreground">
                  {activeSheet === "reached-out" && "Nice work! What's next? 🙌"}
                  {activeSheet === "snooze" && "When should we remind you? 😴"}
                  {activeSheet === "reschedule" && "When should we check in again? 📅"}
                </h3>
                <button
                  onClick={() => { setActiveSheet(null); setCustomDate(undefined); }}
                  className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Reached Out options */}
              {activeSheet === "reached-out" && (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleReachedOutSnooze}
                    className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <Clock size={20} className="text-primary shrink-0" />
                    <div>
                      <p className="font-bold text-foreground text-sm">Snooze it</p>
                      <p className="text-xs text-muted-foreground">Pick a new follow-up date</p>
                    </div>
                  </button>
                  <button
                    onClick={handleMarkCompleted}
                    className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <CheckCircle2 size={20} className="text-success shrink-0" />
                    <div>
                      <p className="font-bold text-foreground text-sm">Mark as completed</p>
                      <p className="text-xs text-muted-foreground">We got the deal/opportunity! 🎉</p>
                    </div>
                  </button>
                  <button
                    onClick={handleKeepFollowing}
                    className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <ArrowRight size={20} className="text-accent shrink-0" />
                    <div>
                      <p className="font-bold text-foreground text-sm">Keep following up</p>
                      <p className="text-xs text-muted-foreground">Reschedule the next check-in</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Snooze options */}
              {activeSheet === "snooze" && (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleSnooze(1)}
                    className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <CalendarClock size={20} className="text-primary shrink-0" />
                    <div>
                      <p className="font-bold text-foreground text-sm">Snooze 1 day</p>
                      <p className="text-xs text-muted-foreground">Remind me tomorrow</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleSnooze(3)}
                    className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <CalendarClock size={20} className="text-primary shrink-0" />
                    <div>
                      <p className="font-bold text-foreground text-sm">Snooze 3 days</p>
                      <p className="text-xs text-muted-foreground">Check back in a few days</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleSnooze(7)}
                    className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <CalendarClock size={20} className="text-primary shrink-0" />
                    <div>
                      <p className="font-bold text-foreground text-sm">Snooze 1 week</p>
                      <p className="text-xs text-muted-foreground">Come back to this next week</p>
                    </div>
                  </button>
                  <div className="pt-2 border-t border-border mt-1">
                    <p className="text-xs font-bold text-muted-foreground mb-2">Pick a custom date</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-medium",
                            !customDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon size={16} className="mr-2" />
                          {customDate ? format(customDate, "MMM d, yyyy") : "Choose a date..."}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="center">
                        <Calendar
                          mode="single"
                          selected={customDate}
                          onSelect={setCustomDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    {customDate && (
                      <Button
                        size="lg"
                        className="w-full mt-3 font-bold"
                        onClick={handleSnoozeCustom}
                      >
                        Got it! Snooze until {format(customDate, "MMM d")} 👍
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Reschedule options */}
              {activeSheet === "reschedule" && (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleReschedule(3)}
                    className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <CalendarClock size={20} className="text-primary shrink-0" />
                    <div>
                      <p className="font-bold text-foreground text-sm">In 3 days</p>
                      <p className="text-xs text-muted-foreground">Quick follow-up</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleReschedule(7)}
                    className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <CalendarClock size={20} className="text-primary shrink-0" />
                    <div>
                      <p className="font-bold text-foreground text-sm">In 1 week</p>
                      <p className="text-xs text-muted-foreground">Give it a bit of time</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleReschedule(14)}
                    className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <CalendarClock size={20} className="text-primary shrink-0" />
                    <div>
                      <p className="font-bold text-foreground text-sm">In 2 weeks</p>
                      <p className="text-xs text-muted-foreground">Circle back later</p>
                    </div>
                  </button>
                  <div className="pt-2 border-t border-border mt-1">
                    <p className="text-xs font-bold text-muted-foreground mb-2">Pick a custom date</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-medium",
                            !customDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon size={16} className="mr-2" />
                          {customDate ? format(customDate, "MMM d, yyyy") : "Choose a date..."}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="center">
                        <Calendar
                          mode="single"
                          selected={customDate}
                          onSelect={setCustomDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    {customDate && (
                      <Button
                        size="lg"
                        className="w-full mt-3 font-bold"
                        onClick={() => {
                          if (!customDate) return;
                          updateLead(lead.id, { dueDate: customDate });
                          setActiveSheet(null);
                          setCustomDate(undefined);
                          toast.success(`You're doing great! We'll check in on ${format(customDate, "MMM d")}. 💪`);
                        }}
                      >
                        Got it! Check in on {format(customDate, "MMM d")} 💪
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeadDetail;
