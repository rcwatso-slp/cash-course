import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { ALL_AREAS, type AreaId, type ExerciseRx, type Level, type ResponseMode, type SrtTarget } from '../hub/types';
import type { ChangeLevel, PriceLevel, Wallet } from './problems';
import { resetSeen } from './seen';
import { readJSON, writeJSON } from './storage';

export type PayWith = 'nextBill' | 'twenty' | 'nextDollar' | 'choose';
export type HelpLevel = 0 | 1 | 2 | 3;

export interface Settings {
  nickname: string;
  /** The clinician's PIN. Stored once for the device, not per patient. */
  pin: string | null;

  /** Areas this patient sees on the home screen. One area = go straight to it. */
  areas: AreaId[];

  taxOn: boolean;
  taxRate: number;
  taxMode: 'app' | 'client';
  priceLevel: PriceLevel;
  orderMode: 'free' | 'task';
  menuStyle: 'kiosk' | 'board';
  showRunningTotal: boolean;
  calculator: boolean;

  payWith: PayWith;
  changeLevel: ChangeLevel;
  changeHelpStyle: 'countUp' | 'column';
  wrongChangeRate: number;
  setLength: number; // problems per set in drills, 0 = no limit
  wallet: Wallet;
  giftCard: number; // online stores: gift card balance in cents
  budget: number; // cents he has to spend; 0 = off, -1 = random $10–$30 each order
  tipMode: 'choose' | 'calculate';
  tipPct: number;
  sayOrder: boolean; // restaurants: practice saying the order at the counter
  scamPopups: boolean; // stores: fake pop-ups now and then

  // Memory
  memoryLevel: Level;
  wordListLength: number;
  recallDelay: number; // seconds of filler before recall
  srtTargets: SrtTarget[];

  // Language
  languageLevel: Level;
  responseMode: ResponseMode;
  choiceCount: number;

  // Speech
  speechLevel: Level;
  micOn: boolean;
  loudTarget: number; // 0–100 on the app's meter
  paceMs: number; // ms per word on the pacing board

  // Swallowing
  exercises: ExerciseRx[];
  strategies: string[];
  dietSolids: string;
  dietLiquids: string;
  swallowNotes: string;

  // Reasoning and Thinking & Planning
  reasoningLevel: Level;
  executiveLevel: Level;

  masteryPct: number;
  masterySessions: number;
  masteryMin: number; // problems of a skill needed for a session to count

  maxHelp: HelpLevel;
  startHelp: HelpLevel;
  helpDelay: number; // seconds before Help can be pressed
  autoHintOnWrong: boolean;

  readAloud: boolean;
  largeText: boolean;
  highContrast: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  nickname: '',
  pin: null,

  areas: ALL_AREAS,

  taxOn: false,
  taxRate: 7.25,
  taxMode: 'app',
  priceLevel: 3,
  orderMode: 'free',
  menuStyle: 'kiosk',
  showRunningTotal: false,
  calculator: false,

  payWith: 'twenty',
  changeLevel: 1,
  changeHelpStyle: 'countUp',
  wrongChangeRate: 0.5,
  setLength: 10,
  wallet: { 100: 5, 500: 1, 1000: 1, 2000: 1 },
  giftCard: 5000,
  budget: 0,
  tipMode: 'choose',
  tipPct: 20,
  sayOrder: false,
  scamPopups: false,

  memoryLevel: 1,
  wordListLength: 5,
  recallDelay: 30,
  srtTargets: [],

  languageLevel: 1,
  responseMode: 'spoken',
  choiceCount: 4,

  speechLevel: 1,
  micOn: false,
  loudTarget: 60,
  paceMs: 900,

  exercises: [],
  strategies: [],
  dietSolids: '',
  dietLiquids: '',
  swallowNotes: '',

  reasoningLevel: 1,
  executiveLevel: 1,

  masteryPct: 80,
  masterySessions: 3,
  masteryMin: 5,

  maxHelp: 3,
  startHelp: 0,
  helpDelay: 0,
  autoHintOnWrong: false,

  readAloud: true,
  largeText: false,
  highContrast: false,
};

// ---------- Storage: one Settings per patient, plus one PIN for the device ----------

/** Cash Course stored one set of settings here. It becomes the first patient. */
export const OLD_SETTINGS_KEY = 'cashcourse.settings.v1';
export const PROFILES_KEY = 'hub.profiles.v1';
export const PIN_KEY = 'hub.pin.v1';

export type PatientSettings = Omit<Settings, 'pin'>;

export interface ProfileStore {
  activeId: string;
  /** In the order they were added. */
  ids: string[];
  profiles: Record<string, PatientSettings>;
}

export const newProfileId = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

function withoutPin(s: Partial<Settings>): Partial<PatientSettings> {
  const { pin: _pin, ...rest } = s;
  void _pin;
  return rest;
}

export function fillDefaults(saved: Partial<Settings>): PatientSettings {
  return withoutPin({ ...DEFAULT_SETTINGS, ...saved }) as PatientSettings;
}

