
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Calendar, FileText, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import * as XLSX from "xlsx";

interface PayrollSummary {
  department: string;
  count: number;
  totalAmount: number;
  records: any[];
}

const PeriodPayrollExporter: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [periodType, setPeriodType] = useState("half_monthly");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [previewData, setPreviewData] = useState<PayrollSummary[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuth();

  const getQuickPeriodDates = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    if (periodType === "first_half") {
      // 当月上半月 (1-15号)
      return {
        start: `${year}-${String(month + 1).padStart(2, '0')}-01`,
        end: `${year}-${String(month + 1).padStart(2, '0')}-15`,
        period: `${year}-${String(month + 1).padStart(2, '0')} 上半月`
      };
    } else if (periodType === "second_half") {
      // 当月下半月 (16号-月末)
      const lastDay = new Date(year, month + 1, 0).getDate();
      return {
        start: `${year}-${String(month + 1).padStart(2, '0')}-16`,
        end: `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`,
        period: `${year}-${String(month + 1).padStart(2, '0')} 下半月`
      };
    } else if (periodType === "last_month") {
      // 上个月整月
      const lastMonth = month === 0 ? 11 : month - 1;
      const lastMonthYear = month === 0 ? year - 1 : year;
      const lastDay = new Date(lastMonthYear, lastMonth + 1, 0).getDate();
      return {
        start: `${lastMonthYear}-${String(lastMonth + 1).padStart(2, '0')}-01`,
        end: `${lastMonthYear}-${String(lastMonth + 1).padStart(2, '0')}-${lastDay}`,
        period: `${lastMonthYear}-${String(lastMonth + 1).padStart(2, '0')} 整月`
      };
    } else {
      // 自定义期间
      return {
        start: customStartDate,
        end: customEndDate,
        period: `${customStartDate} 至 ${customEndDate}`
      };
    }
  };

  const fetchPayrollData = async (startDate: string, endDate: string) => {
    const results: PayrollSummary[] = [];

    try {
      // 获取主播工资数据
      const { data: hostData, error: hostError } = await supabase
        .from('host_payroll')
        .select('*')
        .gte('period', startDate)
        .lte('period', endDate);

      if (hostError) throw hostError;

      if (hostData && hostData.length > 0) {
        results.push({
          department: '主播部门',
          count: hostData.length,
          totalAmount: hostData.reduce((sum, record) => sum + record.total_amount, 0),
          records: hostData
        });
      }

      // 获取运营工资数据
      const { data: operationData, error: operationError } = await supabase
        .from('operation_payroll')
        .select('*')
        .gte('period', startDate)
        .lte('period', endDate);

      if (operationError) throw operationError;

      if (operationData && operationData.length > 0) {
        results.push({
          department: '运营部门',
          count: operationData.length,
          totalAmount: operationData.reduce((sum, record) => sum + record.total_amount, 0),
          records: operationData
        });
      }

      // 获取仓库工资数据
      const { data: warehouseData, error: warehouseError } = await supabase
        .from('warehouse_payroll')
        .select('*')
        .gte('period', startDate)
        .lte('period', endDate);

      if (warehouseError) throw warehouseError;

      if (warehouseData && warehouseData.length > 0) {
        results.push({
          department: '仓库部门',
          count: warehouseData.length,
          totalAmount: warehouseData.reduce((sum, record) => sum + record.total_amount, 0),
          records: warehouseData
        });
      }

    } catch (error: any) {
      console.error("获取工资数据失败:", error);
      throw error;
    }

    return results;
  };

  const handlePreview = async () => {
    const { start, end } = getQuickPeriodDates();
    
    if (!start || !end) {
      toast.error("请选择有效的时间期间");
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchPayrollData(start, end);
      setPreviewData(data);
      setShowPreview(true);
      
      if (data.length === 0) {
        toast.info("所选期间内没有工资记录");
      } else {
        toast.success(`找到 ${data.length} 个部门的工资记录`);
      }
    } catch (error: any) {
      console.error("预览失败:", error);
      toast.error(`预览失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (previewData.length === 0) {
      toast.error("没有数据可导出，请先进行预览");
      return;
    }

    const { start, end, period } = getQuickPeriodDates();

    setIsLoading(true);
    try {
      // 创建Excel工作簿
      const workbook = XLSX.utils.book_new();

      // 创建总结页
      const summaryData = [
        ['工资期间汇总报表'],
        ['期间:', period],
        ['导出时间:', new Date().toLocaleString()],
        ['导出人:', user?.full_name || 'Unknown'],
        [''],
        ['部门', '人数', '总金额($)'],
        ...previewData.map(dept => [dept.department, dept.count, dept.totalAmount.toFixed(2)]),
        [''],
        ['总计', previewData.reduce((sum, dept) => sum + dept.count, 0), previewData.reduce((sum, dept) => sum + dept.totalAmount, 0).toFixed(2)]
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "汇总");

      // 为每个部门创建详细页
      previewData.forEach(dept => {
        let detailData: any[] = [];
        
        if (dept.department === '主播部门') {
          detailData = dept.records.map(record => ({
            '姓名': record.host_name,
            '期间': record.period,
            '薪资类型': record.payment_type === 'monthly' ? '月薪' : '时薪',
            '工作时长': record.hours_worked || '-',
            '基础薪资($)': record.hourly_rate,
            '佣金($)': record.commission,
            '总薪资($)': record.total_amount,
            '结算频率': record.settlement_frequency === 'half_monthly' ? '半月结' : '月结',
            '备注': record.notes || ''
          }));
        } else if (dept.department === '运营部门') {
          detailData = dept.records.map(record => ({
            '姓名': record.employee_name,
            '期间': record.period,
            '薪资类型': record.payment_type === 'monthly' ? '月薪' : '时薪',
            '基础薪资($)': record.base_salary || (record.hourly_rate * record.hours_worked),
            '佣金($)': record.commission,
            '奖金($)': record.bonus,
            '总薪资($)': record.total_amount,
            '结算频率': record.settlement_frequency === 'half_monthly' ? '半月结' : '月结',
            '备注': record.notes || ''
          }));
        } else if (dept.department === '仓库部门') {
          detailData = dept.records.map(record => ({
            '姓名': record.employee_name,
            '期间': record.period,
            '薪资类型': record.payment_type === 'monthly' ? '月薪' : '时薪',
            '基础薪资($)': record.base_salary || (record.hourly_rate * record.hours_worked),
            '加班时长': record.overtime_hours || '-',
            '加班费($)': record.overtime_hours ? (record.overtime_hours * record.overtime_rate) : '-',
            '总薪资($)': record.total_amount,
            '结算频率': record.settlement_frequency === 'half_monthly' ? '半月结' : '月结',
            '备注': record.notes || ''
          }));
        }

        const detailSheet = XLSX.utils.json_to_sheet(detailData);
        XLSX.utils.book_append_sheet(workbook, detailSheet, dept.department);
      });

      // 保存导出记录到数据库
      const exportRecord = {
        export_period: period,
        period_start: start,
        period_end: end,
        total_amount: previewData.reduce((sum, dept) => sum + dept.totalAmount, 0),
        department_breakdown: previewData.map(dept => ({
          department: dept.department,
          count: dept.count,
          totalAmount: dept.totalAmount
        })),
        export_data: previewData,
        exported_by: user?.id
      };

      await supabase
        .from('payroll_exports')
        .insert([exportRecord]);

      // 导出文件
      const fileName = `综合工资表_${period.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success("工资表已成功导出并保存记录");
    } catch (error: any) {
      console.error("导出失败:", error);
      toast.error(`导出失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = previewData.reduce((sum, dept) => sum + dept.totalAmount, 0);
  const totalCount = previewData.reduce((sum, dept) => sum + dept.count, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            按期间导出工资单
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="period_type">快速选择期间</Label>
              <Select
                value={periodType}
                onValueChange={(value) => {
                  setPeriodType(value);
                  setShowPreview(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first_half">当月上半月 (1-15号)</SelectItem>
                  <SelectItem value="second_half">当月下半月 (16-月末)</SelectItem>
                  <SelectItem value="last_month">上个月整月</SelectItem>
                  <SelectItem value="custom">自定义期间</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {periodType === "custom" && (
              <>
                <div>
                  <Label htmlFor="start_date">开始日期</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => {
                      setCustomStartDate(e.target.value);
                      setShowPreview(false);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">结束日期</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => {
                      setCustomEndDate(e.target.value);
                      setShowPreview(false);
                    }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handlePreview} disabled={isLoading} variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              预览数据
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isLoading || previewData.length === 0}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              导出综合工资表
            </Button>
          </div>
        </CardContent>
      </Card>

      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              预览数据 - {getQuickPeriodDates().period}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {previewData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                所选期间内没有工资记录
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900">总部门数</h4>
                    <p className="text-2xl font-bold text-blue-700">{previewData.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900">总人数</h4>
                    <p className="text-2xl font-bold text-green-700">{totalCount}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-900">总金额</h4>
                    <p className="text-2xl font-bold text-purple-700">${totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">部门</th>
                        <th className="text-left p-3">人数</th>
                        <th className="text-left p-3">总金额 ($)</th>
                        <th className="text-left p-3">平均薪资 ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((dept, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{dept.department}</td>
                          <td className="p-3">{dept.count}</td>
                          <td className="p-3 font-bold">${dept.totalAmount.toFixed(2)}</td>
                          <td className="p-3">${(dept.totalAmount / dept.count).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PeriodPayrollExporter;
