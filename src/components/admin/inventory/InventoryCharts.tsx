
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface InventoryItem {
  id: string;
  sku: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
  created_at: string;
}

interface InventoryChartsProps {
  inventory: InventoryItem[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'];

const InventoryCharts: React.FC<InventoryChartsProps> = ({ inventory }) => {
  const chartData = useMemo(() => {
    // 库存价值前10的商品
    const topValueItems = inventory
      .map(item => ({
        ...item,
        totalValue: item.quantity * item.unit_cost
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10)
      .map(item => ({
        name: item.product_name.length > 15 ? `${item.product_name.substring(0, 15)}...` : item.product_name,
        sku: item.sku,
        value: item.totalValue,
        quantity: item.quantity
      }));

    // 库存数量前10的商品
    const topQuantityItems = inventory
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)
      .map(item => ({
        name: item.product_name.length > 15 ? `${item.product_name.substring(0, 15)}...` : item.product_name,
        sku: item.sku,
        quantity: item.quantity,
        value: item.quantity * item.unit_cost
      }));

    // 按创建日期统计的入库趋势
    const dailyStats = inventory.reduce((acc, item) => {
      const date = item.created_at.split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, count: 0, totalValue: 0 };
      }
      acc[date].count += 1;
      acc[date].totalValue += item.quantity * item.unit_cost;
      return acc;
    }, {} as Record<string, { date: string; count: number; totalValue: number }>);

    const dailyTrend = Object.values(dailyStats)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // 最近30天

    return {
      topValueItems,
      topQuantityItems,
      dailyTrend
    };
  }, [inventory]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey === 'value' ? '库存价值' : entry.dataKey === 'quantity' ? '库存数量' : entry.dataKey === 'totalValue' ? '总价值' : entry.dataKey}: ${
                entry.dataKey === 'value' || entry.dataKey === 'totalValue' 
                  ? formatCurrency(entry.value) 
                  : entry.value
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 库存价值排行榜 */}
      <Card>
        <CardHeader>
          <CardTitle>📊 库存价值排行榜 (前10名)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.topValueItems}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 库存数量饼图 */}
        <Card>
          <CardHeader>
            <CardTitle>🥧 库存数量分布 (前10名)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.topQuantityItems}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantity"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.topQuantityItems.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 每日入库趋势 */}
        <Card>
          <CardHeader>
            <CardTitle>📈 入库趋势 (最近30天)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrency} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('zh-CN')}
                  content={<CustomTooltip />}
                />
                <Bar yAxisId="left" dataKey="count" fill="#82ca9d" name="商品种类数" />
                <Line yAxisId="right" type="monotone" dataKey="totalValue" stroke="#8884d8" name="总价值" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 统计摘要 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {inventory.length}
              </p>
              <p className="text-sm text-muted-foreground">商品种类</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {inventory.reduce((sum, item) => sum + item.quantity, 0)}
              </p>
              <p className="text-sm text-muted-foreground">总库存数量</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(inventory.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0))}
              </p>
              <p className="text-sm text-muted-foreground">总库存价值</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {inventory.length > 0 ? formatCurrency(inventory.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0) / inventory.length) : '¥0'}
              </p>
              <p className="text-sm text-muted-foreground">平均商品价值</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryCharts;