/**
 * Load the profile store. The first time, the old Cash Course settings become patient 1
 * and their PIN becomes the device PIN, so nothing set up before is lost.
 */
export function loadStore(
  read: <T>(key: string, fallback: T) => T,
  makeId: () => string = newProfileId,
): { store: ProfileStore; pin: string | null; migrated: boolean } {
  const saved = read<ProfileStore | null>(PROFILES_KEY, null);
  if (saved && saved.ids?.length && saved.profiles?.[saved.activeId]) {
    const profiles = Object.fromEntries(saved.ids.map((id) => [id, fillDefaults(saved.profiles[id] ?? {})]));
    return { store: { ...saved, profiles }, pin: read<string | null>(PIN_KEY, null), migrated: false };
  }
  const old = read<Partial<Settings> | null>(OLD_SETTINGS_KEY, null);
  const id = makeId();
  // Someone who already used Cash Course on this device keeps seeing just Cash Course.
  const first = old ? fillDefaults({ areas: ['money'], ...old }) : fillDefaults({});
  return {
    store: { activeId: id, ids: [id], profiles: { [id]: first } },
    pin: read<string | null>(PIN_KEY, null) ?? old?.pin ?? null,
    migrated: old !== null,
  };
}

/** Kept for tools that only need the active patient's settings. */
export function loadSettings(): Settings {
  const { store, pin } = loadStore(readJSON);
  return { ...store.profiles[store.activeId], pin };
}

// ---------- React context ----------

export interface Patient {
  id: string;
  nickname: string;
}

interface SettingsContextValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  patients: Patient[];
  activeId: string;
  switchPatient: (id: string) => void;
  addPatient: (nickname: string, copyFrom?: string) => string;
  removePatient: (id: string) => void;
  /** Replace everything (backup import). */
  replaceProfiles: (store: ProfileStore) => void;
  store: ProfileStore;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => {
    const loaded = loadStore(readJSON);
    if (loaded.migrated || readJSON(PROFILES_KEY, null) === null) {
      writeJSON(PROFILES_KEY, loaded.store);
      if (loaded.pin) writeJSON(PIN_KEY, loaded.pin);
    }
    return { store: loaded.store, pin: loaded.pin };
  });

  const save = useCallback((store: ProfileStore, pin: string | null) => {
    writeJSON(PROFILES_KEY, store);
    writeJSON(PIN_KEY, pin);
    return { store, pin };
  }, []);

  const update = useCallback(
    (patch: Partial<Settings>) => {
      setState((prev) => {
        const pin = 'pin' in patch ? (patch.pin ?? null) : prev.pin;
        const id = prev.store.activeId;
        const profile = { ...prev.store.profiles[id], ...withoutPin(patch) };
        return save({ ...prev.store, profiles: { ...prev.store.profiles, [id]: profile } }, pin);
      });
    },
    [save],
  );

  const switchPatient = useCallback(
    (id: string) => setState((prev) => (prev.store.profiles[id] ? save({ ...prev.store, activeId: id }, prev.pin) : prev)),
    [save],
  );

  const addPatient = useCallback(
    (nickname: string, copyFrom?: string) => {
      const id = newProfileId();
      setState((prev) => {
        const base = copyFrom && prev.store.profiles[copyFrom] ? prev.store.profiles[copyFrom] : fillDefaults({});
        const profile: PatientSettings = { ...base, nickname, srtTargets: copyFrom ? base.srtTargets : [] };
        return save({ activeId: id, ids: [...prev.store.ids, id], profiles: { ...prev.store.profiles, [id]: profile } }, prev.pin);
      });
      return id;
    },
    [save],
  );

  const removePatient = useCallback(
    (id: string) =>
      setState((prev) => {
        if (prev.store.ids.length > 1) resetSeen(id);
        if (prev.store.ids.length <= 1) return prev;
        const ids = prev.store.ids.filter((x) => x !== id);
        const profiles = { ...prev.store.profiles };
        delete profiles[id];
        const activeId = prev.store.activeId === id ? ids[0] : prev.store.activeId;
        return save({ activeId, ids, profiles }, prev.pin);
      }),
    [save],
  );

  const replaceProfiles = useCallback(
    (store: ProfileStore) =>
      setState((prev) => {
        const profiles = Object.fromEntries(store.ids.map((id) => [id, fillDefaults(store.profiles[id] ?? {})]));
        const activeId = profiles[store.activeId] ? store.activeId : store.ids[0];
        return save({ activeId, ids: store.ids, profiles }, prev.pin);
      }),
    [save],
  );

  const value = useMemo<SettingsContextValue>(() => {
    const { store, pin } = state;
    return {
      settings: { ...store.profiles[store.activeId], pin },
      update,
      patients: store.ids.map((id) => ({ id, nickname: store.profiles[id].nickname })),
      activeId: store.activeId,
      switchPatient,
      addPatient,
      removePatient,
      replaceProfiles,
      store,
    };
  }, [state, update, switchPatient, addPatient, removePatient, replaceProfiles]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
