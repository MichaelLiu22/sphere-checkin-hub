
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FileDown, TrendingUp, TrendingDown, DollarSign, Package, Users, Calculator } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface ProfitAnalysisViewProps {
  analysisData: any;
}

const ProfitAnalysisView: React.FC<ProfitAnalysisViewProps> = ({ analysisData }) => {
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filteredData, setFilteredData] = useState(null);

  if (!analysisData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Calculator className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">暂无分析数据，请先上传TikTok导出文件进行分析</p>
        </CardContent>
      </Card>
    );
  }

  const { processedOrders, profitSummary } = analysisData;

  // 应用日期筛选
  const applyDateFilter = () => {
    if (!filterStartDate && !filterEndDate) {
      setFilteredData(null);
      return;
    }

    const filtered = processedOrders.filter((order: any) => {
      const orderDate = new Date(order.Date || order.date || order.created_at || new Date());
      const start = filterStartDate ? new Date(filterStartDate) : new Date('1970-01-01');
      const end = filterEndDate ? new Date(filterEndDate) : new Date('2099-12-31');
      
      return orderDate >= start && orderDate <= end;
    });

    // 重新计算汇总数据
    const newSummary = {
      totalRevenue: filtered.reduce((sum: number, order: any) => sum + order.revenue, 0),
      totalProductCost: filtered.reduce((sum: number, order: any) => sum + order.productCost, 0),
      totalFixedCost: filtered.reduce((sum: number, order: any) => sum + order.fixedCost, 0),
      totalSalaryCost: filtered.reduce((sum: number, order: any) => sum + order.salaryCost, 0),
      totalCost: filtered.reduce((sum: number, order: any) => sum + order.totalCost, 0),
      totalProfit: filtered.reduce((sum: number, order: any) => sum + order.profit, 0),
      orderCount: filtered.length,
      averageOrderValue: filtered.length > 0 ? filtered.reduce((sum: number, order: any) => sum + order.revenue, 0) / filtered.length : 0,
      profitMargin: 0
    };

    newSummary.profitMargin = newSummary.totalRevenue > 0 ? 
      (newSummary.totalProfit / newSummary.totalRevenue) * 100 : 0;

    setFilteredData({
      processedOrders: filtered,
      profitSummary: newSummary
    });

    toast.success(`筛选完成，共 ${filtered.length} 条记录`);
  };

  const currentData = filteredData || analysisData;
  const currentSummary = currentData.profitSummary;

  // 导出Excel
  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // 汇总数据
      const summaryData = [
        ['指标', '数值'],
        ['总销售额', `¥${currentSummary.totalRevenue.toLocaleString()}`],
        ['总商品成本', `¥${currentSummary.totalProductCost.toLocaleString()}`],
        ['总固定成本', `¥${currentSummary.totalFixedCost.toLocaleString()}`],
        ['总人力成本', `¥${currentSummary.totalSalaryCost.toLocaleString()}`],
        ['总成本', `¥${currentSummary.totalCost.toLocaleString()}`],
        ['总利润', `¥${currentSummary.totalProfit.toLocaleString()}`],
        ['利润率', `${currentSummary.profitMargin.toFixed(2)}%`],
        ['订单数量', currentSummary.orderCount],
        ['平均订单价值', `¥${currentSummary.averageOrderValue.toLocaleString()}`]
      ];
      
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, '利润汇总');
      
      // 详细订单数据
      const detailWs = XLSX.utils.json_to_sheet(currentData.processedOrders);
      XLSX.utils.book_append_sheet(wb, detailWs, '订单详情');
      
      XLSX.writeFile(wb, `利润分析报告_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('报告导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      toast.error('导出失败');
    }
  };

  // 准备图表数据
  const chartData = [
    { name: '销售额', value: currentSummary.totalRevenue, color: '#22c55e' },
    { name: '商品成本', value: currentSummary.totalProductCost, color: '#ef4444' },
    { name: '固定成本', value: currentSummary.totalFixedCost, color: '#f59e0b' },
    { name: '人力成本', value: currentSummary.totalSalaryCost, color: '#8b5cf6' },
    { name: '利润', value: currentSummary.totalProfit, color: '#06b6d4' }
  ];

  const costBreakdownData = [
    { name: '商品成本', value: currentSummary.totalProductCost, color: '#ef4444' },
    { name: '固定成本', value: currentSummary.totalFixedCost, color: '#f59e0b' },
    { name: '人力成本', value: currentSummary.totalSalaryCost, color: '#8b5cf6' }
  ];

  return (
    <div className="space-y-6">
      {/* 筛选器 */}
      <Card>
        <CardHeader>
          <CardTitle>📊 利润分析报告</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div>
              <Label htmlFor="startDate">开始日期</Label>
              <Input
                id="startDate"
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">结束日期</Label>
              <Input
                id="endDate"
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
            <Button onClick={applyDateFilter}>
              应用筛选
            </Button>
            <Button variant="outline" onClick={() => {
              setFilterStartDate("");
              setFilterEndDate("");
              setFilteredData(null);
            }}>
              清除筛选
            </Button>
            <Button onClick={exportToExcel} className="ml-auto">
              <FileDown className="mr-2 h-4 w-4" />
              导出Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">总销售额</p>
                <p className="text-2xl font-bold text-green-600">
                  ¥{currentSummary.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">总成本</p>
                <p className="text-2xl font-bold text-blue-600">
                  ¥{currentSummary.totalCost.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {currentSummary.totalProfit >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
              <div>
                <p className="text-sm text-muted-foreground">净利润</p>
                <p className={`text-2xl font-bold ${currentSummary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ¥{currentSummary.totalProfit.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">利润率</p>
                <p className={`text-2xl font-bold ${currentSummary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {currentSummary.profitMargin.toFixed(2)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 图表展示 */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">总览图表</TabsTrigger>
          <TabsTrigger value="breakdown">成本分解</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>收入与支出对比</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `¥${Number(value).toLocaleString()}`} />
                  <Bar dataKey="value" fill="#8884d8">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle>成本结构分析</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={costBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {costBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `¥${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 详细数据表格 */}
      <Card>
        <CardHeader>
          <CardTitle>订单详情 ({currentSummary.orderCount} 条记录)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">订单号</th>
                  <th className="p-2 text-left">SKU</th>
                  <th className="p-2 text-right">销售额</th>
                  <th className="p-2 text-right">商品成本</th>
                  <th className="p-2 text-right">固定成本</th>
                  <th className="p-2 text-right">人力成本</th>
                  <th className="p-2 text-right">总成本</th>
                  <th className="p-2 text-right">利润</th>
                  <th className="p-2 text-right">利润率</th>
                </tr>
              </thead>
              <tbody>
                {currentData.processedOrders.slice(0, 100).map((order: any, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{order.orderId}</td>
                    <td className="p-2">{order.sku}</td>
                    <td className="p-2 text-right">¥{order.revenue.toLocaleString()}</td>
                    <td className="p-2 text-right">¥{order.productCost.toFixed(2)}</td>
                    <td className="p-2 text-right">¥{order.fixedCost.toFixed(2)}</td>
                    <td className="p-2 text-right">¥{order.salaryCost.toFixed(2)}</td>
                    <td className="p-2 text-right">¥{order.totalCost.toFixed(2)}</td>
                    <td className={`p-2 text-right ${order.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ¥{order.profit.toFixed(2)}
                    </td>
                    <td className={`p-2 text-right ${order.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {order.profitMargin.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {currentData.processedOrders.length > 100 && (
              <div className="p-4 text-center text-muted-foreground">
                显示前100条记录，完整数据请导出Excel查看
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitAnalysisView;
