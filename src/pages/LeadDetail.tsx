import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowLeft, Send, Clock, CheckCircle2, CalendarClock,
  ArrowRight, CalendarIcon, X, Play, Pause, Archive,
  ArchiveRestore, Building2, Tag, CalendarDays,
  MessageSquare, Mic, RotateCcw, Trophy
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
      <div className="safe-bottom px-5 py-6 max-w-[480px] mx-auto text-center">
        <p className="text-muted-foreground">Lead not found.</p>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">Go back</Button>
      </div>
    );
  }

  const daysDiff = getDaysDiff(lead);
  const followUpLabel = daysDiff < 0
    ? `Overdue by ${Math.abs(daysDiff)} day${Math.abs(daysDiff) > 1 ? "s" : ""}`
    : daysDiff === 0 ? "Due today"
    : `In ${daysDiff} day${daysDiff > 1 ? "s" : ""}`;
  const followUpColor = daysDiff < 0 ? "text-destructive" : daysDiff === 0 ? "text-yellow-600" : "text-primary";

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause(); else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const startEditNotes = () => { setNotesValue(lead.notes || ""); setEditingNotes(true); };
  const saveNotes = () => {
    updateLead(lead.id, { notes: notesValue.trim().slice(0, 1000) });
    setEditingNotes(false);
    toast.success("Notes updated! ✍️");
  };

  const handleSnooze = (days: number) => {
    updateLead(lead.id, { dueDate: daysFromNow(days) });
    setActiveSheet(null);
    toast.success(`Snoozed for ${days} day${days > 1 ? "s" : ""}. We'll remind you! 😴`);
  };

  const handleSnoozeCustom = () => {
    if (!customDate) return;
    updateLead(lead.id, { dueDate: customDate });
    setActiveSheet(null); setCustomDate(undefined);
    toast.success(`Snoozed until ${format(customDate, "MMM d")}. You're on it! 📅`);
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
    toast.success("🎉 You did it! That's amazing!");
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

  const handleArchive = () => {
    updateLead(lead.id, { archived: true });
    toast.success("Archived. You can find them in All Leads. 📦");
    navigate("/");
  };

  const handleUnarchive = () => {
    updateLead(lead.id, { archived: false });
    toast.success("Back in action! 🚀");
  };

  const handleReactivate = () => {
    const due = new Date();
    due.setDate(due.getDate() + 3);
    updateLead(lead.id, { completed: false, dateCompleted: undefined, dueDate: due });
    toast.success("Reactivated! Back on your radar. 🚀");
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
              <p className="text-muted-foreground font-medium truncate flex items-center gap-1">
                <Building2 size={14} /> {lead.company}
              </p>
            )}
          </div>
        </div>

        {/* Completed banner */}
        {lead.completed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2"
          >
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span className="text-sm font-bold text-emerald-600">Completed! You nailed it! 🎉</span>
          </motion.div>
        )}

        {lead.archived && !lead.completed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 p-3 rounded-lg bg-muted border border-border flex items-center gap-2"
          >
            <Archive size={18} className="text-muted-foreground" />
            <span className="text-sm font-bold text-muted-foreground">Archived</span>
          </motion.div>
        )}

        {/* Outcome note for completed leads */}
        {lead.completed && lead.outcomeNote && (
          <div className="mt-4 p-4 bg-card rounded-xl border border-border">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <Trophy size={13} /> Outcome
            </h2>
            <p className="text-sm font-semibold text-foreground">{lead.outcomeNote}</p>
          </div>
        )}

        {/* Context section */}
        <div className="mt-6 mb-6">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            {lead.completed ? "Timeline" : "Context"}
          </h2>
          <div className="space-y-0 bg-card rounded-xl border border-border overflow-hidden">
            <ContextRow icon={<CalendarDays size={15} />} label="When you met them" value={format(lead.createdAt, "MMM d, yyyy")} border />
            <ContextRow icon={<Send size={15} />} label="Last contact" value={lead.lastContactDate ? format(lead.lastContactDate, "MMM d, yyyy") : "Not yet"} border />
            <ContextRow icon={<Tag size={15} />} label="Category" value={lead.category} border={!lead.completed || !!lead.dateCompleted} />

            {lead.completed && lead.dateCompleted && (
              <ContextRow icon={<CheckCircle2 size={15} />} label="Completed" value={format(lead.dateCompleted, "MMM d, yyyy")} border={false} />
            )}

            {!lead.completed && (
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <CalendarClock size={15} /> Follow-up by
                </span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-foreground block">
                    {format(lead.dueDate, "MMM d, yyyy")}
                  </span>
                  <span className={`text-xs font-bold ${followUpColor}`}>{followUpLabel}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <MessageSquare size={13} /> Notes & Context
            </h2>
            {!editingNotes && (
              <button onClick={startEditNotes} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                Edit
              </button>
            )}
          </div>
          {editingNotes ? (
            <div className="bg-card rounded-xl border border-border p-4">
              <Textarea value={notesValue} onChange={(e) => setNotesValue(e.target.value)} maxLength={1000} className="bg-background min-h-[100px] mb-3" placeholder="Add your notes..." />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveNotes} className="font-bold">Got it! ✍️</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingNotes(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-4">
              {lead.notes ? (
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{lead.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No notes yet. Tap Edit to add some! ✍️</p>
              )}
            </div>
          )}
        </div>

        {/* Voice note */}
        {lead.audioUrl && (
          <div className="mb-6">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
              <Mic size={13} /> Voice Note
            </h2>
            <div className="bg-card rounded-xl border border-border p-4">
              <audio ref={audioRef} src={lead.audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
              <div className="flex items-center gap-3">
                <motion.button whileTap={{ scale: 0.9 }} onClick={togglePlayback} className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-sm shrink-0">
                  {isPlaying ? <Pause size={20} className="text-primary-foreground" /> : <Play size={20} className="text-primary-foreground ml-0.5" />}
                </motion.button>
                <div>
                  <p className="text-sm font-semibold text-foreground">{isPlaying ? "Playing..." : "Tap to listen"}</p>
                  <p className="text-xs text-muted-foreground">Voice note attached to this lead</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons — active leads */}
        {!lead.completed && !lead.archived && (
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <Button size="lg" className="font-bold" onClick={() => setActiveSheet("reached-out")}>
                <Send size={18} className="mr-2" /> Reached Out
              </Button>
              <Button size="lg" variant="secondary" className="font-bold" onClick={() => setActiveSheet("snooze")}>
                <Clock size={18} className="mr-2" /> Snooze
              </Button>
            </div>
            <Button size="lg" variant="outline" className="w-full font-bold text-muted-foreground" onClick={handleArchive}>
              <Archive size={18} className="mr-2" /> Archive
            </Button>
          </div>
        )}

        {/* Completed lead actions */}
        {lead.completed && (
          <div className="space-y-3 mb-4">
            <Button size="lg" variant="outline" className="w-full font-bold" onClick={handleReactivate}>
              <RotateCcw size={18} className="mr-2" /> Reactivate
            </Button>
            <Button size="lg" variant="outline" className="w-full font-bold text-muted-foreground" onClick={handleArchive}>
              <Archive size={18} className="mr-2" /> Archive
            </Button>
          </div>
        )}

        {/* Archived (not completed) */}
        {lead.archived && !lead.completed && (
          <Button size="lg" variant="outline" className="w-full font-bold mb-4" onClick={handleUnarchive}>
            <ArchiveRestore size={18} className="mr-2" /> Unarchive
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
            className="fixed inset-0 z-50 bg-foreground/30 flex items-end justify-center"
            onClick={() => { setActiveSheet(null); setCustomDate(undefined); setOutcomeNote(""); }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[480px] bg-card rounded-t-2xl border-t border-border p-5 pb-10"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-extrabold text-foreground">
                  {activeSheet === "reached-out" && "Nice work! What's the update? 🙌"}
                  {activeSheet === "snooze" && "When should we remind you? 😴"}
                  {activeSheet === "reschedule" && "When should we check in again? 📅"}
                  {activeSheet === "completing" && "🎉 You did it!"}
                </h3>
                <button
                  onClick={() => { setActiveSheet(null); setCustomDate(undefined); setOutcomeNote(""); }}
                  className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Reached Out options */}
              {activeSheet === "reached-out" && (
                <div className="flex flex-col gap-3">
                  <SheetOption
                    icon={<CalendarClock size={20} className="text-primary" />}
                    title="Schedule next follow-up"
                    subtitle="Pick a new follow-up date"
                    onClick={handleReachedOutSnooze}
                  />
                  <SheetOption
                    icon={<CheckCircle2 size={20} className="text-emerald-600" />}
                    title="We're good! Mark as completed"
                    subtitle="That's amazing — celebrate your win! 🎉"
                    onClick={() => setActiveSheet("completing")}
                  />
                  <SheetOption
                    icon={<ArrowRight size={20} className="text-muted-foreground" />}
                    title="Keep following up"
                    subtitle="Set a new follow-up date"
                    onClick={handleKeepFollowing}
                  />
                </div>
              )}

              {/* Completing — outcome note */}
              {activeSheet === "completing" && (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground font-medium">
                    That's amazing! What was the outcome?
                  </p>
                  <Input
                    placeholder="e.g. Booked speaking gig for June"
                    value={outcomeNote}
                    maxLength={200}
                    onChange={(e) => setOutcomeNote(e.target.value)}
                    className="bg-background"
                  />
                  <div className="flex flex-wrap gap-2">
                    {["Partnership deal signed", "Booked speaking gig", "Got the intro", "Deal closed"].map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setOutcomeNote(ex)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold border border-border bg-background hover:border-primary/50 transition-colors text-foreground"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                  <Button size="lg" className="font-bold" onClick={handleMarkCompleted}>
                    Mark as Completed 🎉
                  </Button>
                  <button
                    onClick={() => setActiveSheet("reached-out")}
                    className="text-center text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
                  >
                    ← Back
                  </button>
                </div>
              )}

              {/* Snooze / Reschedule */}
              {(activeSheet === "snooze" || activeSheet === "reschedule") && (
                <div className="flex flex-col gap-3">
                  {[
                    { days: 1, label: "1 day", sub: "Remind me tomorrow" },
                    { days: 3, label: "3 days", sub: "Check back in a few days" },
                    { days: 7, label: "1 week", sub: "Come back to this next week" },
                    { days: 14, label: "2 weeks", sub: "Circle back later" },
                  ].map((opt) => (
                    <SheetOption
                      key={opt.days}
                      icon={<CalendarClock size={20} className="text-primary" />}
                      title={activeSheet === "snooze" ? `Snooze ${opt.label}` : `In ${opt.label}`}
                      subtitle={opt.sub}
                      onClick={() => activeSheet === "snooze" ? handleSnooze(opt.days) : handleReschedule(opt.days)}
                    />
                  ))}
                  <div className="pt-2 border-t border-border mt-1">
                    <p className="text-xs font-bold text-muted-foreground mb-2">Pick a custom date</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-medium", !customDate && "text-muted-foreground")}>
                          <CalendarIcon size={16} className="mr-2" />
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
                        className="w-full mt-3 font-bold"
                        onClick={activeSheet === "snooze" ? handleSnoozeCustom : () => {
                          updateLead(lead.id, { dueDate: customDate });
                          setActiveSheet(null); setCustomDate(undefined);
                          toast.success(`Got it! We'll check in on ${format(customDate, "MMM d")}. 💪`);
                        }}
                      >
                        Got it! {format(customDate, "MMM d")} 👍
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

const ContextRow = ({ icon, label, value, border }: { icon: React.ReactNode; label: string; value: string; border: boolean }) => (
  <div className={`flex items-center justify-between px-4 py-3 ${border ? "border-b border-border" : ""}`}>
    <span className="text-sm text-muted-foreground flex items-center gap-2">{icon} {label}</span>
    <span className="text-sm font-semibold text-foreground">{value}</span>
  </div>
);

const SheetOption = ({ icon, title, subtitle, onClick }: { icon: React.ReactNode; title: string; subtitle: string; onClick: () => void }) => (
  <button onClick={onClick} className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors text-left">
    <span className="shrink-0">{icon}</span>
    <div>
      <p className="font-bold text-foreground text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  </button>
);

export default LeadDetail;
