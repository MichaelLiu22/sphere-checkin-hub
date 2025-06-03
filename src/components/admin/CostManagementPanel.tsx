
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Users, Factory, Download, Building } from "lucide-react";
import FixedCostsManager from "./cost-management/FixedCostsManager";
import HostPayrollManager from "./cost-management/HostPayrollManager";
import OperationPayrollManager from "./cost-management/OperationPayrollManager";
import WarehousePayrollManager from "./cost-management/WarehousePayrollManager";
import PeriodPayrollExporter from "./cost-management/PeriodPayrollExporter";

const CostManagementPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState("fixed-costs");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">💰 成本管理中心</h2>
        <p className="text-muted-foreground mt-2">
          管理固定成本和各部门工资信息，支持按期间导出综合工资表
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="fixed-costs" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            固定成本
          </TabsTrigger>
          <TabsTrigger value="host-payroll" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            主播工资
          </TabsTrigger>
          <TabsTrigger value="operation-payroll" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            运营工资
          </TabsTrigger>
          <TabsTrigger value="warehouse-payroll" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            仓库工资
          </TabsTrigger>
          <TabsTrigger value="period-export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            期间导出
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fixed-costs" className="mt-6">
          <FixedCostsManager />
        </TabsContent>

        <TabsContent value="host-payroll" className="mt-6">
          <HostPayrollManager />
        </TabsContent>

        <TabsContent value="operation-payroll" className="mt-6">
          <OperationPayrollManager />
        </TabsContent>

        <TabsContent value="warehouse-payroll" className="mt-6">
          <WarehousePayrollManager />
        </TabsContent>

        <TabsContent value="period-export" className="mt-6">
          <PeriodPayrollExporter />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CostManagementPanel;
