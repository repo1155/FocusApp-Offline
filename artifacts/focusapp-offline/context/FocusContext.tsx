import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type TimerMode = 'focus' | 'break';
export type FocusSettings = {
  focusMinutes: number;
  breakMinutes: number;
  hardFocus: boolean;
  soundEnabled: boolean;
};
export type FocusSession = {
  id: string;
  label: string;
  startedAt: number;
  endedAt: number;
  focusSeconds: number;
  breakSeconds: number;
  completed: boolean;
};
type ActiveTimer = {
  mode: TimerMode;
  label: string;
  startedAt: number;
  elapsedBefore: number;
  paused: boolean;
  focusSeconds: number;
  breakSeconds: number;
  cycle: number;
};

const STORAGE_KEY = '@focusapp-offline/v1';
const DEFAULT_SETTINGS: FocusSettings = {
  focusMinutes: 25,
  breakMinutes: 5,
  hardFocus: false,
  soundEnabled: true,
};

type StoredState = {
  settings: FocusSettings;
  sessions: FocusSession[];
  active: ActiveTimer | null;
};
type FocusContextValue = StoredState & {
  hydrated: boolean;
  elapsedSeconds: number;
  remainingSeconds: number;
  todaySeconds: number;
  startTimer: (label: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  skipPhase: () => void;
  updateSettings: (patch: Partial<FocusSettings>) => void;
  clearHistory: () => void;
};

const FocusContext = createContext<FocusContextValue | null>(null);
const nowSeconds = (active: ActiveTimer | null, now = Date.now()) =>
  !active ? 0 : active.elapsedBefore + (active.paused ? 0 : Math.max(0, Math.floor((now - active.startedAt) / 1000)));

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<FocusSettings>(DEFAULT_SETTINGS);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [active, setActive] = useState<ActiveTimer | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [, setTick] = useState(0);

  const persist = useCallback(async (next: StoredState) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as Partial<StoredState>;
        setSettings({ ...DEFAULT_SETTINGS, ...(saved.settings ?? {}) });
        setSessions(Array.isArray(saved.sessions) ? saved.sessions : []);
        setActive(saved.active ?? null);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const interval = setInterval(() => setTick((tick) => tick + 1), 1000);
    return () => clearInterval(interval);
  }, [hydrated]);

  const finishActive = useCallback(
    (timer: ActiveTimer, completed: boolean) => {
      const elapsed = nowSeconds(timer);
      const focusSeconds = timer.focusSeconds + (timer.mode === 'focus' ? elapsed : 0);
      const breakSeconds = timer.breakSeconds + (timer.mode === 'break' ? elapsed : 0);
      const nextSession: FocusSession = {
        id: makeId(),
        label: timer.label || 'Focus session',
        startedAt: timer.startedAt - timer.focusSeconds * 1000,
        endedAt: Date.now(),
        focusSeconds,
        breakSeconds,
        completed,
      };
      const nextSessions = [nextSession, ...sessions].slice(0, 100);
      setSessions(nextSessions);
      setActive(null);
      void persist({ settings, sessions: nextSessions, active: null });
      void Haptics.notificationAsync(
        completed ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
      );
    },
    [persist, sessions, settings],
  );

  useEffect(() => {
    if (!hydrated || !active || active.paused) return;
    const total = (active.mode === 'focus' ? settings.focusMinutes : settings.breakMinutes) * 60;
    if (nowSeconds(active) < total) return;
    const elapsed = total;
    if (active.mode === 'focus') {
      const next: ActiveTimer = {
        ...active,
        mode: 'break',
        startedAt: Date.now(),
        elapsedBefore: 0,
        focusSeconds: active.focusSeconds + elapsed,
        cycle: active.cycle + 1,
      };
      setActive(next);
      void persist({ settings, sessions, active: next });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      finishActive(active, true);
    }
  }, [active, finishActive, hydrated, persist, sessions, settings]);

  const updateActive = useCallback(
    (next: ActiveTimer | null) => {
      setActive(next);
      void persist({ settings, sessions, active: next });
    },
    [persist, sessions, settings],
  );

  const startTimer = useCallback(
    (label: string) => {
      if (active) return;
      const next: ActiveTimer = {
        mode: 'focus',
        label: label.trim() || 'Focus session',
        startedAt: Date.now(),
        elapsedBefore: 0,
        paused: false,
        focusSeconds: 0,
        breakSeconds: 0,
        cycle: 1,
      };
      updateActive(next);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    [active, updateActive],
  );

  const pauseTimer = useCallback(() => {
    if (!active || active.paused || (settings.hardFocus && active.mode === 'focus')) return;
    const next = { ...active, paused: true, elapsedBefore: nowSeconds(active), startedAt: Date.now() };
    updateActive(next);
  }, [active, settings.hardFocus, updateActive]);

  const resumeTimer = useCallback(() => {
    if (!active || !active.paused) return;
    updateActive({ ...active, paused: false, startedAt: Date.now() });
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [active, updateActive]);

  const skipPhase = useCallback(() => {
    if (!active || (settings.hardFocus && active.mode === 'focus')) return;
    const elapsed = nowSeconds(active);
    if (active.mode === 'focus') {
      const next = {
        ...active,
        mode: 'break' as TimerMode,
        startedAt: Date.now(),
        elapsedBefore: 0,
        focusSeconds: active.focusSeconds + elapsed,
      };
      updateActive(next);
    } else {
      finishActive(active, false);
    }
  }, [active, finishActive, settings.hardFocus, updateActive]);

  const updateSettings = useCallback(
    (patch: Partial<FocusSettings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      void persist({ settings: next, sessions, active });
    },
    [active, persist, sessions, settings],
  );

  const clearHistory = useCallback(() => {
    setSessions([]);
    void persist({ settings, sessions: [], active });
  }, [active, persist, settings]);

  const elapsedSeconds = nowSeconds(active);
  const totalSeconds = active ? (active.mode === 'focus' ? settings.focusMinutes : settings.breakMinutes) * 60 : 0;
  const todayKey = new Date().toDateString();
  const todaySeconds = sessions
    .filter((session) => new Date(session.endedAt).toDateString() === todayKey)
    .reduce((sum, session) => sum + session.focusSeconds, 0);

  const value = useMemo<FocusContextValue>(
    () => ({
      settings,
      sessions,
      active,
      hydrated,
      elapsedSeconds,
      remainingSeconds: Math.max(0, totalSeconds - elapsedSeconds),
      todaySeconds,
      startTimer,
      pauseTimer,
      resumeTimer,
      skipPhase,
      updateSettings,
      clearHistory,
    }),
    [
      active,
      clearHistory,
      elapsedSeconds,
      hydrated,
      pauseTimer,
      resumeTimer,
      sessions,
      settings,
      skipPhase,
      startTimer,
      todaySeconds,
      totalSeconds,
      updateSettings,
    ],
  );

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export function useFocusTimer() {
  const context = useContext(FocusContext);
  if (!context) throw new Error('useFocusTimer must be used inside FocusProvider');
  return context;
}