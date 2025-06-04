
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from "recharts";
import { TrendingUp, DollarSign, Package, Users, Calendar } from "lucide-react";

interface ReportVisualizationProps {
  financialSummary: any;
  orderData: any[];
  fieldMapping: any;
}

const ReportVisualization: React.FC<ReportVisualizationProps> = ({
  financialSummary,
  orderData,
  fieldMapping
}) => {
  // Prepare cost structure data for pie chart
  const costStructureData = [
    {
      name: "库存成本",
      value: financialSummary.costBreakdown.inventoryCost,
      color: "#ef4444"
    },
    {
      name: "固定成本",
      value: financialSummary.costBreakdown.fixedCosts,
      color: "#f97316"
    },
    {
      name: "工资成本",
      value: financialSummary.costBreakdown.payrollCosts,
      color: "#8b5cf6"
    }
  ].filter(item => item.value > 0);

  // Prepare daily revenue trend data
  const dailyRevenueMap = new Map();
  orderData.forEach(order => {
    const date = new Date(order[fieldMapping.orderDate]).toISOString().split('T')[0];
    const amount = parseFloat(order[fieldMapping.settlementAmount] || '0');
    
    if (dailyRevenueMap.has(date)) {
      dailyRevenueMap.set(date, dailyRevenueMap.get(date) + amount);
    } else {
      dailyRevenueMap.set(date, amount);
    }
  });

  const dailyRevenueData = Array.from(dailyRevenueMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString(),
      revenue: revenue,
      orders: orderData.filter(order => 
        new Date(order[fieldMapping.orderDate]).toISOString().split('T')[0] === date
      ).length
    }));

  const COLORS = ['#ef4444', '#f97316', '#8b5cf6', '#06b6d4'];

  // Safely access details with fallbacks
  const inventoryDetails = financialSummary.costBreakdown.details?.inventory || [];
  const fixedDetails = financialSummary.costBreakdown.details?.fixed || [];
  const payrollDetails = financialSummary.costBreakdown.details?.payroll || [];

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">总收入</p>
                <p className="text-2xl font-bold text-blue-700">
                  ${financialSummary.totalRevenue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">总成本</p>
                <p className="text-2xl font-bold text-red-700">
                  ${(financialSummary.costBreakdown.inventoryCost + financialSummary.costBreakdown.totalOtherCosts).toFixed(2)}
                </p>
              </div>
              <Package className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">毛利润</p>
                <p className="text-2xl font-bold text-green-700">
                  ${financialSummary.grossProfit.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">利润率</p>
                <p className="text-2xl font-bold text-purple-700">
                  {financialSummary.profitMargin.toFixed(2)}%
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Financial Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            财务汇总报表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-6 rounded-lg font-mono text-sm">
            <h3 className="text-lg font-bold mb-4">📊 Financial Summary Report</h3>
            
            <div className="space-y-2">
              <p><strong>📅 Date Range:</strong> {financialSummary.dateRange.start} - {financialSummary.dateRange.end}</p>
              <p><strong>📦 Orders:</strong> {financialSummary.orderCount}</p>
              <p><strong>💰 Total Revenue:</strong> ${financialSummary.totalRevenue.toFixed(2)}</p>
              
              <div className="mt-4">
                <p><strong>📦 Inventory Cost:</strong> ${financialSummary.costBreakdown.inventoryCost.toFixed(2)}</p>
                <div className="ml-4 text-gray-600">
                  <p>• 基于库存出库记录计算</p>
                  <p>• {inventoryDetails.length} 条出库记录</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p><strong>🧾 Other Costs:</strong> ${financialSummary.costBreakdown.totalOtherCosts.toFixed(2)}</p>
                <div className="ml-4 text-gray-600">
                  <p>• 固定成本: ${financialSummary.costBreakdown.fixedCosts.toFixed(2)} ({fixedDetails.length} 项)</p>
                  <p>• 工资成本: ${financialSummary.costBreakdown.payrollCosts.toFixed(2)} ({payrollDetails.length} 条记录)</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t-2 border-gray-300">
                <p className="text-lg"><strong>💵 Gross Profit:</strong> Total Revenue - Inventory Cost - Other Costs = <span className="text-green-600">${financialSummary.grossProfit.toFixed(2)}</span></p>
                <p><strong>📈 Profit Margin:</strong> {financialSummary.profitMargin.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Structure Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>成本结构分析</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costStructureData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costStructureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`$${value.toFixed(2)}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>每日收入趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any, name: string) => [
                  name === 'revenue' ? `$${value.toFixed(2)}` : value,
                  name === 'revenue' ? '收入' : '订单数'
                ]} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  name="收入"
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  name="订单数"
                  yAxisId="right"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Profit Analysis Chart */}
      <Card>
        <CardHeader>
          <CardTitle>利润分析对比</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={[
                {
                  category: '财务概览',
                  收入: financialSummary.totalRevenue,
                  库存成本: financialSummary.costBreakdown.inventoryCost,
                  其他成本: financialSummary.costBreakdown.totalOtherCosts,
                  毛利润: financialSummary.grossProfit
                }
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="收入" fill="#22c55e" />
              <Bar dataKey="库存成本" fill="#ef4444" />
              <Bar dataKey="其他成本" fill="#f97316" />
              <Bar dataKey="毛利润" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportVisualization;
