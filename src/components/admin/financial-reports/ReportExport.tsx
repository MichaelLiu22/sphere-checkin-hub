
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText, Save } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ReportExportProps {
  financialSummary: any;
  orderData: any[];
  onExportComplete: () => void;
}

const ReportExport: React.FC<ReportExportProps> = ({
  financialSummary,
  orderData,
  onExportComplete
}) => {
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  // Safely access details with fallbacks
  const inventoryDetails = financialSummary.costBreakdown.details?.inventory || [];
  const fixedDetails = financialSummary.costBreakdown.details?.fixed || [];
  const payrollDetails = financialSummary.costBreakdown.details?.payroll || [];

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const workbook = XLSX.utils.book_new();
      
      // Summary Sheet
      const summaryData = [
        ['财务汇总报表'],
        ['日期范围:', `${financialSummary.dateRange.start} - ${financialSummary.dateRange.end}`],
        ['订单数量:', financialSummary.orderCount],
        ['总收入:', financialSummary.totalRevenue],
        [''],
        ['成本明细:'],
        ['库存成本:', financialSummary.costBreakdown.inventoryCost],
        ['固定成本:', financialSummary.costBreakdown.fixedCosts],
        ['工资成本:', financialSummary.costBreakdown.payrollCosts],
        ['总成本:', financialSummary.costBreakdown.inventoryCost + financialSummary.costBreakdown.totalOtherCosts],
        [''],
        ['毛利润:', financialSummary.grossProfit],
        ['利润率:', `${financialSummary.profitMargin.toFixed(2)}%`],
        [''],
        ['导出时间:', new Date().toLocaleString()],
        ['导出人员:', user?.full_name || 'Unknown']
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "财务汇总");

      // Order Details Sheet
      if (includeDetails) {
        const orderDetails = orderData.map((order, index) => ({
          '序号': index + 1,
          '订单日期': order[Object.keys(order)[0]], // Assuming first field is date
          '结算金额': order[Object.keys(order)[1]], // Assuming second field is amount
          ...order
        }));
        
        const orderSheet = XLSX.utils.json_to_sheet(orderDetails);
        XLSX.utils.book_append_sheet(workbook, orderSheet, "订单详情");
      }

      // Cost Details Sheets
      if (includeDetails) {
        // Inventory costs
        if (inventoryDetails.length > 0) {
          const inventorySheet = XLSX.utils.json_to_sheet(
            inventoryDetails.map((item: any) => ({
              'SKU': item.sku,
              '产品名称': item.product_name,
              '出库数量': Math.abs(item.quantity),
              '单位成本': item.unit_cost,
              '总成本': (item.unit_cost || 0) * Math.abs(item.quantity),
              '出库日期': new Date(item.created_at).toLocaleDateString(),
              '批次号': item.batch_number
            }))
          );
          XLSX.utils.book_append_sheet(workbook, inventorySheet, "库存成本明细");
        }

        // Fixed costs
        if (fixedDetails.length > 0) {
          const fixedSheet = XLSX.utils.json_to_sheet(
            fixedDetails.map((item: any) => ({
              '成本名称': item.cost_name,
              '成本类型': item.cost_type,
              '原始金额': item.amount,
              '分摊金额': item.allocatedAmount,
              '分摊天数': item.daysCovered,
              '描述': item.description
            }))
          );
          XLSX.utils.book_append_sheet(workbook, fixedSheet, "固定成本明细");
        }

        // Payroll costs
        if (payrollDetails.length > 0) {
          const payrollSheet = XLSX.utils.json_to_sheet(
            payrollDetails.map((item: any) => ({
              '部门': item.department,
              '员工姓名': item.employee_name || item.host_name,
              '期间': item.period,
              '总金额': item.total_amount,
              '分摊金额': item.allocatedAmount,
              '结算频率': item.settlement_frequency,
              '备注': item.notes
            }))
          );
          XLSX.utils.book_append_sheet(workbook, payrollSheet, "工资成本明细");
        }
      }

      // Export file
      const fileName = `financial_report_${financialSummary.dateRange.start}_${financialSummary.dateRange.end}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success("Excel报表已导出");
    } catch (error: any) {
      console.error("导出失败:", error);
      toast.error(`导出失败: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = () => {
    // For now, export as JSON (can be enhanced with PDF library)
    const reportData = {
      reportType: "财务报表",
      generatedAt: new Date().toISOString(),
      generatedBy: user?.full_name || 'Unknown',
      summary: financialSummary,
      orderData: includeDetails ? orderData : null,
      costDetails: includeDetails ? financialSummary.costBreakdown.details : null
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial_report_${financialSummary.dateRange.start}_${financialSummary.dateRange.end}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("PDF报表已导出（JSON格式）");
  };

  const saveToDatabase = async () => {
    setIsSaving(true);
    try {
      const reportRecord = {
        report_type: 'financial_analysis',
        report_period: `${financialSummary.dateRange.start}_${financialSummary.dateRange.end}`,
        summary_data: financialSummary,
        detail_data: {
          orders: orderData,
          costBreakdown: financialSummary.costBreakdown
        },
        created_by: user?.id
      };

      // For now, save to profit_analysis table (can create dedicated table later)
      const { error } = await supabase
        .from('profit_analysis')
        .insert({
          analysis_name: `财务报表_${financialSummary.dateRange.start}_${financialSummary.dateRange.end}`,
          analysis_date: new Date().toISOString().split('T')[0],
          payout_data: orderData,
          cost_breakdown: financialSummary.costBreakdown,
          profit_summary: financialSummary,
          created_by: user?.id
        });

      if (error) throw error;

      toast.success("报表已保存到数据库");
      onExportComplete();
    } catch (error: any) {
      console.error("保存失败:", error);
      toast.error(`保存失败: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            导出设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeCharts"
                checked={includeCharts}
                onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
              />
              <label htmlFor="includeCharts" className="text-sm">
                包含图表数据
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeDetails"
                checked={includeDetails}
                onCheckedChange={(checked) => setIncludeDetails(checked as boolean)}
              />
              <label htmlFor="includeDetails" className="text-sm">
                包含明细数据（订单详情、成本明细）
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>导出操作</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={exportToExcel}
              disabled={isExporting}
              variant="outline"
              className="w-full"
            >
              <FileText className="mr-2 h-4 w-4" />
              {isExporting ? "导出中..." : "导出Excel"}
            </Button>
            
            <Button
              onClick={() => {
                const reportData = {
                  reportType: "财务报表",
                  generatedAt: new Date().toISOString(),
                  generatedBy: user?.full_name || 'Unknown',
                  summary: financialSummary,
                  orderData: includeDetails ? orderData : null,
                  costDetails: includeDetails ? financialSummary.costBreakdown.details : null
                };

                const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `financial_report_${financialSummary.dateRange.start}_${financialSummary.dateRange.end}.json`;
                a.click();
                URL.revokeObjectURL(url);
                
                toast.success("PDF报表已导出（JSON格式）");
              }}
              variant="outline"
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              导出PDF (JSON)
            </Button>
            
            <Button
              onClick={async () => {
                setIsSaving(true);
                try {
                  const { error } = await supabase
                    .from('profit_analysis')
                    .insert({
                      analysis_name: `财务报表_${financialSummary.dateRange.start}_${financialSummary.dateRange.end}`,
                      analysis_date: new Date().toISOString().split('T')[0],
                      payout_data: orderData,
                      cost_breakdown: financialSummary.costBreakdown,
                      profit_summary: financialSummary,
                      created_by: user?.id
                    });

                  if (error) throw error;

                  toast.success("报表已保存到数据库");
                  onExportComplete();
                } catch (error: any) {
                  console.error("保存失败:", error);
                  toast.error(`保存失败: ${error.message}`);
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "保存中..." : "保存到数据库"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Summary */}
      <Card>
        <CardHeader>
          <CardTitle>导出预览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
            <p><strong>报表期间:</strong> {financialSummary.dateRange.start} - {financialSummary.dateRange.end}</p>
            <p><strong>订单数量:</strong> {financialSummary.orderCount}</p>
            <p><strong>总收入:</strong> ${financialSummary.totalRevenue.toFixed(2)}</p>
            <p><strong>总成本:</strong> ${(financialSummary.costBreakdown.inventoryCost + financialSummary.costBreakdown.totalOtherCosts).toFixed(2)}</p>
            <p><strong>毛利润:</strong> ${financialSummary.grossProfit.toFixed(2)}</p>
            <p><strong>利润率:</strong> {financialSummary.profitMargin.toFixed(2)}%</p>
            
            <div className="mt-3 pt-3 border-t">
              <p><strong>导出内容:</strong></p>
              <ul className="ml-4 text-gray-600">
                <li>• 财务汇总表</li>
                {includeDetails && <li>• 订单明细 ({orderData.length} 条)</li>}
                {includeDetails && <li>• 库存成本明细 ({inventoryDetails.length} 条)</li>}
                {includeDetails && <li>• 固定成本明细 ({fixedDetails.length} 条)</li>}
                {includeDetails && <li>• 工资成本明细 ({payrollDetails.length} 条)</li>}
                {includeCharts && <li>• 图表数据</li>}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportExport;
