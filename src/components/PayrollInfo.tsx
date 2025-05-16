
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Star, Circle } from "lucide-react";

const PayrollInfo: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="prose prose-sm max-w-none">
      <div className="space-y-2">
        <p className="font-bold">{t("payPeriods")}</p>
        <p>
          15–{t("monthEnd")} (<Star className="inline h-3 w-3 text-brand-accent" />)
          &nbsp;&nbsp;
          {t("monthEnd")}–15 (<Star className="inline h-3 w-3 text-brand-accent" />)
        </p>
        
        <p className="font-bold">{t("payDays")}: </p>
        <p>
          5 (<Circle className="inline h-3 w-3 text-paydate" />)
          &nbsp;&nbsp; 
          20 (<Circle className="inline h-3 w-3 text-paydate" />)
        </p>
        
        <p className="italic">{t("payDayExplanation")}</p>
        <p>{t("checkEmployeePage")}</p>
        <p>{t("questionsContact")}</p>
        <p>{t("w9Reminder")}</p>
        <p className="font-bold text-destructive">{t("noPayWarning")}</p>
      </div>
    </div>
  );
};

export default PayrollInfo;
