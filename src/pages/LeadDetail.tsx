import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowLeft, CheckCircle2, CalendarClock,
  ArrowRight, Play, Pause, Archive,
  ArchiveRestore, RotateCcw, Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDaysDiff, type Lead } from "@/data/sampleLeads";
import { useLeads } from "@/context/LeadsContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ActionSheet = null | "reached-out" | "snooze" | "reschedule" | "completing";

const daysFromNow = (n: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [outcomeNote, setOutcomeNote] = useState("");
  const [reachedOutMode, setReachedOutMode] = useState<"schedule-next" | "keep-following" | null>(null);
  const [sheetError, setSheetError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!lead) {
    return (
      <div className="safe-bottom px-4 py-6 max-w-[480px] mx-auto text-center">
        <p className="text-muted-foreground text-[14px]">Lead not found.</p>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">Go back</Button>
      </div>
    );
  }

  const daysDiff = getDaysDiff(lead);
  const followUpLabel = daysDiff < 0
    ? `Overdue by ${Math.abs(daysDiff)} day${Math.abs(daysDiff) > 1 ? "s" : ""}`
    : daysDiff === 0 ? "Due today"
    : `In ${daysDiff} day${daysDiff > 1 ? "s" : ""}`;
  const followUpColor = daysDiff < 0 ? "text-destructive" : daysDiff === 0 ? "text-warning" : "text-muted-foreground";

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause(); else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const startEditNotes = () => { setNotesValue(lead.notes || ""); setEditingNotes(true); };
  const saveNotes = () => {
    updateLead(lead.id, { notes: notesValue.trim().slice(0, 1000) });
    setEditingNotes(false);
    toast.success("Notes updated.");
  };

  const resetSheetState = () => {
    setActiveSheet(null);
    setCustomDate(undefined);
    setOutcomeNote("");
    setReachedOutMode(null);
    setSheetError("");
  };

  const getSuggestedFollowUpDate = () => {
    const today = daysFromNow(0);
    const dueDate = new Date(lead.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate.getTime() <= today.getTime() ? daysFromNow(1) : dueDate;
  };

  const openFollowUpPicker = (mode: "snooze" | "schedule-next" | "keep-following") => {
    setSheetError("");
    setOutcomeNote("");
    setCustomDate(getSuggestedFollowUpDate());
    setReachedOutMode(mode === "snooze" ? null : mode);
    setActiveSheet(mode === "snooze" ? "snooze" : "reschedule");
  };

  const applyFollowUpDate = (date?: Date) => {
    if (!date) {
      const message = "Choose a follow-up date to continue.";
      setSheetError(message);
      toast.error(message);
      return;
    }

    const nextDate = new Date(date);
    nextDate.setHours(0, 0, 0, 0);

    const updates: Partial<Lead> = { dueDate: nextDate };

    if (activeSheet === "reschedule") {
      updates.lastContactDate = new Date();
      updates.reachedOut = true;
    }

    updateLead(lead.id, updates);
    resetSheetState();
    toast.success(`Lead rescheduled to ${format(nextDate, "MMMM d")}.`);
  };

  const handleMarkCompleted = () => {
    updateLead(lead.id, {
      completed: true,
      lastContactDate: new Date(),
      reachedOut: true,
      dateCompleted: new Date(),
      outcomeNote: outcomeNote.trim().slice(0, 200) || undefined,
    });
    resetSheetState();
    toast.success("Lead marked as completed.");
  };

  const handleReachedOutSnooze = () => {
    openFollowUpPicker("schedule-next");
  };

  const handleKeepFollowing = () => {
    openFollowUpPicker("keep-following");
  };

  const handleReschedule = (days: number) => {
    applyFollowUpDate(daysFromNow(days));
  };

  const handleArchive = () => {
    updateLead(lead.id, { archived: true });
    toast.success("Archived.");
    navigate("/");
  };

  const handleUnarchive = () => {
    updateLead(lead.id, { archived: false });
    toast.success("Back in action.");
  };

  const handleReactivate = () => {
    const due = new Date();
    due.setDate(due.getDate() + 3);
    updateLead(lead.id, { completed: false, dateCompleted: undefined, dueDate: due });
    toast.success("Reactivated. Back on your radar.");
  };

  const modalTitle =
    activeSheet === "reached-out"
      ? "What happened after you reached out?"
      : activeSheet === "snooze"
      ? "Snooze this lead"
      : activeSheet === "reschedule"
      ? reachedOutMode === "keep-following"
        ? "Keep following up"
        : "Schedule next follow-up"
      : "Mark as completed";

  const modalDescription =
    activeSheet === "reached-out"
      ? "Choose the next step for this relationship."
      : activeSheet === "snooze"
      ? "Pick a new follow-up date without marking this lead as contacted."
      : activeSheet === "reschedule"
      ? "Choose the next date and we’ll keep this lead active."
      : "Add an optional outcome note, then close this loop.";

  return (
    <div className="safe-bottom px-4 py-6 max-w-[480px] mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6 text-[13px] font-medium"
      >
        <ArrowLeft size={16} strokeWidth={1.8} /> Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-12 h-12 rounded-lg bg-primary/8 flex items-center justify-center text-primary font-semibold text-lg shrink-0">
            {lead.name[0]}
          </div>
          <div className="min-w-0">
            <h1 className="text-[22px] font-bold text-foreground truncate leading-tight">{lead.name}</h1>
            {lead.company && (
              <p className="text-muted-foreground text-[13px] truncate flex items-center gap-1 mt-0.5">
                {lead.company}
              </p>
            )}
          </div>
        </div>

        {/* Completed banner */}
        {lead.completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 rounded-lg bg-success/8 border border-success/20 flex items-center gap-2"
          >
            <CheckCircle2 size={16} className="text-success" />
            <span className="text-[13px] font-semibold text-success">Completed</span>
          </motion.div>
        )}

        {lead.archived && !lead.completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 rounded-lg bg-secondary border border-border flex items-center gap-2"
          >
            <Archive size={16} className="text-muted-foreground" />
            <span className="text-[13px] font-semibold text-muted-foreground">Archived</span>
          </motion.div>
        )}

        {/* Outcome */}
        {lead.completed && lead.outcomeNote && (
          <div className="mt-4 p-4 bg-card rounded-xl border border-border shadow-card">
            <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
              <Trophy size={12} /> Outcome
            </h2>
            <p className="text-[14px] font-medium text-foreground">{lead.outcomeNote}</p>
          </div>
        )}

        {/* Context section */}
        <div className="mt-6 mb-6">
          <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-3">
            {lead.completed ? "Timeline" : "Context"}
          </h2>
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden divide-y divide-border">
            <ContextRow label="When you met them" value={format(lead.createdAt, "MMM d, yyyy")} />
            <ContextRow label="Last contact" value={lead.lastContactDate ? format(lead.lastContactDate, "MMM d, yyyy") : "Not yet"} />
            <ContextRow label="Category" value={lead.category} />

            {lead.completed && lead.dateCompleted && (
              <ContextRow label="Completed" value={format(lead.dateCompleted, "MMM d, yyyy")} />
            )}

            {!lead.completed && (
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[13px] text-muted-foreground">
                  Follow-up by
                </span>
                <div className="text-right">
                  <span className="text-[13px] font-medium text-foreground block">
                    {format(lead.dueDate, "MMM d, yyyy")}
                  </span>
                  <span className={`text-[11px] font-semibold ${followUpColor}`}>{followUpLabel}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
              Notes & Context
            </h2>
            {!editingNotes && (
              <button onClick={startEditNotes} className="text-[12px] font-medium text-primary hover:text-primary/80 transition-colors duration-200">
                Edit
              </button>
            )}
          </div>
          {editingNotes ? (
            <div className="bg-card rounded-xl border border-border shadow-card p-4">
              <Textarea value={notesValue} onChange={(e) => setNotesValue(e.target.value)} maxLength={1000} className="bg-background min-h-[100px] mb-3 text-[14px]" placeholder="Add your notes..." />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveNotes} className="font-semibold text-[13px]">Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingNotes(false)} className="text-[13px]">Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border shadow-card p-4">
              {lead.notes ? (
                <p className="text-[14px] text-foreground leading-relaxed whitespace-pre-wrap">{lead.notes}</p>
              ) : (
                <p className="text-[13px] text-muted-foreground">No notes yet. Tap Edit to add context.</p>
              )}
            </div>
          )}
        </div>

        {/* Voice note */}
        {lead.audioUrl && (
          <div className="mb-6">
            <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-3">
              Voice Note
            </h2>
            <div className="bg-card rounded-xl border border-border shadow-card p-4">
              <audio ref={audioRef} src={lead.audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
              <div className="flex items-center gap-3">
                <motion.button whileTap={{ scale: 0.95 }} onClick={togglePlayback} className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center shrink-0">
                  {isPlaying ? <Pause size={18} className="text-primary-foreground" /> : <Play size={18} className="text-primary-foreground ml-0.5" />}
                </motion.button>
                <div>
                  <p className="text-[13px] font-medium text-foreground">{isPlaying ? "Playing..." : "Tap to listen"}</p>
                  <p className="text-[11px] text-muted-foreground">Voice note attached</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons — active leads */}
        {!lead.completed && !lead.archived && (
          <div className="space-y-2.5 mb-4">
            <div className="grid grid-cols-2 gap-2.5">
              <Button size="lg" className="font-semibold text-[14px]" onClick={() => {
                setOutcomeNote("");
                setCustomDate(undefined);
                setReachedOutMode(null);
                setSheetError("");
                setActiveSheet("reached-out");
              }}>
                Reached Out
              </Button>
              <Button size="lg" variant="secondary" className="font-semibold text-[14px]" onClick={() => openFollowUpPicker("snooze")}>
                Snooze
              </Button>
            </div>
            <button
              onClick={handleArchive}
              className="w-full py-2.5 text-center text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200"
            >
              Archive
            </button>
          </div>
        )}

        {/* Completed lead actions */}
        {lead.completed && (
          <div className="space-y-2.5 mb-4">
            <Button size="lg" variant="secondary" className="w-full font-semibold text-[14px]" onClick={handleReactivate}>
              <RotateCcw size={16} className="mr-2" /> Reactivate
            </Button>
            <button
              onClick={handleArchive}
              className="w-full py-2.5 text-center text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200"
            >
              Archive
            </button>
          </div>
        )}

        {/* Archived (not completed) */}
        {lead.archived && !lead.completed && (
          <Button size="lg" variant="secondary" className="w-full font-semibold text-[14px] mb-4" onClick={handleUnarchive}>
            <ArchiveRestore size={16} className="mr-2" /> Unarchive
          </Button>
        )}
      </motion.div>

      <Dialog open={Boolean(activeSheet)} onOpenChange={(open) => { if (!open) resetSheetState(); }}>
        {activeSheet && (
          <DialogContent className="w-[calc(100vw-1rem)] max-w-[480px] overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-modal">
            <div className="flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden">
              <DialogHeader className="border-b border-border px-5 pb-4 pt-5 pr-14 text-left">
                <DialogTitle className="text-[17px] font-bold text-foreground">
                  {modalTitle}
                </DialogTitle>
                <DialogDescription className="text-[13px] text-muted-foreground">
                  {modalDescription}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4">
                {sheetError && (
                  <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-[13px] font-medium text-destructive">
                    {sheetError}
                  </div>
                )}

                {activeSheet === "reached-out" && (
                  <div className="flex flex-col gap-3">
                    <SheetOption
                      icon={<CalendarClock size={18} className="text-primary" />}
                      title="Schedule next follow-up"
                      subtitle="Open the date picker and reschedule"
                      onClick={handleReachedOutSnooze}
                    />
                    <SheetOption
                      icon={<CheckCircle2 size={18} className="text-success" />}
                      title="Mark as completed"
                      subtitle="Move this lead to Completed"
                      onClick={() => {
                        setSheetError("");
                        setActiveSheet("completing");
                      }}
                    />
                    <SheetOption
                      icon={<ArrowRight size={18} className="text-muted-foreground" />}
                      title="Keep following up"
                      subtitle="Pick a new date and keep it active"
                      onClick={handleKeepFollowing}
                    />
                  </div>
                )}

                {activeSheet === "completing" && (
                  <div className="flex flex-col gap-4">
                    <p className="text-[13px] text-muted-foreground">
                      Add an optional outcome so you remember what happened.
                    </p>
                    <Input
                      placeholder="e.g. Booked a coffee for next Thursday"
                      value={outcomeNote}
                      maxLength={200}
                      onChange={(e) => setOutcomeNote(e.target.value)}
                      className="bg-background text-[14px]"
                    />
                    <div className="flex flex-wrap gap-2">
                      {["Partnership deal signed", "Booked speaking gig", "Got the intro", "Deal closed"].map((ex) => (
                        <button
                          key={ex}
                          type="button"
                          onClick={() => setOutcomeNote(ex)}
                          className="rounded-lg border border-border bg-secondary px-3 py-2 text-[12px] font-medium text-secondary-foreground transition-colors duration-200 hover:bg-accent"
                        >
                          {ex}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row-reverse">
                      <Button size="lg" className="font-semibold text-[14px] sm:flex-1" onClick={handleMarkCompleted}>
                        Mark as completed
                      </Button>
                      <Button size="lg" variant="secondary" className="font-semibold text-[14px] sm:flex-1" onClick={() => {
                        setSheetError("");
                        setActiveSheet("reached-out");
                      }}>
                        Back
                      </Button>
                    </div>
                  </div>
                )}

                {(activeSheet === "snooze" || activeSheet === "reschedule") && (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {[
                        { days: 1, label: "Tomorrow", sub: "Follow up the next day" },
                        { days: 3, label: "In 3 days", sub: "Give it a short breather" },
                        { days: 7, label: "In 1 week", sub: "Circle back next week" },
                        { days: 14, label: "In 2 weeks", sub: "Take a longer pause" },
                      ].map((opt) => (
                        <SheetOption
                          key={opt.days}
                          icon={<CalendarClock size={18} className="text-primary" />}
                          title={opt.label}
                          subtitle={opt.sub}
                          onClick={() => handleReschedule(opt.days)}
                        />
                      ))}
                    </div>

                    <div className="rounded-xl border border-border bg-background p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Custom date</p>
                          <p className="text-[14px] font-semibold text-foreground">
                            {customDate ? format(customDate, "EEEE, MMMM d") : "Choose a date"}
                          </p>
                        </div>
                      </div>

                      <Calendar
                        mode="single"
                        selected={customDate}
                        onSelect={(date) => {
                          setSheetError("");
                          setCustomDate(date);
                        }}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                        className={cn("mx-auto p-3 pointer-events-auto")}
                      />
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row-reverse">
                      <Button
                        size="lg"
                        className="font-semibold text-[14px] sm:flex-1"
                        onClick={() => applyFollowUpDate(customDate)}
                      >
                        Confirm {customDate ? `— ${format(customDate, "MMMM d")}` : "date"}
                      </Button>
                      <Button
                        size="lg"
                        variant="secondary"
                        className="font-semibold text-[14px] sm:flex-1"
                        onClick={() => {
                          setSheetError("");
                          setActiveSheet(activeSheet === "snooze" ? null : "reached-out");
                          if (activeSheet === "snooze") {
                            resetSheetState();
                          }
                        }}
                      >
                        {activeSheet === "snooze" ? "Cancel" : "Back"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

const ContextRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between px-4 py-3">
    <span className="text-[13px] text-muted-foreground">{label}</span>
    <span className="text-[13px] font-medium text-foreground">{value}</span>
  </div>
);

const SheetOption = ({ icon, title, subtitle, onClick }: { icon: React.ReactNode; title: string; subtitle: string; onClick: () => void }) => (
  <button type="button" onClick={onClick} className="flex min-h-14 w-full touch-manipulation items-center gap-3 rounded-xl bg-secondary p-3.5 text-left transition-colors duration-200 hover:bg-accent">
    <span className="shrink-0">{icon}</span>
    <div>
      <p className="font-medium text-foreground text-[14px]">{title}</p>
      <p className="text-[12px] text-muted-foreground">{subtitle}</p>
    </div>
  </button>
);

export default LeadDetail;