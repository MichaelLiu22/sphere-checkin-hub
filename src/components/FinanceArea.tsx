
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Clock, Calendar, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PayrollInfo from "./PayrollInfo";

interface FinanceAreaProps {
  userId: string;
}

const FinanceArea: React.FC<FinanceAreaProps> = ({ userId }) => {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workHours, setWorkHours] = useState({
    currentWeek: 28,
    lastWeek: 32,
    total: 460
  });

  useEffect(() => {
    // In a real application, this would fetch from the database
    // Simulating financial documents and work hours
    const mockDocuments = [
      { id: 1, name: t("reimbursementForm"), description: t("reimbursementFormDesc"), url: "#" },
      { id: 2, name: t("directDepositForm"), description: t("directDepositFormDesc"), url: "#" },
      { id: 3, name: t("w9Form"), description: t("w9FormDesc"), url: "https://www.irs.gov/pub/irs-pdf/fw9.pdf" },
    ];
    
    setDocuments(mockDocuments);
    setLoading(false);
  }, [t, userId]);

  return (
    <div className="space-y-6">
      {/* Work Hours Summary */}
      <div className="border rounded-md p-4">
        <h3 className="font-semibold flex items-center mb-3">
          <Clock className="mr-2 h-4 w-4" />
          {t("workHours")}
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-blue-50 rounded">
            <div className="text-2xl font-bold">{workHours.currentWeek}</div>
            <div className="text-xs text-muted-foreground">{t("currentWeek")}</div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-2xl font-bold">{workHours.lastWeek}</div>
            <div className="text-xs text-muted-foreground">{t("lastWeek")}</div>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <div className="text-2xl font-bold">{workHours.total}</div>
            <div className="text-xs text-muted-foreground">{t("totalHours")}</div>
          </div>
        </div>
      </div>

      {/* Payroll Information */}
      <div className="border rounded-md p-4">
        <h3 className="font-semibold flex items-center mb-3">
          <Calendar className="mr-2 h-4 w-4" />
          {t("payrollCycle")}
        </h3>
        <div className="text-sm">
          <PayrollInfo />
        </div>
      </div>

      {/* Downloadable Documents */}
      <div>
        <h3 className="font-semibold flex items-center mb-3">
          <Download className="mr-2 h-4 w-4" />
          {t("companyDocuments")}
        </h3>
        
        {loading ? (
          <div className="text-center py-4">
            {t("loading")}...
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-3 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{doc.name}</h4>
                    <p className="text-xs text-muted-foreground">{doc.description}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      {t("download")}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceArea;
