
import React, { createContext, useContext, useState } from "react";
import { LangKey, TranslationKey, translations } from "@/translations";

interface LanguageContextType {
  t: (key: TranslationKey) => string;
  language: LangKey;
  setLanguage: (language: LangKey) => void;
}

// Default to browser language if available, otherwise use English
const getBrowserLanguage = (): LangKey => {
  const lang = navigator.language.split("-")[0];
  return (lang === "zh" || lang === "es") ? lang as LangKey : "en";
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<LangKey>(getBrowserLanguage());

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ t, language, setLanguage }}>
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
