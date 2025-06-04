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
    console.log("上传的订单数据:", data.length, "条");
    console.log("字段映射:", mapping);
    
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

    if (!fieldMapping.orderDate || !fieldMapping.settlementAmount) {
      toast.error("请先完成字段映射");
      return;
    }

    console.log("开始筛选订单数据");
    console.log("筛选条件:", { start, end });
    console.log("字段映射:", fieldMapping);
    console.log("原始数据数量:", orderData.length);

    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0); // 设置为当天开始
    
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999); // 设置为当天结束
    
    // 修正筛选逻辑，确保包含结束日期
    const filtered = orderData.filter(order => {
      const orderDateStr = order[fieldMapping.orderDate];
      if (!orderDateStr) {
        console.log("订单缺少日期字段:", order);
        return false;
      }
      
      const orderDate = new Date(orderDateStr);
      if (isNaN(orderDate.getTime())) {
        console.log("订单日期格式无效:", orderDateStr, order);
        return false;
      }
      
      // 使用包含边界的日期比较
      const isInRange = orderDate >= startDate && orderDate <= endDate;
      if (isInRange) {
        console.log("订单在范围内:", {
          orderDate: orderDate.toISOString().split('T')[0],
          settlementAmount: order[fieldMapping.settlementAmount]
        });
      }
      
      return isInRange;
    });

    console.log("筛选后的订单数量:", filtered.length);

    setFilteredOrders(filtered);
    setDateRange({ start, end });
    
    const totalRevenue = filtered.reduce((sum, order) => {
      const amount = parseFloat(order[fieldMapping.settlementAmount] || '0');
      return sum + amount;
    }, 0);

    const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    console.log("筛选结果汇总:", {
      订单数量: filtered.length,
      总收入: totalRevenue,
      日期范围: `${start} 到 ${end}`,
      天数: dayCount
    });

    toast.success(`筛选完成：${filtered.length} 条订单，${dayCount} 天，总收入 $${totalRevenue.toLocaleString()}`);
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

    console.log("财务汇总:", summary);

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
            originalOrderData={orderData}
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
