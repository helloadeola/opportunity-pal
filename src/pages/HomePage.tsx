import { useState } from "react";
import { getLeadStatus } from "@/data/sampleLeads";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, PenLine, Settings, Trash2, X, Bell, BellOff, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLeads } from "@/context/LeadsContext";
import LeadCard from "@/components/LeadCard";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useNotificationSettings,
  requestNotificationPermission,
  getPermissionStatus,
} from "@/hooks/useNotificationSettings";

const timeOptions = Array.from({ length: 14 }, (_, i) => {
  const hour = i + 5;
  const label = hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
  return { value: hour, label };
});

const frequencyOptions = [
  { value: "daily", label: "Every day" },
  { value: "3x-week", label: "3x per week (Mon, Wed, Fri)" },
  { value: "weekly", label: "Weekly (Monday)" },
] as const;

const HomePage = () => {
  const navigate = useNavigate();
  const { leads, clearAllData } = useLeads();
  const [showSettings, setShowSettings] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const { settings: notifSettings, update: updateNotif } = useNotificationSettings();

  const followUps = leads
    .filter((l) => {
      if (l.completed || l.archived) return false;
      const status = getLeadStatus(l);
      if (status === "overdue" || status === "due-today") return true;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const dueStart = new Date(l.dueDate);
      dueStart.setHours(0, 0, 0, 0);
      const diff = Math.round((dueStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 3;
    })
    .sort((a, b) => {
      const statusA = getLeadStatus(a);
      const statusB = getLeadStatus(b);
      const order = { overdue: 0, "due-today": 1, upcoming: 2 };
      if (order[statusA] !== order[statusB]) return order[statusA] - order[statusB];
      return a.dueDate.getTime() - b.dueDate.getTime();
    });

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      const permStatus = getPermissionStatus();
      if (permStatus === "unsupported") {
        toast.error("Your browser doesn't support notifications.");
        return;
      }
      if (permStatus === "denied") {
        toast.error("Notifications are blocked. Enable them in your browser settings.");
        return;
      }
      const granted = await requestNotificationPermission();
      if (!granted) {
        toast.error("We need permission to send reminders. You can enable this in browser settings.");
        return;
      }
      updateNotif({ enabled: true });
      toast.success("Reminders enabled.");
    } else {
      updateNotif({ enabled: false });
      toast.success("Reminders turned off.");
    }
  };

  return (
    <div className="safe-bottom px-4 py-6 max-w-[480px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="mb-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-foreground tracking-tight leading-tight">
              Follow Through
            </h1>
            <p className="text-muted-foreground mt-1 text-[14px]">
              {followUps.length > 0
                ? `You have ${followUps.length} follow-up${followUps.length > 1 ? "s" : ""} today.`
                : "You're on track."}
            </p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 -mr-2 -mt-1 rounded-lg hover:bg-accent transition-colors duration-200 text-muted-foreground hover:text-foreground"
          >
            <Settings size={18} strokeWidth={1.8} />
          </button>
        </div>
      </motion.div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-5 bg-card rounded-xl border border-border shadow-card">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[15px] font-semibold text-foreground">Settings</h3>
                <button
                  onClick={() => { setShowSettings(false); setConfirmClear(false); }}
                  className="p-1.5 rounded-lg hover:bg-accent transition-colors duration-200 text-muted-foreground"
                >
                  <X size={14} />
                </button>
              </div>

              {/* About Section */}
              <button
                onClick={() => setShowAbout(true)}
                className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-accent transition-colors duration-200 text-left mb-5 pb-5 border-b border-border"
              >
                <Info size={14} className="text-primary" />
                <div>
                  <p className="text-[13px] font-medium text-foreground">About Follow Through</p>
                  <p className="text-[11px] text-muted-foreground">Learn what this app is about</p>
                </div>
              </button>

              {/* Notifications Section */}
              <div className="mb-5 pb-5 border-b border-border">
                <div className="flex items-center gap-2 mb-3">
                  {notifSettings.enabled ? (
                    <Bell size={14} className="text-primary" />
                  ) : (
                    <BellOff size={14} className="text-muted-foreground" />
                  )}
                  <p className="text-[13px] font-semibold text-foreground">Notifications</p>
                </div>

                <div className="flex items-center justify-between mb-3 p-3 rounded-lg bg-secondary">
                  <div>
                    <p className="text-[13px] font-medium text-foreground">Daily reminder</p>
                    <p className="text-[12px] text-muted-foreground">
                      Get a morning briefing of leads due today
                    </p>
                  </div>
                  <Switch
                    checked={notifSettings.enabled}
                    onCheckedChange={handleToggleNotifications}
                  />
                </div>

                <AnimatePresence>
                  {notifSettings.enabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          Reminder time
                        </label>
                        <Select
                          value={String(notifSettings.hour)}
                          onValueChange={(v) => updateNotif({ hour: parseInt(v, 10) })}
                        >
                          <SelectTrigger className="bg-background text-[13px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((t) => (
                              <SelectItem key={t.value} value={String(t.value)}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          Frequency
                        </label>
                        <Select
                          value={notifSettings.frequency}
                          onValueChange={(v) =>
                            updateNotif({ frequency: v as "daily" | "3x-week" | "weekly" })
                          }
                        >
                          <SelectTrigger className="bg-background text-[13px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {frequencyOptions.map((f) => (
                              <SelectItem key={f.value} value={f.value}>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <p className="text-[11px] text-muted-foreground pt-1">
                        Keep the app open or installed for notifications to work.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Clear Data */}
              {!confirmClear ? (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-destructive/8 transition-colors duration-200 text-left"
                >
                  <Trash2 size={14} className="text-destructive" />
                  <div>
                    <p className="text-[13px] font-medium text-destructive">Clear all data</p>
                    <p className="text-[11px] text-muted-foreground">Reset to sample leads</p>
                  </div>
                </button>
              ) : (
                <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <p className="text-[13px] font-semibold text-foreground mb-1">Are you sure?</p>
                  <p className="text-[12px] text-muted-foreground mb-3">
                    This will erase all your leads and reset to sample data.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        clearAllData();
                        setConfirmClear(false);
                        setShowSettings(false);
                        toast.success("All cleared. Fresh start.");
                      }}
                      className="flex-1 py-2 px-3 rounded-lg bg-destructive text-destructive-foreground text-[13px] font-semibold"
                    >
                      Yes, clear it
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="flex-1 py-2 px-3 rounded-lg bg-secondary text-foreground text-[13px] font-semibold"
                    >
                      Never mind
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="mb-8">
        <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-3">
          Today's Follow-Ups
        </h2>
        <div className="flex flex-col gap-2.5">
          {followUps.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-10 bg-card rounded-xl border border-border shadow-card"
            >
              <p className="text-foreground font-semibold text-[15px]">You're on track.</p>
              <p className="text-muted-foreground text-[13px]">
                No follow-ups due right now. Great work.
              </p>
            </motion.div>
          ) : (
            followUps.map((lead, i) => (
              <LeadCard key={lead.id} lead={lead} index={i} />
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-3">
          Quick Capture
        </h2>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/add")}
          className="flex items-center justify-center gap-2 w-full p-5 bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover hover:bg-accent/40 transition-all duration-200"
        >
          <PenLine size={22} strokeWidth={1.8} className="text-primary" />
          <span className="font-semibold text-primary text-[13px]">Add Quick Note</span>
        </motion.button>
      </section>

      {/* About Modal */}
      <AnimatePresence>
        {showAbout && (
          <motion.div
            key="about-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowAbout(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[500px] bg-card rounded-xl border border-border shadow-modal p-8"
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-[24px] font-bold text-foreground">Follow Through</h2>
                <button
                  onClick={() => setShowAbout(false)}
                  className="p-1.5 rounded-lg hover:bg-accent transition-colors duration-200 text-muted-foreground -mt-1 -mr-1"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-[14px] text-secondary-foreground leading-relaxed">
                  Follow Through App is designed for high-level leaders and entrepreneurs who attract more opportunities than they can manage. When you're juggling corporate responsibilities and multiple income streams, opportunities slip through the cracks. You meet people at events. You get emails with proposals. And then... life happens. You forget who you met, why they matter, and when you committed to follow up.
                </p>
                <p className="text-[14px] text-secondary-foreground leading-relaxed">
                  Follow Through App solves this. Capture leads fast. Get reminded what needs attention. Track what actually converts. Stay on top of your most important relationships without the mental overhead.
                </p>
              </div>

              <Button
                size="lg"
                className="w-full font-semibold text-[14px]"
                onClick={() => setShowAbout(false)}
              >
                Got It
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;