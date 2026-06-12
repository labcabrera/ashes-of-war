/**
 * Global display settings shared by catalogue views.
 */
import { createContext, createElement, ReactNode, useContext, useMemo, useState } from 'react';

export type UnitTypeIconStyle = 'pictogram' | 'nato';

interface DisplaySettings {
  unitTypeIconStyle: UnitTypeIconStyle;
}

interface DisplaySettingsContextValue extends DisplaySettings {
  setUnitTypeIconStyle: (style: UnitTypeIconStyle) => void;
}

const DISPLAY_SETTINGS_KEY = 'aow:display-settings';

const DEFAULT_SETTINGS: DisplaySettings = {
  unitTypeIconStyle: 'pictogram',
};

const DisplaySettingsContext = createContext<DisplaySettingsContextValue | undefined>(undefined);

function readSettings(): DisplaySettings {
  try {
    const raw = localStorage.getItem(DISPLAY_SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<DisplaySettings>;
    return {
      unitTypeIconStyle: parsed.unitTypeIconStyle === 'nato' ? 'nato' : 'pictogram',
    };
  } catch (error) {
    console.error('[display-settings] Failed to read settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export function DisplaySettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DisplaySettings>(readSettings);

  const value = useMemo<DisplaySettingsContextValue>(() => ({
    ...settings,
    setUnitTypeIconStyle: (unitTypeIconStyle) => {
      const next = { ...settings, unitTypeIconStyle };
      localStorage.setItem(DISPLAY_SETTINGS_KEY, JSON.stringify(next));
      setSettings(next);
    },
  }), [settings]);

  return createElement(DisplaySettingsContext.Provider, { value }, children);
}

export function useDisplaySettings() {
  const context = useContext(DisplaySettingsContext);
  if (!context) {
    throw new Error('useDisplaySettings must be used inside DisplaySettingsProvider');
  }
  return context;
}
