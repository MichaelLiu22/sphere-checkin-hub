
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2, Calculator } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PayoutUploadFormProps {
  onAnalysisComplete: (data: any) => void;
}

const PayoutUploadForm: React.FC<PayoutUploadFormProps> = ({ onAnalysisComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [analysisName, setAnalysisName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error("请上传Excel文件 (.xlsx 或 .xls)");
      return;
    }

    setIsProcessing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log("上传的数据:", jsonData);
      setUploadedData(jsonData);
      toast.success(`成功读取 ${jsonData.length} 条记录`);
    } catch (error) {
      console.error("文件读取失败:", error);
      toast.error("文件读取失败，请检查文件格式");
    } finally {
      setIsProcessing(false);
    }
  };

  const processAnalysis = async () => {
    if (!uploadedData.length) {
      toast.error("请先上传TikTok导出文件");
      return;
    }

    if (!analysisName.trim()) {
      toast.error("请输入分析报告名称");
      return;
    }

    setIsProcessing(true);
    try {
      // 获取库存数据（商品成本）
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('sku, product_name, unit_cost');

      if (inventoryError) throw inventoryError;

      // 获取固定成本数据
      const { data: fixedCosts, error: fixedCostsError } = await supabase
        .from('fixed_costs')
        .select('*')
        .eq('is_active', true);

      if (fixedCostsError) throw fixedCostsError;

      // 获取主播工资数据
      const { data: streamerSalary, error: salaryError } = await supabase
        .from('streamer_salary')
        .select('*')
        .eq('is_active', true);

      if (salaryError) throw salaryError;

      // 处理数据并计算毛利润
      const analysisResult = await calculateProfitAnalysis(
        uploadedData,
        inventoryData || [],
        fixedCosts || [],
        streamerSalary || []
      );

      // 保存分析结果到数据库
      const { data: savedAnalysis, error: saveError } = await supabase
        .from('profit_analysis')
        .insert({
          analysis_name: analysisName,
          analysis_date: new Date().toISOString().split('T')[0],
          payout_data: uploadedData,
          cost_breakdown: analysisResult.costBreakdown,
          profit_summary: analysisResult.profitSummary,
          created_by: user?.id
        })
        .select()
        .single();

      if (saveError) throw saveError;

      onAnalysisComplete({
        ...analysisResult,
        analysisId: savedAnalysis.id,
        analysisName
      });

      // 重置表单
      setUploadedData([]);
      setAnalysisName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (error: any) {
      console.error("分析处理失败:", error);
      toast.error(`分析失败: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateProfitAnalysis = async (
    payoutData: any[],
    inventory: any[],
    fixedCosts: any[],
    streamerSalary: any[]
  ) => {
    // 创建SKU到成本的映射
    const skuCostMap = new Map();
    inventory.forEach(item => {
      skuCostMap.set(item.sku, item.unit_cost);
    });

    // 计算每日固定成本
    const dailyFixedCost = fixedCosts.reduce((total, cost) => {
      if (cost.cost_type === 'monthly') {
        return total + (cost.amount / 30); // 按30天计算
      } else if (cost.cost_type === 'daily') {
        return total + cost.amount;
      }
      return total;
    }, 0);

    // 处理每笔订单
    const processedOrders = payoutData.map((order, index) => {
      const sku = order.SKU || order.sku || '';
      const quantity = parseInt(order.Quantity || order.quantity || '1');
      const revenue = parseFloat(order.Revenue || order.revenue || '0');
      
      // 获取商品成本
      const unitCost = skuCostMap.get(sku) || 0;
      const totalProductCost = unitCost * quantity;
      
      // 分摊固定成本 (按订单数平均分配)
      const allocatedFixedCost = dailyFixedCost / payoutData.length;
      
      // 分摊主播工资 (简化：按订单数平均分配)
      const totalSalaryCost = streamerSalary.reduce((total, salary) => {
        if (salary.salary_type === 'monthly') {
          return total + (salary.base_amount / 30 / payoutData.length);
        }
        return total;
      }, 0);

      const totalCost = totalProductCost + allocatedFixedCost + totalSalaryCost;
      const profit = revenue - totalCost;

      return {
        ...order,
        orderId: index + 1,
        sku,
        quantity,
        revenue,
        productCost: totalProductCost,
        fixedCost: allocatedFixedCost,
        salaryCost: totalSalaryCost,
        totalCost,
        profit,
        profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0
      };
    });

    // 汇总数据
    const profitSummary = {
      totalRevenue: processedOrders.reduce((sum, order) => sum + order.revenue, 0),
      totalProductCost: processedOrders.reduce((sum, order) => sum + order.productCost, 0),
      totalFixedCost: processedOrders.reduce((sum, order) => sum + order.fixedCost, 0),
      totalSalaryCost: processedOrders.reduce((sum, order) => sum + order.salaryCost, 0),
      totalCost: processedOrders.reduce((sum, order) => sum + order.totalCost, 0),
      totalProfit: processedOrders.reduce((sum, order) => sum + order.profit, 0),
      orderCount: processedOrders.length,
      averageOrderValue: processedOrders.length > 0 ? processedOrders.reduce((sum, order) => sum + order.revenue, 0) / processedOrders.length : 0,
      profitMargin: 0
    };

    profitSummary.profitMargin = profitSummary.totalRevenue > 0 ? 
      (profitSummary.totalProfit / profitSummary.totalRevenue) * 100 : 0;

    return {
      processedOrders,
      profitSummary,
      costBreakdown: {
        productCosts: inventory,
        fixedCosts,
        streamerSalary,
        dailyFixedCost
      }
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            上传TikTok Payout数据
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="analysisName">分析报告名称</Label>
            <Input
              id="analysisName"
              placeholder="例如：2024年1月毛利润分析"
              value={analysisName}
              onChange={(e) => setAnalysisName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="payoutFile">选择Excel文件</Label>
            <Input
              id="payoutFile"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              ref={fileInputRef}
              disabled={isProcessing}
            />
          </div>

          {uploadedData.length > 0 && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-700">
                ✅ 已成功读取 {uploadedData.length} 条记录
              </p>
            </div>
          )}

          <Button 
            onClick={processAnalysis}
            disabled={isProcessing || !uploadedData.length || !analysisName}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在分析...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                开始毛利润分析
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayoutUploadForm;
