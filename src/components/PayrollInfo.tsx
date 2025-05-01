
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Star, Circle } from "lucide-react";

const PayrollInfo: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("payrollInfoTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm">
        <div className="space-y-2">
          <p className="font-bold">{t("payPeriods")}</p>
          <p>
            1–15 (<Star className="inline h-3 w-3 text-brand-accent" />)
            &nbsp;&nbsp;
            15–{t("monthEnd")} (<Star className="inline h-3 w-3 text-brand-accent" />)
          </p>
          
          <p className="font-bold">{t("payDays")}: </p>
          <p>
            5 (<Circle className="inline h-3 w-3 text-paydate" />)
            &nbsp;&nbsp; 
            20 (<Circle className="inline h-3 w-3 text-paydate" />)
          </p>
          
          <p>{t("payByHours")}</p>
          <p>{t("questionsContact")}</p>
          <p>{t("uploadInstructions")}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayrollInfo;
