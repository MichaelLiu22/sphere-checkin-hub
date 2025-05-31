import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Loader2, Filter, Eye, Calculator } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DataUploadAndCleaningProps {
  onAnalysisComplete: (data: any) => void;
}

const DataUploadAndCleaning: React.FC<DataUploadAndCleaningProps> = ({ onAnalysisComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [analysisName, setAnalysisName] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const [settlementResult, setSettlementResult] = useState<any>(null);
  
  // 筛选条件
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSKUs, setSelectedSKUs] = useState<string[]>([]);
  
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
      setFilteredData(jsonData); // 初始设置为全部数据
      setActiveTab("preview"); // 自动切换到预览标签
      toast.success(`成功读取 ${jsonData.length} 条记录`);
    } catch (error) {
      console.error("文件读取失败:", error);
      toast.error("文件读取失败，请检查文件格式");
    } finally {
      setIsProcessing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...uploadedData];

    // 按日期筛选 - 检查多个可能的日期字段
    if (startDate || endDate) {
      filtered = filtered.filter((row) => {
        // 尝试多个可能的日期字段名
        const possibleDateFields = [
          'Order Create Day', 
          'order create day', 
          'Order Create Date', 
          'order create date',
          'Date', 
          'date', 
          'created_at',
          'Created At'
        ];
        
        let orderDate = null;
        for (const field of possibleDateFields) {
          if (row[field]) {
            orderDate = new Date(row[field]);
            if (!isNaN(orderDate.getTime())) {
              break;
            }
          }
        }
        
        if (!orderDate || isNaN(orderDate.getTime())) {
          console.log("无法解析订单日期，保留该记录:", row);
          return true; // 如果日期无效，保留数据
        }
        
        const start = startDate ? new Date(startDate) : new Date('1970-01-01');
        const end = endDate ? new Date(endDate) : new Date('2099-12-31');
        
        return orderDate >= start && orderDate <= end;
      });
    }

    // 按SKU筛选
    if (selectedSKUs.length > 0) {
      filtered = filtered.filter((row) => {
        const sku = row.SKU || row.sku || '';
        return selectedSKUs.includes(sku);
      });
    }

    setFilteredData(filtered);
    toast.success(`筛选完成，共 ${filtered.length} 条记录`);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedSKUs([]);
    setFilteredData(uploadedData);
    setSettlementResult(null);
    toast.info("已清除所有筛选条件");
  };

  const calculateSettlement = async () => {
    if (filteredData.length === 0) {
      toast.error("没有数据可以计算");
      return;
    }

    setIsProcessing(true);
    try {
      // 获取库存数据来计算成本
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('sku, product_name, unit_cost');

      if (inventoryError) throw inventoryError;

      // 创建SKU到成本的映射
      const skuCostMap = new Map();
      inventoryData?.forEach(item => {
        skuCostMap.set(item.sku, item.unit_cost);
      });

      // 计算Settlement数据
      let totalRevenue = 0;
      let totalCost = 0;
      let missingCostItems = [];
      let missingCostCount = 0;

      const processedData = filteredData.map((row, index) => {
        const sku = row.SKU || row.sku || '';
        const quantity = parseInt(row.Quantity || row.quantity || '1');
        const revenue = parseFloat(row.Revenue || row.revenue || row.Settlement || row.settlement || '0');
        
        const unitCost = skuCostMap.get(sku);
        let itemCost = 0;
        
        if (unitCost !== undefined) {
          itemCost = unitCost * quantity;
        } else {
          missingCostItems.push({ sku, quantity });
          missingCostCount += quantity;
        }

        totalRevenue += revenue;
        totalCost += itemCost;

        return {
          orderId: index + 1,
          sku,
          quantity,
          revenue,
          unitCost: unitCost || '缺失',
          itemCost,
          hasCost: unitCost !== undefined
        };
      });

      const settlement = {
        totalOrders: filteredData.length,
        totalRevenue,
        totalCost,
        totalProfit: totalRevenue - totalCost,
        profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
        missingCostItems,
        missingCostCount,
        dateRange: {
          start: startDate || "不限",
          end: endDate || "不限"
        },
        uniqueSKUs: [...new Set(filteredData.map(row => row.SKU || row.sku || ''))].filter(Boolean),
        processedData
      };

      console.log("Settlement计算结果:", settlement);
      setSettlementResult(settlement);
      toast.success("Settlement计算完成");
      
    } catch (error: any) {
      console.error("Settlement计算失败:", error);
      toast.error(`计算失败: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const processAnalysis = async () => {
    if (!filteredData.length) {
      toast.error("请先上传并筛选数据");
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
        filteredData, // 使用筛选后的数据
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
          payout_data: filteredData,
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
      setFilteredData([]);
      setAnalysisName("");
      setStartDate("");
      setEndDate("");
      setSelectedSKUs([]);
      setSettlementResult(null);
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
        return total + (cost.amount / 30);
      } else if (cost.cost_type === 'daily') {
        return total + cost.amount;
      }
      return total;
    }, 0);

    // 处理每笔订单
    const processedOrders = payoutData.map((order, index) => {
      const sku = order.SKU || order.sku || '';
      const quantity = parseInt(order.Quantity || order.quantity || '1');
      const revenue = parseFloat(order.Revenue || order.revenue || order.Settlement || order.settlement || '0');
      
      const unitCost = skuCostMap.get(sku) || 0;
      const totalProductCost = unitCost * quantity;
      const allocatedFixedCost = dailyFixedCost / payoutData.length;
      
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

  // 获取唯一的SKU列表
  const uniqueSKUs = [...new Set(uploadedData.map(row => row.SKU || row.sku || ''))].filter(Boolean);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">数据上传</TabsTrigger>
          <TabsTrigger value="preview" disabled={!uploadedData.length}>数据预览</TabsTrigger>
          <TabsTrigger value="cleaning" disabled={!uploadedData.length}>数据清洗</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                数据预览 ({filteredData.length} 条记录)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <ScrollArea className="h-96 w-full">
                  <div className="min-w-max">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          {uploadedData.length > 0 && Object.keys(uploadedData[0]).slice(0, 10).map((key) => (
                            <th key={key} className="p-2 text-left border-r whitespace-nowrap">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.slice(0, 100).map((row, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            {Object.values(row).slice(0, 10).map((value: any, colIndex) => (
                              <td key={colIndex} className="p-2 border-r whitespace-nowrap">
                                {value?.toString() || ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
                {filteredData.length > 100 && (
                  <div className="p-3 text-center text-muted-foreground bg-muted/30">
                    显示前100条记录，总共 {filteredData.length} 条
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cleaning">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                数据清洗与筛选
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">开始日期 (根据Order Create Date筛选)</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">结束日期</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {uniqueSKUs.length > 0 && (
                <div>
                  <Label>选择SKU筛选</Label>
                  <ScrollArea className="h-32 border rounded-lg p-3">
                    {uniqueSKUs.map((sku) => (
                      <div key={sku} className="flex items-center space-x-2 mb-1">
                        <input
                          type="checkbox"
                          id={`sku-${sku}`}
                          checked={selectedSKUs.includes(sku)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSKUs(prev => [...prev, sku]);
                            } else {
                              setSelectedSKUs(prev => prev.filter(s => s !== sku));
                            }
                          }}
                        />
                        <label htmlFor={`sku-${sku}`} className="text-sm">{sku}</label>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={applyFilters}>
                  <Filter className="mr-2 h-4 w-4" />
                  应用筛选
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  清除筛选
                </Button>
                <Button 
                  variant="outline" 
                  onClick={calculateSettlement}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Calculator className="mr-2 h-4 w-4" />
                  )}
                  计算Settlement
                </Button>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  当前筛选结果：{filteredData.length} 条记录
                  {startDate && ` | 开始日期: ${startDate}`}
                  {endDate && ` | 结束日期: ${endDate}`}
                  {selectedSKUs.length > 0 && ` | 已选SKU: ${selectedSKUs.length}个`}
                </p>
              </div>

              {/* Settlement计算结果 */}
              {settlementResult && (
                <Card className="bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-800">Settlement计算结果</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">总订单数</p>
                        <p className="text-2xl font-bold text-blue-600">{settlementResult.totalOrders}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">总收入</p>
                        <p className="text-2xl font-bold text-green-600">¥{settlementResult.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">总成本</p>
                        <p className="text-2xl font-bold text-red-600">¥{settlementResult.totalCost.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">毛利润</p>
                        <p className="text-2xl font-bold text-purple-600">¥{settlementResult.totalProfit.toLocaleString()}</p>
                      </div>
                    </div>

                    {settlementResult.missingCostCount > 0 && (
                      <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3">
                        <h4 className="font-semibold text-yellow-800 mb-2">⚠️ 缺失成本警告</h4>
                        <p className="text-yellow-700 mb-2">
                          共有 <strong>{settlementResult.missingCostCount}</strong> 个商品缺失成本数据
                        </p>
                        <div className="text-sm text-yellow-600">
                          <p>缺失成本的SKU:</p>
                          {settlementResult.missingCostItems.slice(0, 5).map((item: any, index: number) => (
                            <span key={index} className="inline-block bg-yellow-200 rounded px-2 py-1 mr-1 mb-1">
                              {item.sku} (数量: {item.quantity})
                            </span>
                          ))}
                          {settlementResult.missingCostItems.length > 5 && (
                            <span className="text-yellow-500">...还有{settlementResult.missingCostItems.length - 5}个</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-green-700">
                      <p>毛利率: {settlementResult.profitMargin.toFixed(2)}%</p>
                      <p>唯一SKU数: {settlementResult.uniqueSKUs.length}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 开始分析按钮 */}
      {filteredData.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <Button 
              onClick={processAnalysis}
              disabled={isProcessing || !analysisName}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在分析...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  开始毛利润分析 ({filteredData.length} 条记录)
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataUploadAndCleaning;
