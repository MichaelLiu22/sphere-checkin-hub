import React, { createContext, useContext, useState } from "react";
import { translations, TranslationKey } from "@/i18n/translations";

type Language = "en" | "zh" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

// Default to browser language if available, otherwise use English
const getBrowserLanguage = (): Language => {
  const lang = navigator.language.split("-")[0];
  return (lang === "zh" || lang === "es") ? lang as Language : "en";
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(getBrowserLanguage());

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
