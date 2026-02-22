"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import en, { Translations } from "@/i18n/en";
import bn from "@/i18n/bn";
import ar from "@/i18n/ar";

// ─── Supported languages ──────────────────────────────────────────────────────

export type Locale = "en" | "bn" | "ar";

export const LANGUAGES: { code: Locale; label: string; flag: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "bn", label: "বাংলা", flag: "🇧🇩", dir: "ltr" },
  { code: "ar", label: "العربية", flag: "🇸🇦", dir: "rtl" },
];

const TRANSLATIONS: Record<Locale, Translations> = { en, bn, ar };

// ─── Context ──────────────────────────────────────────────────────────────────

interface LanguageContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (l: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "en",
  t: en,
  setLocale: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Load saved preference on mount
  useEffect(() => {
    const saved = (localStorage.getItem("lg_locale") as Locale) ?? "en";
    if (saved && TRANSLATIONS[saved]) {
      setLocaleState(saved);
      // Apply RTL direction
      document.documentElement.dir = LANGUAGES.find((l) => l.code === saved)?.dir ?? "ltr";
      document.documentElement.lang = saved;
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("lg_locale", l);
    const lang = LANGUAGES.find((x) => x.code === l);
    document.documentElement.dir = lang?.dir ?? "ltr";
    document.documentElement.lang = l;
  };

  return (
    <LanguageContext.Provider
      value={{ locale, t: TRANSLATIONS[locale], setLocale }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
