
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-24">
          {language === "en" ? "English" : language === "zh" ? "中文" : "Español"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-24">
        <DropdownMenuItem onClick={() => setLanguage("en")}>
          {t("languageEn")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("zh")}>
          {t("languageZh")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("es")}>
          {t("languageEs")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
