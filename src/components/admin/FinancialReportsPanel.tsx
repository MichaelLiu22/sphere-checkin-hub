
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileSpreadsheet, Download, BarChart3, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface SalesData {
  [key: string]: any;
  statementDate?: string;
  settlementAmount?: number;
}

const FinancialReportsPanel: React.FC = () => {
  const [uploadedData, setUploadedData] = useState<SalesData[]>([]);
  const [mappedData, setMappedData] = useState<SalesData[]>([]);
  const [fieldMapping, setFieldMapping] = useState({
    statementDate: "",
    settlementAmount: ""
  });
  const [filterDates, setFilterDates] = useState({
    startDate: "",
    endDate: ""
  });
  const [activeTab, setActiveTab] = useState("upload");
  const [profitAnalysis, setProfitAnalysis] = useState<any>(null);

  // 页面离开提醒
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (uploadedData.length > 0) {
        e.preventDefault();
        e.returnValue = "当前数据将丢失，是否继续？";
        return "当前数据将丢失，是否继续？";
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [uploadedData]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error("请上传Excel文件 (.xlsx 或 .xls)");
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log("上传的数据:", jsonData);
      setUploadedData(jsonData);
      setActiveTab("mapping");
      toast.success(`成功读取 ${jsonData.length} 条记录`);
    } catch (error) {
      console.error("文件读取失败:", error);
      toast.error("文件读取失败，请检查文件格式");
    }
  };

  const applyMapping = () => {
    if (!fieldMapping.statementDate || !fieldMapping.settlementAmount) {
      toast.error("请完成字段映射");
      return;
    }

    const mapped = uploadedData.map(row => ({
      ...row,
      statementDate: row[fieldMapping.statementDate],
      settlementAmount: parseFloat(row[fieldMapping.settlementAmount] || '0')
    }));

    setMappedData(mapped);
    setActiveTab("analysis");
    toast.success("字段映射完成");
  };

  const applyDateFilter = () => {
    if (!filterDates.startDate && !filterDates.endDate) {
      setMappedData(uploadedData.map(row => ({
        ...row,
        statementDate: row[fieldMapping.statementDate],
        settlementAmount: parseFloat(row[fieldMapping.settlementAmount] || '0')
      })));
      return;
    }

    const filtered = uploadedData.filter(row => {
      const dateStr = row[fieldMapping.statementDate];
      if (!dateStr) return true;

      const rowDate = new Date(dateStr);
      const start = filterDates.startDate ? new Date(filterDates.startDate) : new Date('1970-01-01');
      const end = filterDates.endDate ? new Date(filterDates.endDate) : new Date('2099-12-31');

      return rowDate >= start && rowDate <= end;
    });

    const mapped = filtered.map(row => ({
      ...row,
      statementDate: row[fieldMapping.statementDate],
      settlementAmount: parseFloat(row[fieldMapping.settlementAmount] || '0')
    }));

    setMappedData(mapped);
    toast.success(`筛选完成，共 ${mapped.length} 条记录`);
  };

  const calculateProfitAnalysis = async () => {
    if (mappedData.length === 0) {
      toast.error("没有数据可分析");
      return;
    }

    try {
      // 获取库存成本数据
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('sku, product_name, unit_cost');

      if (inventoryError) throw inventoryError;

      // 获取固定成本数据
      const { data: fixedCosts, error: fixedError } = await supabase
        .from('fixed_costs')
        .select('*')
        .eq('is_active', true);

      if (fixedError) throw fixedError;

      // 获取主播工资数据
      const { data: payrollData, error: payrollError } = await supabase
        .from('host_payroll')
        .select('*');

      if (payrollError) throw payrollError;

      // 计算总结算金额
      const totalSettlement = mappedData.reduce((sum, row) => sum + (row.settlementAmount || 0), 0);
      const negativeCount = mappedData.filter(row => (row.settlementAmount || 0) < 0).length;

      // 计算总固定成本（简化版，按月度换算成日均）
      const totalFixedCosts = fixedCosts?.reduce((sum, cost) => {
        if (cost.cost_type === 'monthly') {
          return sum + (cost.amount / 30);
        } else if (cost.cost_type === 'daily') {
          return sum + cost.amount;
        }
        return sum + cost.amount;
      }, 0) || 0;

      // 计算总工资成本
      const totalPayrollCosts = payrollData?.reduce((sum, payroll) => sum + payroll.total_amount, 0) || 0;

      // 估算商品成本（这里简化处理）
      const estimatedProductCosts = totalSettlement * 0.6; // 假设商品成本占营收60%

      const netProfit = totalSettlement - estimatedProductCosts - totalFixedCosts - totalPayrollCosts;

      const analysis = {
        totalOrders: mappedData.length,
        totalSettlement,
        negativeCount,
        estimatedProductCosts,
        totalFixedCosts,
        totalPayrollCosts,
        netProfit,
        profitMargin: totalSettlement > 0 ? (netProfit / totalSettlement) * 100 : 0
      };

      setProfitAnalysis(analysis);
      toast.success("利润分析完成");
    } catch (error: any) {
      console.error("分析失败:", error);
      toast.error(`分析失败: ${error.message}`);
    }
  };

  const exportCleanedData = () => {
    if (mappedData.length === 0) {
      toast.error("没有数据可导出");
      return;
    }

    const exportData = mappedData.map(row => ({
      '结算日期': row.statementDate,
      '结算金额': row.settlementAmount,
      '是否负值': (row.settlementAmount || 0) < 0 ? '是' : '否',
      ...row
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "清洗后数据");
    
    const fileName = `cleaned_financial_report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success("数据已导出");
  };

  const exportPDFReport = () => {
    if (!profitAnalysis) {
      toast.error("请先进行利润分析");
      return;
    }

    // 这里简化为导出JSON，实际应用中可以使用PDF库
    const reportData = {
      reportDate: new Date().toLocaleDateString(),
      ...profitAnalysis
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit_analysis_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("报告已导出（JSON格式）");
  };

  const clearData = () => {
    if (uploadedData.length > 0 && !confirm("确定要清除所有数据吗？")) {
      return;
    }
    setUploadedData([]);
    setMappedData([]);
    setProfitAnalysis(null);
    setFieldMapping({ statementDate: "", settlementAmount: "" });
    setFilterDates({ startDate: "", endDate: "" });
    setActiveTab("upload");
    toast.info("数据已清除");
  };

  const availableFields = uploadedData.length > 0 ? Object.keys(uploadedData[0]) : [];

  return (
    <div className="space-y-6">
      {/* 标题和清除按钮 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">📊 财务报表</h2>
          <p className="text-muted-foreground mt-2">
            上传销售数据进行财务分析，数据仅在前端处理，不保存到数据库
          </p>
        </div>
        {uploadedData.length > 0 && (
          <Button variant="outline" onClick={clearData}>
            清除数据
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">数据上传</TabsTrigger>
          <TabsTrigger value="mapping" disabled={!uploadedData.length}>字段映射</TabsTrigger>
          <TabsTrigger value="analysis" disabled={!mappedData.length}>数据分析</TabsTrigger>
          <TabsTrigger value="reports" disabled={!profitAnalysis}>报表导出</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                上传销售数据
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="salesFile">选择Excel文件</Label>
                <Input
                  id="salesFile"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
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

        <TabsContent value="mapping">
          <Card>
            <CardHeader>
              <CardTitle>字段映射</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>结算日期字段</Label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={fieldMapping.statementDate}
                    onChange={(e) => setFieldMapping(prev => ({ ...prev, statementDate: e.target.value }))}
                  >
                    <option value="">选择日期字段</option>
                    {availableFields.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>结算金额字段</Label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={fieldMapping.settlementAmount}
                    onChange={(e) => setFieldMapping(prev => ({ ...prev, settlementAmount: e.target.value }))}
                  >
                    <option value="">选择金额字段</option>
                    {availableFields.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>开始日期筛选（可选）</Label>
                  <Input
                    type="date"
                    value={filterDates.startDate}
                    onChange={(e) => setFilterDates(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>结束日期筛选（可选）</Label>
                  <Input
                    type="date"
                    value={filterDates.endDate}
                    onChange={(e) => setFilterDates(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={applyMapping}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  应用映射
                </Button>
                <Button variant="outline" onClick={applyDateFilter}>
                  应用日期筛选
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  数据预览与分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <p className="text-sm text-muted-foreground">总记录数</p>
                    <p className="text-2xl font-bold text-blue-600">{mappedData.length}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <p className="text-sm text-muted-foreground">总结算金额</p>
                    <p className="text-2xl font-bold text-green-600">
                      ¥{mappedData.reduce((sum, row) => sum + (row.settlementAmount || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded">
                    <p className="text-sm text-muted-foreground">负值记录</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {mappedData.filter(row => (row.settlementAmount || 0) < 0).length}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded">
                    <p className="text-sm text-muted-foreground">平均金额</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ¥{mappedData.length > 0 ? (mappedData.reduce((sum, row) => sum + (row.settlementAmount || 0), 0) / mappedData.length).toFixed(2) : '0'}
                    </p>
                  </div>
                </div>

                <ScrollArea className="h-64 border rounded">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="p-2 text-left">结算日期</th>
                        <th className="p-2 text-left">结算金额</th>
                        <th className="p-2 text-left">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappedData.slice(0, 100).map((row, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-2">{row.statementDate || '-'}</td>
                          <td className={`p-2 font-medium ${(row.settlementAmount || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ¥{(row.settlementAmount || 0).toLocaleString()}
                          </td>
                          <td className="p-2">
                            {(row.settlementAmount || 0) < 0 && (
                              <span className="flex items-center text-red-600">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                负值
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>

                <Button onClick={calculateProfitAnalysis} className="w-full mt-4">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  开始利润分析
                </Button>
              </CardContent>
            </Card>

            {profitAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle>利润分析结果</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <p className="text-sm text-muted-foreground">总营收</p>
                      <p className="text-xl font-bold text-blue-600">¥{profitAnalysis.totalSettlement.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded">
                      <p className="text-sm text-muted-foreground">商品成本</p>
                      <p className="text-xl font-bold text-red-600">¥{profitAnalysis.estimatedProductCosts.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded">
                      <p className="text-sm text-muted-foreground">运营成本</p>
                      <p className="text-xl font-bold text-yellow-600">
                        ¥{(profitAnalysis.totalFixedCosts + profitAnalysis.totalPayrollCosts).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <p className="text-sm text-muted-foreground">净利润</p>
                      <p className="text-xl font-bold text-green-600">¥{profitAnalysis.netProfit.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-lg">
                      净利润率: <span className="font-bold">{profitAnalysis.profitMargin.toFixed(2)}%</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                报表导出
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={exportCleanedData} variant="outline">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  导出清洗数据 (Excel)
                </Button>
                <Button onClick={exportPDFReport} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  导出分析报告 (JSON)
                </Button>
              </div>

              {profitAnalysis && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">报告摘要</h4>
                  <div className="text-sm space-y-1">
                    <p>分析日期: {new Date().toLocaleDateString()}</p>
                    <p>数据记录: {profitAnalysis.totalOrders} 条</p>
                    <p>总营收: ¥{profitAnalysis.totalSettlement.toLocaleString()}</p>
                    <p>净利润: ¥{profitAnalysis.netProfit.toLocaleString()}</p>
                    <p>利润率: {profitAnalysis.profitMargin.toFixed(2)}%</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialReportsPanel;
