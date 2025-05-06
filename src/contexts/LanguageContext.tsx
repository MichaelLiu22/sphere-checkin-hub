
import React, { createContext, useContext, useState } from "react";
import { translations } from "@/i18n/translations";

// Define TranslationKey type ourselves since it's not exported from the translations file
type TranslationKey = string;

type Language = "en" | "zh" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
}

// Default to browser language if available, otherwise use English
const getBrowserLanguage = (): Language => {
  const lang = navigator.language.split("-")[0];
  return (lang === "zh" || lang === "es") ? lang as Language : "en";
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(getBrowserLanguage());

  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    let text = translations[language]?.[key] || translations.en?.[key] || key;
    
    // Replace parameters in the text if they exist (for example: "welcomeUser" with {{name}})
    if (params) {
      Object.keys(params).forEach(param => {
        text = text.replace(`{{${param}}}`, params[param] || '');
      });
    }
    
    return text;
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
