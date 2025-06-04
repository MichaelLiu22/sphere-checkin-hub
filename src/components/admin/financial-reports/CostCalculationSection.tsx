
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Calculator, Loader2, Eye, Filter } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  details: {
    inventory: any[];
    fixed: any[];
    payroll: any[];
  };
}

interface CostCalculationSectionProps {
  filteredOrders: OrderData[];
  dateRange: {
    start: string;
    end: string;
  };
  fieldMapping: {
    orderDate: string;
    settlementAmount: string;
  };
  onDateFilter: (start: string, end: string) => void;
  onCostCalculation: (costBreakdown: CostBreakdown) => void;
  isCalculating: boolean;
}

const CostCalculationSection: React.FC<CostCalculationSectionProps> = ({
  filteredOrders,
  dateRange,
  fieldMapping,
  onDateFilter,
  onCostCalculation,
  isCalculating
}) => {
  const [startDate, setStartDate] = useState(dateRange.start);
  const [endDate, setEndDate] = useState(dateRange.end);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{
    orders: OrderData[];
    totalRevenue: number;
    orderCount: number;
    dateRange: { start: string; end: string };
    dayCount: number;
  } | null>(null);

  const handleDateFilter = () => {
    if (!startDate || !endDate) {
      toast.error("请选择开始和结束日期");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("开始日期不能晚于结束日期");
      return;
    }

    // 计算日期差（包含起始和结束日期）
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    console.log("日期筛选范围:", { startDate, endDate, dayCount });

    onDateFilter(startDate, endDate);
    
    // 生成预览数据
    generatePreview(startDate, endDate, dayCount);
  };

  const generatePreview = async (start: string, end: string, dayCount: number) => {
    try {
      // 从 parent component 获取原始订单数据
      // 这里我们需要重新从 parent 获取原始数据进行筛选
      // 暂时使用 filteredOrders，但实际应该从原始数据筛选
      
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      console.log("筛选条件:", { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString(),
        fieldMapping 
      });

      // 这里需要从原始数据重新筛选，而不是使用已经筛选过的数据
      // 但由于架构限制，我们先用当前的 filteredOrders
      let totalRevenue = 0;
      const validOrders = filteredOrders.filter(order => {
        const orderDateStr = order[fieldMapping.orderDate];
        if (!orderDateStr) return false;
        
        const orderDate = new Date(orderDateStr);
        if (isNaN(orderDate.getTime())) return false;
        
        const settlementAmount = parseFloat(order[fieldMapping.settlementAmount] || '0');
        totalRevenue += settlementAmount;
        
        return orderDate >= startDate && orderDate <= endDate;
      });

      setPreviewData({
        orders: validOrders,
        totalRevenue,
        orderCount: validOrders.length,
        dateRange: { start, end },
        dayCount
      });
      
      setShowPreview(true);
      
      console.log("筛选预览结果:", {
        订单数量: validOrders.length,
        总收入: totalRevenue,
        日期范围: `${start} 到 ${end}`,
        天数: dayCount
      });
      
    } catch (error) {
      console.error("生成预览失败:", error);
      toast.error("生成预览失败");
    }
  };

  const calculateCosts = async () => {
    if (!previewData || previewData.orders.length === 0) {
      toast.error("请先筛选订单数据");
      return;
    }

    try {
      const { dayCount } = previewData;
      
      // 获取库存出库成本
      const { data: inventoryHistory, error: inventoryError } = await supabase
        .from('inventory_history')
        .select('*')
        .eq('operation_type', 'remove')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`);

      if (inventoryError) throw inventoryError;

      const inventoryCost = inventoryHistory?.reduce((sum, record) => {
        return sum + ((record.unit_cost || 0) * Math.abs(record.quantity));
      }, 0) || 0;

      // 获取固定成本
      const { data: fixedCosts, error: fixedError } = await supabase
        .from('fixed_costs')
        .select('*')
        .eq('is_active', true);

      if (fixedError) throw fixedError;

      // 计算按比例分摊的固定成本
      const fixedCostDetails = fixedCosts?.map(cost => {
        let dailyAmount = 0;
        if (cost.cost_type === 'monthly') {
          dailyAmount = cost.amount / 30;
        } else if (cost.cost_type === 'weekly') {
          dailyAmount = cost.amount / 7;
        } else if (cost.cost_type === 'daily') {
          dailyAmount = cost.amount;
        }
        const allocatedAmount = dailyAmount * dayCount;
        return {
          ...cost,
          allocatedAmount,
          daysCovered: dayCount
        };
      }) || [];

      const proportionalFixedCosts = fixedCostDetails.reduce((sum, cost) => {
        return sum + cost.allocatedAmount;
      }, 0);

      // 获取工资成本
      const { data: hostPayroll, error: hostError } = await supabase
        .from('host_payroll')
        .select('*');

      const { data: operationPayroll, error: operationError } = await supabase
        .from('operation_payroll')
        .select('*');

      const { data: warehousePayroll, error: warehouseError } = await supabase
        .from('warehouse_payroll')
        .select('*');

      if (hostError || operationError || warehouseError) {
        throw new Error("获取工资数据失败");
      }

      // 计算按比例分摊的工资成本
      const allPayroll = [
        ...(hostPayroll || []).map(p => ({ ...p, department: 'host' })),
        ...(operationPayroll || []).map(p => ({ ...p, department: 'operation' })),
        ...(warehousePayroll || []).map(p => ({ ...p, department: 'warehouse' }))
      ];

      const payrollDetails = allPayroll.map(payroll => {
        let dailyAmount = 0;
        if (payroll.payment_type === 'monthly') {
          dailyAmount = payroll.total_amount / 30;
        } else if (payroll.payment_type === 'weekly') {
          dailyAmount = payroll.total_amount / 7;
        } else if (payroll.payment_type === 'daily') {
          dailyAmount = payroll.total_amount;
        } else {
          // 对于其他类型，假设是月度
          dailyAmount = payroll.total_amount / 30;
        }
        const allocatedAmount = dailyAmount * dayCount;
        return {
          ...payroll,
          allocatedAmount,
          daysCovered: dayCount
        };
      });

      const proportionalPayrollCosts = payrollDetails.reduce((sum, payroll) => {
        return sum + payroll.allocatedAmount;
      }, 0);

      const costBreakdown: CostBreakdown = {
        inventoryCost,
        fixedCosts: proportionalFixedCosts,
        payrollCosts: proportionalPayrollCosts,
        totalOtherCosts: proportionalFixedCosts + proportionalPayrollCosts,
        details: {
          inventory: inventoryHistory || [],
          fixed: fixedCostDetails,
          payroll: payrollDetails
        }
      };

      console.log("成本计算结果:", costBreakdown);
      onCostCalculation(costBreakdown);
      
    } catch (error: any) {
      console.error("成本计算失败:", error);
      toast.error(`成本计算失败: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            日期筛选与成本计算
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">开始日期 *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">结束日期 *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDateFilter} className="flex-1">
              <Filter className="mr-2 h-4 w-4" />
              筛选订单
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(!showPreview)}
              disabled={!previewData}
            >
              <Eye className="mr-2 h-4 w-4" />
              {showPreview ? '隐藏' : '显示'}预览
            </Button>
          </div>

          {previewData && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-blue-900">筛选预览结果</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">日期范围</p>
                  <p className="font-bold text-blue-600">{previewData.dayCount} 天</p>
                  <p className="text-xs text-blue-500">
                    {previewData.dateRange.start} 至 {previewData.dateRange.end}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">订单数量</p>
                  <p className="text-2xl font-bold text-green-600">{previewData.orderCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">总收入</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ${previewData.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">平均订单价值</p>
                  <p className="text-xl font-bold text-orange-600">
                    ${previewData.orderCount > 0 ? (previewData.totalRevenue / previewData.orderCount).toFixed(2) : '0'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {showPreview && previewData && (
            <Card>
              <CardHeader>
                <CardTitle>订单详情预览 (前10条)</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48 border rounded">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="p-2 text-left">订单创建日期</th>
                        <th className="p-2 text-left">结算金额</th>
                        <th className="p-2 text-left">产品名称</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.orders.slice(0, 10).map((order, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            {new Date(order[fieldMapping.orderDate]).toLocaleDateString()}
                          </td>
                          <td className="p-2 font-medium text-green-600">
                            ${parseFloat(order[fieldMapping.settlementAmount] || '0').toLocaleString()}
                          </td>
                          <td className="p-2 truncate max-w-xs">
                            {order['Product name'] || order['product_name'] || '未知产品'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
                {previewData.orders.length > 10 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    显示前10条，共{previewData.orders.length}条订单
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Button 
            onClick={calculateCosts}
            disabled={isCalculating || !previewData}
            className="w-full"
            size="lg"
          >
            {isCalculating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在计算成本...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                开始成本计算
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostCalculationSection;
