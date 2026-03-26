import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowLeft, Send, Clock, CheckCircle2, CalendarClock,
  ArrowRight, CalendarIcon, X, Play, Pause, Archive,
  ArchiveRestore, RotateCcw, Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getDaysDiff } from "@/data/sampleLeads";
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
    ? `⏳ Overdue by ${Math.abs(daysDiff)} day${Math.abs(daysDiff) > 1 ? "s" : ""}`
    : daysDiff === 0 ? "⏰ Due today"
    : `📆 In ${daysDiff} day${daysDiff > 1 ? "s" : ""}`;
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
    toast.success("Notes updated ✍️");
  };

  const handleSnooze = (days: number) => {
    updateLead(lead.id, { dueDate: daysFromNow(days) });
    setActiveSheet(null);
    toast.success(`Snoozed for ${days} day${days > 1 ? "s" : ""}.`);
  };

  const handleSnoozeCustom = () => {
    if (!customDate) return;
    updateLead(lead.id, { dueDate: customDate });
    setActiveSheet(null); setCustomDate(undefined);
    toast.success(`Snoozed until ${format(customDate, "MMM d")}.`);
  };

  const handleMarkCompleted = () => {
    updateLead(lead.id, {
      completed: true,
      lastContactDate: new Date(),
      reachedOut: true,
      dateCompleted: new Date(),
      outcomeNote: outcomeNote.trim().slice(0, 200) || undefined,
    });
    setActiveSheet(null);
    setOutcomeNote("");
    toast.success("🎉 You did it! That's amazing.");
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
    toast.success(`Next check-in in ${days} day${days > 1 ? "s" : ""}. 💪`);
  };

  const handleArchive = () => {
    updateLead(lead.id, { archived: true });
    toast.success("Archived. 📦");
    navigate("/");
  };

  const handleUnarchive = () => {
    updateLead(lead.id, { archived: false });
    toast.success("Back in action. 🚀");
  };

  const handleReactivate = () => {
    const due = new Date();
    due.setDate(due.getDate() + 3);
    updateLead(lead.id, { completed: false, dateCompleted: undefined, dueDate: due });
    toast.success("Reactivated! Back on your radar. 🚀");
  };

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
                💼 {lead.company}
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
            <span className="text-[13px] font-semibold text-success">✅ Completed</span>
          </motion.div>
        )}

        {lead.archived && !lead.completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 rounded-lg bg-secondary border border-border flex items-center gap-2"
          >
            <Archive size={16} className="text-muted-foreground" />
            <span className="text-[13px] font-semibold text-muted-foreground">📦 Archived</span>
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
            {lead.completed ? "📅 Timeline" : "Context"}
          </h2>
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden divide-y divide-border">
            <ContextRow emoji="📅" label="When you met them" value={format(lead.createdAt, "MMM d, yyyy")} />
            <ContextRow emoji="📞" label="Last contact" value={lead.lastContactDate ? format(lead.lastContactDate, "MMM d, yyyy") : "Not yet"} />
            <ContextRow emoji="🎯" label="Category" value={lead.category} />

            {lead.completed && lead.dateCompleted && (
              <ContextRow emoji="✅" label="Completed" value={format(lead.dateCompleted, "MMM d, yyyy")} />
            )}

            {!lead.completed && (
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[13px] text-muted-foreground flex items-center gap-2">
                  ⏰ Follow-up by
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
            <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              📝 Notes & Context
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
                <Button size="sm" onClick={saveNotes} className="font-semibold text-[13px]">Save ✍️</Button>
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
            <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1">
              🎤 Voice Note
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
              <Button size="lg" className="font-semibold text-[14px]" onClick={() => setActiveSheet("reached-out")}>
                📞 Reached Out
              </Button>
              <Button size="lg" variant="secondary" className="font-semibold text-[14px]" onClick={() => setActiveSheet("snooze")}>
                ⏸️ Snooze
              </Button>
            </div>
            <button
              onClick={handleArchive}
              className="w-full py-2.5 text-center text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200"
            >
              📦 Archive
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
              📦 Archive
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

      {/* Action Sheets */}
      <AnimatePresence>
        {activeSheet && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-end justify-center"
            onClick={() => { setActiveSheet(null); setCustomDate(undefined); setOutcomeNote(""); }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[480px] bg-card rounded-t-2xl border-t border-border shadow-modal p-5 pb-10"
            >
              <div className="w-8 h-1 rounded-full bg-border mx-auto mb-4" />
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-[17px] font-bold text-foreground">
                  {activeSheet === "reached-out" && "What's the update?"}
                  {activeSheet === "snooze" && "⏸️ Snooze until..."}
                  {activeSheet === "reschedule" && "📅 Next check-in"}
                  {activeSheet === "completing" && "🎉 You've Got This"}
                </h3>
                <button
                  onClick={() => { setActiveSheet(null); setCustomDate(undefined); setOutcomeNote(""); }}
                  className="p-1.5 rounded-lg hover:bg-accent transition-colors duration-200 text-muted-foreground"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Reached Out options */}
              {activeSheet === "reached-out" && (
                <div className="flex flex-col gap-2">
                  <SheetOption
                    emoji="📅"
                    title="Schedule next follow-up"
                    subtitle="Pick a new follow-up date"
                    onClick={handleReachedOutSnooze}
                  />
                  <SheetOption
                    emoji="✅"
                    title="We're good! Mark as completed"
                    subtitle="Celebrate your win"
                    onClick={() => setActiveSheet("completing")}
                  />
                  <SheetOption
                    emoji="→"
                    title="Keep following up"
                    subtitle="Set a new follow-up date"
                    onClick={handleKeepFollowing}
                  />
                </div>
              )}

              {/* Completing */}
              {activeSheet === "completing" && (
                <div className="flex flex-col gap-4">
                  <p className="text-[13px] text-muted-foreground">
                    That's amazing! What was the outcome?
                  </p>
                  <Input
                    placeholder="e.g. Booked speaking gig for June"
                    value={outcomeNote}
                    maxLength={200}
                    onChange={(e) => setOutcomeNote(e.target.value)}
                    className="bg-background text-[14px]"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {["Partnership deal signed", "Booked speaking gig", "Got the intro", "Deal closed"].map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setOutcomeNote(ex)}
                        className="px-3 py-1.5 rounded-lg text-[12px] font-medium border border-border bg-secondary hover:bg-accent transition-colors duration-200 text-secondary-foreground"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                  <Button size="lg" className="font-semibold text-[14px]" onClick={handleMarkCompleted}>
                    Mark as Completed 🎉
                  </Button>
                  <button
                    onClick={() => setActiveSheet("reached-out")}
                    className="text-center text-[13px] text-muted-foreground hover:text-foreground font-medium transition-colors duration-200"
                  >
                    ← Back
                  </button>
                </div>
              )}

              {/* Snooze / Reschedule */}
              {(activeSheet === "snooze" || activeSheet === "reschedule") && (
                <div className="flex flex-col gap-2">
                  {[
                    { days: 1, label: "1 day", sub: "Remind me tomorrow" },
                    { days: 3, label: "3 days", sub: "Check back in a few days" },
                    { days: 7, label: "1 week", sub: "Come back next week" },
                    { days: 14, label: "2 weeks", sub: "Circle back later" },
                  ].map((opt) => (
                    <SheetOption
                      key={opt.days}
                      emoji="📆"
                      title={activeSheet === "snooze" ? `Snooze ${opt.label}` : `In ${opt.label}`}
                      subtitle={opt.sub}
                      onClick={() => activeSheet === "snooze" ? handleSnooze(opt.days) : handleReschedule(opt.days)}
                    />
                  ))}
                  <div className="pt-3 border-t border-border mt-1">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Custom date</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-medium text-[13px]", !customDate && "text-muted-foreground")}>
                          <CalendarIcon size={14} className="mr-2" />
                          {customDate ? format(customDate, "EEEE, MMMM d") : "Choose a date..."}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="center">
                        <Calendar
                          mode="single"
                          selected={customDate}
                          onSelect={setCustomDate}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    {customDate && (
                      <Button
                        size="lg"
                        className="w-full mt-3 font-semibold text-[14px]"
                        onClick={activeSheet === "snooze" ? handleSnoozeCustom : () => {
                          updateLead(lead.id, { dueDate: customDate });
                          setActiveSheet(null); setCustomDate(undefined);
                          toast.success(`Next check-in on ${format(customDate, "MMM d")}. 💪`);
                        }}
                      >
                        Confirm — {format(customDate, "MMM d")}
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

const ContextRow = ({ emoji, label, value }: { emoji: string; label: string; value: string }) => (
  <div className="flex items-center justify-between px-4 py-3">
    <span className="text-[13px] text-muted-foreground flex items-center gap-2">{emoji} {label}</span>
    <span className="text-[13px] font-medium text-foreground">{value}</span>
  </div>
);

const SheetOption = ({ emoji, title, subtitle, onClick }: { emoji: string; title: string; subtitle: string; onClick: () => void }) => (
  <button onClick={onClick} className="flex items-center gap-3 p-3.5 bg-secondary rounded-xl hover:bg-accent transition-colors duration-200 text-left">
    <span className="text-[18px] shrink-0">{emoji}</span>
    <div>
      <p className="font-medium text-foreground text-[14px]">{title}</p>
      <p className="text-[12px] text-muted-foreground">{subtitle}</p>
    </div>
  </button>
);

export default LeadDetail;