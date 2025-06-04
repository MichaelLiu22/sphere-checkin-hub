
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, TrendingUp, PieChart, Download } from "lucide-react";
import { toast } from "sonner";
import DataUploadSection from "./DataUploadSection";
import CostCalculationSection from "./CostCalculationSection";
import ReportVisualization from "./ReportVisualization";
import ReportExport from "./ReportExport";

interface OrderData {
  [key: string]: any;
  orderDate?: string;
  settlementAmount?: number;
}

interface CostBreakdown {
  inventoryCost: number;
  fixedCosts: number;
  payrollCosts: number;
  totalOtherCosts: number;
}

interface FinancialSummary {
  dateRange: {
    start: string;
    end: string;
  };
  orderCount: number;
  totalRevenue: number;
  costBreakdown: CostBreakdown;
  grossProfit: number;
  profitMargin: number;
}

const FinancialReportPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [orderData, setOrderData] = useState<OrderData[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderData[]>([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [fieldMapping, setFieldMapping] = useState({
    orderDate: "",
    settlementAmount: ""
  });
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasUnsavedData, setHasUnsavedData] = useState(false);

  // Page protection mechanism
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedData) {
        e.preventDefault();
        e.returnValue = "Warning: Leaving this page will discard all uploaded data and changes. Are you sure you want to leave?";
        return "Warning: Leaving this page will discard all uploaded data and changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedData]);

  const handleDataUpload = (data: OrderData[], mapping: any) => {
    setOrderData(data);
    setFieldMapping(mapping);
    setHasUnsavedData(true);
    setActiveTab("calculation");
    toast.success(`成功上传 ${data.length} 条订单数据`);
  };

  const handleDateFilter = (start: string, end: string) => {
    if (!orderData.length) {
      toast.error("请先上传订单数据");
      return;
    }

    if (!fieldMapping.orderDate) {
      toast.error("请先完成字段映射");
      return;
    }

    const filtered = orderData.filter(order => {
      const orderDate = new Date(order[fieldMapping.orderDate]);
      if (isNaN(orderDate.getTime())) return false;
      
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      return orderDate >= startDate && orderDate <= endDate;
    });

    setFilteredOrders(filtered);
    setDateRange({ start, end });
    
    const totalRevenue = filtered.reduce((sum, order) => {
      return sum + (parseFloat(order[fieldMapping.settlementAmount] || '0'));
    }, 0);

    toast.success(`筛选完成：${filtered.length} 条订单，总收入 $${totalRevenue.toFixed(2)}`);
  };

  const handleCostCalculation = (costBreakdown: CostBreakdown) => {
    if (!filteredOrders.length) {
      toast.error("请先筛选订单数据");
      return;
    }

    setIsCalculating(true);
    
    // Calculate total revenue from filtered orders
    const totalRevenue = filteredOrders.reduce((sum, order) => {
      return sum + (parseFloat(order[fieldMapping.settlementAmount] || '0'));
    }, 0);

    // Calculate gross profit
    const totalCosts = costBreakdown.inventoryCost + costBreakdown.totalOtherCosts;
    const grossProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const summary: FinancialSummary = {
      dateRange,
      orderCount: filteredOrders.length,
      totalRevenue,
      costBreakdown,
      grossProfit,
      profitMargin
    };

    setFinancialSummary(summary);
    setActiveTab("report");
    setIsCalculating(false);
    
    toast.success("财务报表计算完成");
  };

  const handleExportComplete = () => {
    setHasUnsavedData(false);
    toast.success("报表已导出，数据已保存");
  };

  const clearAllData = () => {
    if (hasUnsavedData && !confirm("确定要清除所有数据吗？这将丢失当前的分析结果。")) {
      return;
    }
    
    setOrderData([]);
    setFilteredOrders([]);
    setFinancialSummary(null);
    setDateRange({ start: "", end: "" });
    setFieldMapping({ orderDate: "", settlementAmount: "" });
    setHasUnsavedData(false);
    setActiveTab("upload");
    toast.info("数据已清除");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            财务报表分析
          </h2>
          <p className="text-muted-foreground mt-2">
            上传TikTok订单数据，自动计算成本并生成毛利润分析报表
          </p>
        </div>
        {hasUnsavedData && (
          <div className="flex gap-2">
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              未保存的数据
            </div>
            <button
              onClick={clearAllData}
              className="text-red-600 hover:text-red-800 text-sm underline"
            >
              清除数据
            </button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">数据上传</TabsTrigger>
          <TabsTrigger value="calculation" disabled={!orderData.length}>成本计算</TabsTrigger>
          <TabsTrigger value="report" disabled={!financialSummary}>报表展示</TabsTrigger>
          <TabsTrigger value="export" disabled={!financialSummary}>导出报表</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <DataUploadSection 
            onDataUpload={handleDataUpload}
            existingData={orderData}
            fieldMapping={fieldMapping}
          />
        </TabsContent>

        <TabsContent value="calculation">
          <CostCalculationSection
            filteredOrders={filteredOrders}
            dateRange={dateRange}
            fieldMapping={fieldMapping}
            onDateFilter={handleDateFilter}
            onCostCalculation={handleCostCalculation}
            isCalculating={isCalculating}
          />
        </TabsContent>

        <TabsContent value="report">
          {financialSummary && (
            <ReportVisualization
              financialSummary={financialSummary}
              orderData={filteredOrders}
              fieldMapping={fieldMapping}
            />
          )}
        </TabsContent>

        <TabsContent value="export">
          {financialSummary && (
            <ReportExport
              financialSummary={financialSummary}
              orderData={filteredOrders}
              onExportComplete={handleExportComplete}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialReportPanel;
