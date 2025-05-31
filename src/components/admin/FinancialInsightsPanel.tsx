
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileUp, Calculator, Settings, Users, Brush } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PayoutUploadForm from "./financial-insights/PayoutUploadForm";
import DataCleaningForm from "./financial-insights/DataCleaningForm";
import FixedCostsManager from "./financial-insights/FixedCostsManager";
import StreamerSalaryManager from "./financial-insights/StreamerSalaryManager";
import ProfitAnalysisView from "./financial-insights/ProfitAnalysisView";

const FinancialInsightsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [analysisData, setAnalysisData] = useState<any>(null);
  const { user } = useAuth();

  const handleAnalysisComplete = (data: any) => {
    setAnalysisData(data);
    setActiveTab("analysis");
    toast.success("毛利润分析完成！");
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-2xl font-bold">💰 财务管理（Financial Insights）</h2>
        <p className="text-muted-foreground mt-2">
          智能毛利润分析系统 - 完整的财务数据处理流程：数据上传 → 数据清洗 → 成本设置 → 利润分析
        </p>
      </div>

      {/* 主要功能标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            数据上传
          </TabsTrigger>
          <TabsTrigger value="cleaning" className="flex items-center gap-2">
            <Brush className="h-4 w-4" />
            数据清洗
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            固定成本
          </TabsTrigger>
          <TabsTrigger value="salary" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            主播工资
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            利润分析
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <PayoutUploadForm onAnalysisComplete={handleAnalysisComplete} />
        </TabsContent>

        <TabsContent value="cleaning" className="mt-6">
          <DataCleaningForm />
        </TabsContent>

        <TabsContent value="costs" className="mt-6">
          <FixedCostsManager />
        </TabsContent>

        <TabsContent value="salary" className="mt-6">
          <StreamerSalaryManager />
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <ProfitAnalysisView analysisData={analysisData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialInsightsPanel;
