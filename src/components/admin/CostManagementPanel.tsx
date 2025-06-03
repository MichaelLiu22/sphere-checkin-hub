
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Users } from "lucide-react";
import FixedCostsManager from "./cost-management/FixedCostsManager";
import HostPayrollManager from "./cost-management/HostPayrollManager";

const CostManagementPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState("fixed-costs");

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-2xl font-bold">💰 成本管理</h2>
        <p className="text-muted-foreground mt-2">
          管理固定成本和主播工资信息，数据将保存到数据库中
        </p>
      </div>

      {/* 主要功能标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fixed-costs" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            固定成本
          </TabsTrigger>
          <TabsTrigger value="host-payroll" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            主播工资
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fixed-costs" className="mt-6">
          <FixedCostsManager />
        </TabsContent>

        <TabsContent value="host-payroll" className="mt-6">
          <HostPayrollManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CostManagementPanel;
