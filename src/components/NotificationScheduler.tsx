import { useEffect, useRef } from "react";
import { useLeads } from "@/context/LeadsContext";
import { getLeadStatus, getDaysDiff } from "@/data/sampleLeads";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";

/**
 * Schedules browser notifications based on user settings.
 * Uses setInterval to check every minute if it's time to fire.
 * Stores last-fired timestamp to prevent duplicates.
 */
const LAST_FIRED_KEY = "follow_through_notif_last_fired";

function getFollowUpCount(leads: ReturnType<typeof useLeads>["leads"]): number {
  return leads.filter((l) => {
    if (l.completed || l.archived) return false;
    const status = getLeadStatus(l);
    if (status === "overdue" || status === "due-today") return true;
    const diff = getDaysDiff(l);
    return diff >= 0 && diff <= 3;
  }).length;
}

function shouldFireToday(frequency: string): boolean {
  const day = new Date().getDay(); // 0=Sun
  if (frequency === "daily") return true;
  if (frequency === "3x-week") return [1, 3, 5].includes(day); // Mon, Wed, Fri
  if (frequency === "weekly") return day === 1; // Monday
  return false;
}

function firedToday(): boolean {
  const last = localStorage.getItem(LAST_FIRED_KEY);
  if (!last) return false;
  const lastDate = new Date(last);
  const now = new Date();
  return (
    lastDate.getFullYear() === now.getFullYear() &&
    lastDate.getMonth() === now.getMonth() &&
    lastDate.getDate() === now.getDate()
  );
}

function markFired() {
  localStorage.setItem(LAST_FIRED_KEY, new Date().toISOString());
}

function sendNotification(count: number) {
  if (Notification.permission !== "granted") return;

  const title = "Follow Through ✨";
  const body =
    count > 0
      ? `You've got ${count} lead${count > 1 ? "s" : ""} to follow up on. Ready?`
      : "You're all caught up! 🎉";

  try {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag: "follow-through-daily",
    });
  } catch {
    // Notification constructor might fail on some mobile browsers
  }
}

export function NotificationScheduler() {
  const { leads } = useLeads();
  const { settings } = useNotificationSettings();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!settings.enabled || Notification.permission !== "granted") return;

    const check = () => {
      const now = new Date();
      if (now.getHours() !== settings.hour) return;
      if (now.getMinutes() > 5) return; // within first 5 min of the hour
      if (firedToday()) return;
      if (!shouldFireToday(settings.frequency)) return;

      const count = getFollowUpCount(leads);
      sendNotification(count);
      markFired();
    };

    // Check immediately on mount
    check();

    // Check every 60 seconds
    intervalRef.current = setInterval(check, 60_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [settings.enabled, settings.hour, settings.frequency, leads]);

  return null;
}
