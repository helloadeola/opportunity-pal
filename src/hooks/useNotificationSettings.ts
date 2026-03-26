import { useState, useEffect, useCallback } from "react";

export interface NotificationSettings {
  enabled: boolean;
  hour: number; // 0-23
  frequency: "daily" | "3x-week" | "weekly";
}

const STORAGE_KEY = "follow_through_notifications";

const defaultSettings: NotificationSettings = {
  enabled: false,
  hour: 8,
  frequency: "daily",
};

function load(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultSettings;
}

function save(settings: NotificationSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(load);

  useEffect(() => {
    save(settings);
  }, [settings]);

  const update = useCallback((patch: Partial<NotificationSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  return { settings, update };
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function getPermissionStatus(): "granted" | "denied" | "default" | "unsupported" {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}
