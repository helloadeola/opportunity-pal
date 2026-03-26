import { useState } from "react";
import { getLeadStatus } from "@/data/sampleLeads";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, PenLine, PartyPopper, Settings, Trash2, X, Bell, BellOff } from "lucide-react";
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
  const hour = i + 5; // 5 AM to 6 PM
  const label = hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
  return { value: hour, label };
});

const frequencyOptions = [
  { value: "daily", label: "Every day" },
  { value: "3x-week", label: "3× per week (Mon, Wed, Fri)" },
  { value: "weekly", label: "Weekly (Monday)" },
] as const;

const HomePage = () => {
  const navigate = useNavigate();
  const { leads, clearAllData } = useLeads();
  const [showSettings, setShowSettings] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
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
        toast.error("Your browser doesn't support notifications 😔");
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
      toast.success("Reminders enabled! We'll nudge you when it's time. 🔔");
    } else {
      updateNotif({ enabled: false });
      toast.success("Reminders turned off. You can re-enable anytime. 🔕");
    }
  };

  return (
    <div className="safe-bottom px-5 py-6 max-w-[480px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Follow Through ✨
          </h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 -mr-2 -mt-1 rounded-full hover:bg-muted transition-colors text-muted-foreground"
          >
            <Settings size={20} />
          </button>
        </div>
        <p className="text-muted-foreground mt-1 font-medium">
          {followUps.length > 0
            ? "You've got this. Here's who needs you today."
            : "Looking good! Nothing urgent right now."}
        </p>
      </motion.div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-foreground">Settings</p>
                <button
                  onClick={() => { setShowSettings(false); setConfirmClear(false); }}
                  className="p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Notifications Section */}
              <div className="mb-4 pb-4 border-b border-border">
                <div className="flex items-center gap-2 mb-3">
                  {notifSettings.enabled ? (
                    <Bell size={16} className="text-primary" />
                  ) : (
                    <BellOff size={16} className="text-muted-foreground" />
                  )}
                  <p className="text-sm font-bold text-foreground">Notifications</p>
                </div>

                {/* Toggle */}
                <div className="flex items-center justify-between mb-3 p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Daily reminder</p>
                    <p className="text-xs text-muted-foreground">
                      Get nudged about your follow-ups
                    </p>
                  </div>
                  <Switch
                    checked={notifSettings.enabled}
                    onCheckedChange={handleToggleNotifications}
                  />
                </div>

                {/* Time & Frequency — only when enabled */}
                <AnimatePresence>
                  {notifSettings.enabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <div>
                        <label className="text-xs font-bold text-muted-foreground mb-1 block">
                          Reminder time
                        </label>
                        <Select
                          value={String(notifSettings.hour)}
                          onValueChange={(v) => updateNotif({ hour: parseInt(v, 10) })}
                        >
                          <SelectTrigger className="bg-background">
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
                        <label className="text-xs font-bold text-muted-foreground mb-1 block">
                          How often
                        </label>
                        <Select
                          value={notifSettings.frequency}
                          onValueChange={(v) =>
                            updateNotif({ frequency: v as "daily" | "3x-week" | "weekly" })
                          }
                        >
                          <SelectTrigger className="bg-background">
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

                      <p className="text-xs text-muted-foreground italic pt-1">
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
                  className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-destructive/10 transition-colors text-left"
                >
                  <Trash2 size={16} className="text-destructive" />
                  <div>
                    <p className="text-sm font-bold text-destructive">Clear all data</p>
                    <p className="text-xs text-muted-foreground">Reset to sample leads (for testing)</p>
                  </div>
                </button>
              ) : (
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <p className="text-sm font-bold text-foreground mb-1">Are you sure?</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    This will erase all your leads and reset to sample data. Can't undo this!
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        clearAllData();
                        setConfirmClear(false);
                        setShowSettings(false);
                        toast.success("All cleared! Fresh start. 🧹");
                      }}
                      className="flex-1 py-2 px-3 rounded-lg bg-destructive text-destructive-foreground text-sm font-bold"
                    >
                      Yes, clear it
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="flex-1 py-2 px-3 rounded-lg bg-muted text-foreground text-sm font-bold"
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
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Today's Follow-Ups
        </h2>
        <div className="flex flex-col gap-3">
          {followUps.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-8 bg-card rounded-xl border border-border"
            >
              <PartyPopper size={36} className="text-primary" />
              <p className="text-foreground font-bold">You're all caught up! 🎉</p>
              <p className="text-muted-foreground text-sm font-medium">
                No follow-ups due right now. Go relax!
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
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Capture
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/voice")}
            className="flex flex-col items-center gap-2 p-5 bg-primary/10 rounded-xl border border-primary/20 hover:bg-primary/15 transition-colors"
          >
            <Mic size={28} className="text-primary" />
            <span className="font-bold text-primary text-sm">Voice Note</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/add")}
            className="flex flex-col items-center gap-2 p-5 bg-accent/10 rounded-xl border border-accent/20 hover:bg-accent/15 transition-colors"
          >
            <PenLine size={28} className="text-accent" />
            <span className="font-bold text-accent text-sm">Quick Note</span>
          </motion.button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
