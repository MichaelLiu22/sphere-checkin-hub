
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const PayrollInfo: React.FC = () => {
  const { t } = useLanguage();
  
  // Split the text by newlines to create paragraphs
  const infoText = t("payrollInfoText").split("\n");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("payrollInfoTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        {infoText.map((paragraph, index) => (
          <p key={index} className="mb-2">
            {paragraph}
          </p>
        ))}
      </CardContent>
    </Card>
  );
};

export default PayrollInfo;
