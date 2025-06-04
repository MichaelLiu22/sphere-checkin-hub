
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Filter, TrendingDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CostCalculationSectionProps {
  filteredOrders: any[];
  dateRange: { start: string; end: string };
  fieldMapping: { orderDate: string; settlementAmount: string };
  onDateFilter: (start: string, end: string) => void;
  onCostCalculation: (costBreakdown: any) => void;
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
  const [costBreakdown, setCostBreakdown] = useState({
    inventoryCost: 0,
    fixedCosts: 0,
    payrollCosts: 0,
    totalOtherCosts: 0,
    details: {
      inventory: [],
      fixed: [],
      payroll: []
    }
  });
  const [isLoadingCosts, setIsLoadingCosts] = useState(false);

  const handleDateFilter = () => {
    if (!startDate || !endDate) {
      toast.error("请选择完整的日期范围");
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("开始日期不能晚于结束日期");
      return;
    }

    onDateFilter(startDate, endDate);
    calculateCosts(startDate, endDate);
  };

  const calculateCosts = async (start: string, end: string) => {
    setIsLoadingCosts(true);
    try {
      const startDateTime = new Date(start);
      const endDateTime = new Date(end);
      const daysDiff = Math.ceil((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24));

      // 1. Calculate inventory costs (outbound records)
      const { data: inventoryHistory, error: inventoryError } = await supabase
        .from('inventory_history')
        .select('*')
        .eq('operation_type', 'remove')
        .gte('created_at', start)
        .lte('created_at', end);

      if (inventoryError) throw inventoryError;

      const inventoryCost = inventoryHistory?.reduce((sum, record) => {
        return sum + ((record.unit_cost || 0) * Math.abs(record.quantity));
      }, 0) || 0;

      // 2. Calculate fixed costs (proportional allocation)
      const { data: fixedCosts, error: fixedError } = await supabase
        .from('fixed_costs')
        .select('*')
        .eq('is_active', true);

      if (fixedError) throw fixedError;

      let totalFixedCost = 0;
      const fixedCostDetails: any[] = [];

      fixedCosts?.forEach(cost => {
        let allocatedAmount = 0;
        
        if (cost.cost_type === 'monthly') {
          allocatedAmount = (cost.amount * daysDiff) / 30;
        } else if (cost.cost_type === 'weekly') {
          allocatedAmount = (cost.amount * daysDiff) / 7;
        } else if (cost.cost_type === 'daily') {
          allocatedAmount = cost.amount * daysDiff;
        } else {
          allocatedAmount = cost.amount;
        }
        
        totalFixedCost += allocatedAmount;
        fixedCostDetails.push({
          ...cost,
          allocatedAmount,
          daysCovered: daysDiff
        });
      });

      // 3. Calculate payroll costs (proportional allocation)
      const promises = [
        supabase.from('host_payroll').select('*').gte('created_at', start).lte('created_at', end),
        supabase.from('operation_payroll').select('*').gte('created_at', start).lte('created_at', end),
        supabase.from('warehouse_payroll').select('*').gte('created_at', start).lte('created_at', end)
      ];

      const [hostResult, operationResult, warehouseResult] = await Promise.all(promises);

      const allPayrollData = [
        ...(hostResult.data || []).map(p => ({ ...p, department: 'host' })),
        ...(operationResult.data || []).map(p => ({ ...p, department: 'operation' })),
        ...(warehouseResult.data || []).map(p => ({ ...p, department: 'warehouse' }))
      ];

      const totalPayrollCost = allPayrollData.reduce((sum, record) => {
        return sum + (record.total_amount || 0);
      }, 0);

      const breakdown = {
        inventoryCost,
        fixedCosts: totalFixedCost,
        payrollCosts: totalPayrollCost,
        totalOtherCosts: totalFixedCost + totalPayrollCost,
        details: {
          inventory: inventoryHistory || [],
          fixed: fixedCostDetails,
          payroll: allPayrollData
        }
      };

      setCostBreakdown(breakdown);
      toast.success("成本计算完成");

    } catch (error: any) {
      console.error("成本计算失败:", error);
      toast.error(`成本计算失败: ${error.message}`);
    } finally {
      setIsLoadingCosts(false);
    }
  };

  const handleFinalCalculation = () => {
    if (filteredOrders.length === 0) {
      toast.error("请先筛选订单数据");
      return;
    }

    onCostCalculation(costBreakdown);
  };

  // Calculate total revenue from filtered orders
  const totalRevenue = filteredOrders.reduce((sum, order) => {
    return sum + (parseFloat(order[fieldMapping.settlementAmount] || '0'));
  }, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            日期筛选
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">开始日期</Label>
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

          <Button onClick={handleDateFilter} disabled={!startDate || !endDate || isLoadingCosts}>
            {isLoadingCosts ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Filter className="mr-2 h-4 w-4" />
            )}
            应用日期筛选并计算成本
          </Button>

          {filteredOrders.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">筛选结果</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">订单数量:</span>
                  <span className="font-bold ml-2">{filteredOrders.length}</span>
                </div>
                <div>
                  <span className="text-blue-700">总收入:</span>
                  <span className="font-bold ml-2 text-green-600">${totalRevenue.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-blue-700">日期范围:</span>
                  <span className="font-medium ml-2">{startDate} 至 {endDate}</span>
                </div>
                <div>
                  <span className="text-blue-700">天数:</span>
                  <span className="font-medium ml-2">
                    {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} 天
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {(costBreakdown.inventoryCost > 0 || costBreakdown.totalOtherCosts > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              成本明细分析
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-900">库存出库成本</h4>
                <p className="text-2xl font-bold text-red-700">${costBreakdown.inventoryCost.toFixed(2)}</p>
                <p className="text-sm text-red-600">{costBreakdown.details.inventory.length} 条出库记录</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-orange-900">固定成本</h4>
                <p className="text-2xl font-bold text-orange-700">${costBreakdown.fixedCosts.toFixed(2)}</p>
                <p className="text-sm text-orange-600">{costBreakdown.details.fixed.length} 项固定成本</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900">工资成本</h4>
                <p className="text-2xl font-bold text-purple-700">${costBreakdown.payrollCosts.toFixed(2)}</p>
                <p className="text-sm text-purple-600">{costBreakdown.details.payroll.length} 条工资记录</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">总成本汇总</h4>
                  <p className="text-sm text-gray-600">
                    库存成本 + 固定成本 + 工资成本 = 总成本
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">
                    ${(costBreakdown.inventoryCost + costBreakdown.totalOtherCosts).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleFinalCalculation}
              disabled={isCalculating || filteredOrders.length === 0}
              className="w-full"
              size="lg"
            >
              {isCalculating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Calculator className="mr-2 h-4 w-4" />
              )}
              生成财务报表
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CostCalculationSection;
