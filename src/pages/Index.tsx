
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PayrollCalendar from "@/components/PayrollCalendar";
import PayrollInfo from "@/components/PayrollInfo";
import FileUploadForm from "@/components/FileUploadForm";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-dark">{t("appTitle")}</h1>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="container flex-grow py-8 animate-fade-in">
        {/* Welcome Banner */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold">🎉 {t("welcomeBanner")} 🎉</h2>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FileUploadForm />
          </div>
          <div className="space-y-6">
            <PayrollCalendar />
            <PayrollInfo />
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-4">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} MS Sphere Media
        </div>
      </footer>
    </div>
  );
};

export default Index;
