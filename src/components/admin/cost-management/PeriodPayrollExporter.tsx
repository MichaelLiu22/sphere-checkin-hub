
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PeriodPayrollExporter: React.FC = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();

  const fetchPayrollData = async () => {
    try {
      // 获取主播工资数据
      const { data: hostData, error: hostError } = await supabase
        .from('host_payroll')
        .select('*')
        .gte('work_date', startDate)
        .lte('work_date', endDate)
        .order('work_date');

      if (hostError) throw hostError;

      // 获取运营工资数据
      const { data: operationData, error: operationError } = await supabase
        .from('operation_payroll')
        .select('*')
        .gte('period', startDate)
        .lte('period', endDate)
        .order('period');

      if (operationError) throw operationError;

      // 获取仓库工资数据
      const { data: warehouseData, error: warehouseError } = await supabase
        .from('warehouse_payroll')
        .select('*')
        .gte('period', startDate)
        .lte('period', endDate)
        .order('period');

      if (warehouseError) throw warehouseError;

      return {
        hostData: hostData || [],
        operationData: operationData || [],
        warehouseData: warehouseData || []
      };
    } catch (error) {
      console.error('获取工资数据失败:', error);
      throw error;
    }
  };

  const exportToExcel = async () => {
    if (!startDate || !endDate) {
      toast.error("请选择开始和结束日期");
      return;
    }

    if (!user?.id) {
      toast.error("用户未登录");
      return;
    }

    setIsExporting(true);

    try {
      const payrollData = await fetchPayrollData();
      const workbook = XLSX.utils.book_new();

      // 创建主播工资表
      if (payrollData.hostData.length > 0) {
        const hostSheet = XLSX.utils.json_to_sheet(
          payrollData.hostData.map((record: any) => ({
            '部门': '主播',
            '姓名': record.host_name,
            '工作日期': record.work_date,
            '工作小时': record.hours_worked,
            '时薪': record.hourly_rate,
            '提成': record.commission || 0,
            '总金额': record.total_amount,
            '结算频率': record.settlement_frequency,
            '支付类型': record.payment_type,
            '期间': record.period,
            '备注': record.notes || ''
          }))
        );
        XLSX.utils.book_append_sheet(workbook, hostSheet, "主播工资");
      }

      // 创建运营工资表
      if (payrollData.operationData.length > 0) {
        const operationSheet = XLSX.utils.json_to_sheet(
          payrollData.operationData.map((record: any) => ({
            '部门': '运营',
            '员工姓名': record.employee_name,
            '期间': record.period,
            '基本工资': record.base_salary,
            '工作小时': record.hours_worked || 0,
            '时薪': record.hourly_rate || 0,
            '提成': record.commission || 0,
            '奖金': record.bonus || 0,
            '总金额': record.total_amount,
            '支付类型': record.payment_type,
            '结算频率': record.settlement_frequency,
            '备注': record.notes || ''
          }))
        );
        XLSX.utils.book_append_sheet(workbook, operationSheet, "运营工资");
      }

      // 创建仓库工资表
      if (payrollData.warehouseData.length > 0) {
        const warehouseSheet = XLSX.utils.json_to_sheet(
          payrollData.warehouseData.map((record: any) => ({
            '部门': '仓库',
            '员工姓名': record.employee_name,
            '期间': record.period,
            '基本工资': record.base_salary || 0,
            '工作小时': record.hours_worked || 0,
            '时薪': record.hourly_rate,
            '加班小时': record.overtime_hours || 0,
            '加班时薪': record.overtime_rate || 0,
            '总金额': record.total_amount,
            '支付类型': record.payment_type,
            '结算频率': record.settlement_frequency,
            '备注': record.notes || ''
          }))
        );
        XLSX.utils.book_append_sheet(workbook, warehouseSheet, "仓库工资");
      }

      // 创建汇总表
      const totalHostAmount = payrollData.hostData.reduce((sum: number, record: any) => sum + (record.total_amount || 0), 0);
      const totalOperationAmount = payrollData.operationData.reduce((sum: number, record: any) => sum + (record.total_amount || 0), 0);
      const totalWarehouseAmount = payrollData.warehouseData.reduce((sum: number, record: any) => sum + (record.total_amount || 0), 0);
      const grandTotal = totalHostAmount + totalOperationAmount + totalWarehouseAmount;

      const summarySheet = XLSX.utils.json_to_sheet([
        { '部门': '主播', '人数': payrollData.hostData.length, '总金额': totalHostAmount },
        { '部门': '运营', '人数': payrollData.operationData.length, '总金额': totalOperationAmount },
        { '部门': '仓库', '人数': payrollData.warehouseData.length, '总金额': totalWarehouseAmount },
        { '部门': '合计', '人数': payrollData.hostData.length + payrollData.operationData.length + payrollData.warehouseData.length, '总金额': grandTotal }
      ]);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "汇总");

      // 导出文件
      const fileName = `综合工资表_${startDate}_${endDate}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      // 保存导出记录到数据库
      const exportRecord = {
        export_period: `${startDate}_${endDate}`,
        period_start: startDate,
        period_end: endDate,
        total_amount: grandTotal,
        department_breakdown: {
          host: { count: payrollData.hostData.length, total: totalHostAmount },
          operation: { count: payrollData.operationData.length, total: totalOperationAmount },
          warehouse: { count: payrollData.warehouseData.length, total: totalWarehouseAmount }
        },
        export_data: {
          host: payrollData.hostData,
          operation: payrollData.operationData,
          warehouse: payrollData.warehouseData
        },
        exported_by: user.id
      };

      const { error: insertError } = await supabase
        .from('payroll_exports')
        .insert(exportRecord);

      if (insertError) {
        console.error('保存导出记录失败:', insertError);
        toast.error(`保存导出记录失败: ${insertError.message}`);
      } else {
        toast.success(`工资表导出成功！文件名: ${fileName}`);
      }

    } catch (error: any) {
      console.error('导出失败:', error);
      toast.error(`导出失败: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            期间工资表导出
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">开始日期</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">结束日期</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">导出说明</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 导出的Excel将包含所有部门的详细工资信息</li>
              <li>• 按部门分为不同的工作表：主播工资、运营工资、仓库工资</li>
              <li>• 包含汇总表显示各部门统计信息</li>
              <li>• 每个员工的工资记录都会单独显示，不会合并</li>
            </ul>
          </div>

          <Button
            onClick={exportToExcel}
            disabled={isExporting || !startDate || !endDate}
            className="w-full"
            size="lg"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {isExporting ? "导出中..." : "导出综合工资表"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PeriodPayrollExporter;
