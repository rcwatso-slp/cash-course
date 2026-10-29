import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ChangeLevel, PriceLevel, Wallet } from './problems';
import { readJSON, writeJSON } from './storage';

export type PayWith = 'nextBill' | 'twenty' | 'nextDollar' | 'choose';
export type HelpLevel = 0 | 1 | 2 | 3;

export interface Settings {
  nickname: string;
  pin: string | null;

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

const KEY = 'cashcourse.settings.v1';

export function loadSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...readJSON<Partial<Settings>>(KEY, {}) };
}

interface SettingsContextValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      writeJSON(KEY, next);
      return next;
    });
  }, []);
  const value = useMemo(() => ({ settings, update }), [settings, update]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
