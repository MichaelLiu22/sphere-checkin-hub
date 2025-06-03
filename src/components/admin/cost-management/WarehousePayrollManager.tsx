
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Save, X, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import * as XLSX from "xlsx";

interface WarehousePayroll {
  id: string;
  employee_name: string;
  period: string;
  payment_type: string;
  base_salary?: number;
  hours_worked?: number;
  hourly_rate: number;
  overtime_hours?: number;
  overtime_rate?: number;
  total_amount: number;
  settlement_frequency: string;
  notes?: string;
  created_at: string;
}

const WarehousePayrollManager: React.FC = () => {
  const [payrolls, setPayrolls] = useState<WarehousePayroll[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    employee_name: "",
    period: "",
    payment_type: "hourly",
    base_salary: "",
    hours_worked: "",
    hourly_rate: "",
    overtime_hours: "",
    overtime_rate: "",
    settlement_frequency: "half_monthly",
    notes: ""
  });

  useEffect(() => {
    loadPayrolls();
  }, []);

  const loadPayrolls = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('warehouse_payroll')
        .select('*')
        .order('period', { ascending: false });

      if (error) throw error;
      setPayrolls(data || []);
    } catch (error: any) {
      console.error("加载仓库工资记录失败:", error);
      toast.error(`加载失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    const paymentType = formData.payment_type;
    const baseSalary = parseFloat(formData.base_salary) || 0;
    const hours = parseFloat(formData.hours_worked) || 0;
    const hourlyRate = parseFloat(formData.hourly_rate) || 0;
    const overtimeHours = parseFloat(formData.overtime_hours) || 0;
    const overtimeRate = parseFloat(formData.overtime_rate) || hourlyRate * 1.5; // 默认加班费1.5倍

    if (paymentType === "monthly") {
      // 月薪 + 加班费
      return baseSalary + (overtimeHours * overtimeRate);
    } else {
      // 正常工时 + 加班工时
      return (hours * hourlyRate) + (overtimeHours * overtimeRate);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee_name || !formData.period || !formData.hourly_rate) {
      toast.error("请填写必填字段");
      return;
    }

    if (formData.payment_type === "hourly" && !formData.hours_worked) {
      toast.error("时薪制需要填写工作时长");
      return;
    }

    setIsLoading(true);
    try {
      const payrollData = {
        employee_name: formData.employee_name,
        period: formData.period,
        payment_type: formData.payment_type,
        base_salary: formData.payment_type === "monthly" ? parseFloat(formData.base_salary) || 0 : null,
        hours_worked: formData.payment_type === "hourly" ? parseFloat(formData.hours_worked) || 0 : null,
        hourly_rate: parseFloat(formData.hourly_rate),
        overtime_hours: parseFloat(formData.overtime_hours) || 0,
        overtime_rate: parseFloat(formData.overtime_rate) || parseFloat(formData.hourly_rate) * 1.5,
        settlement_frequency: formData.settlement_frequency,
        total_amount: calculateTotal(),
        notes: formData.notes || null,
        department: "warehouse",
        created_by: user?.id
      };

      if (editingId) {
        const { error } = await supabase
          .from('warehouse_payroll')
          .update(payrollData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success("仓库工资记录已更新");
      } else {
        const { error } = await supabase
          .from('warehouse_payroll')
          .insert([payrollData]);

        if (error) throw error;
        toast.success("仓库工资记录已添加");
      }

      resetForm();
      loadPayrolls();
    } catch (error: any) {
      console.error("保存失败:", error);
      toast.error(`保存失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (payroll: WarehousePayroll) => {
    setFormData({
      employee_name: payroll.employee_name,
      period: payroll.period,
      payment_type: payroll.payment_type,
      base_salary: payroll.base_salary?.toString() || "",
      hours_worked: payroll.hours_worked?.toString() || "",
      hourly_rate: payroll.hourly_rate.toString(),
      overtime_hours: payroll.overtime_hours?.toString() || "",
      overtime_rate: payroll.overtime_rate?.toString() || "",
      settlement_frequency: payroll.settlement_frequency,
      notes: payroll.notes || ""
    });
    setEditingId(payroll.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个工资记录吗？")) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('warehouse_payroll')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("工资记录已删除");
      loadPayrolls();
    } catch (error: any) {
      console.error("删除失败:", error);
      toast.error(`删除失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employee_name: "",
      period: "",
      payment_type: "hourly",
      base_salary: "",
      hours_worked: "",
      hourly_rate: "",
      overtime_hours: "",
      overtime_rate: "",
      settlement_frequency: "half_monthly",
      notes: ""
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const exportToExcel = () => {
    if (payrolls.length === 0) {
      toast.error("没有数据可导出");
      return;
    }

    const exportData = payrolls.map(payroll => ({
      '员工姓名': payroll.employee_name,
      '期间': payroll.period,
      '薪资类型': payroll.payment_type === 'monthly' ? '月薪' : '时薪',
      '基础薪资($)': payroll.base_salary || '-',
      '工作时长': payroll.hours_worked || '-',
      '时薪($)': payroll.hourly_rate,
      '加班时长': payroll.overtime_hours || '-',
      '加班时薪($)': payroll.overtime_rate || '-',
      '总薪资($)': payroll.total_amount,
      '结算频率': payroll.settlement_frequency === 'half_monthly' ? '半月结' : '月结',
      '备注': payroll.notes || '',
      '创建时间': new Date(payroll.created_at).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "仓库人员工资表");
    
    const fileName = `仓库人员工资表_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success("工资表已导出");
  };

  return (
    <div className="space-y-6">
      {!showAddForm && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Button onClick={() => setShowAddForm(true)} className="flex-1">
                <Plus className="mr-2 h-4 w-4" />
                添加仓库工资记录
              </Button>
              <Button variant="outline" onClick={exportToExcel} disabled={payrolls.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                导出Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "编辑仓库工资记录" : "添加仓库工资记录"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee_name">员工姓名 *</Label>
                  <Input
                    id="employee_name"
                    placeholder="输入员工姓名"
                    value={formData.employee_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, employee_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="period">期间 *</Label>
                  <Input
                    id="period"
                    placeholder="如: 2024-01-01 to 2024-01-15"
                    value={formData.period}
                    onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="payment_type">薪资类型 *</Label>
                  <Select
                    value={formData.payment_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, payment_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">时薪</SelectItem>
                      <SelectItem value="monthly">月薪</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="settlement_frequency">结算频率</Label>
                  <Select
                    value={formData.settlement_frequency}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, settlement_frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="half_monthly">半月结</SelectItem>
                      <SelectItem value="monthly">月结</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.payment_type === "monthly" ? (
                  <div>
                    <Label htmlFor="base_salary">基础月薪 ($)</Label>
                    <Input
                      id="base_salary"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.base_salary}
                      onChange={(e) => setFormData(prev => ({ ...prev, base_salary: e.target.value }))}
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="hours_worked">正常工时 (小时) *</Label>
                    <Input
                      id="hours_worked"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.hours_worked}
                      onChange={(e) => setFormData(prev => ({ ...prev, hours_worked: e.target.value }))}
                      required
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="hourly_rate">
                    {formData.payment_type === "monthly" ? "标准时薪 ($) *" : "时薪 ($) *"}
                  </Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="overtime_hours">加班时长 (小时)</Label>
                  <Input
                    id="overtime_hours"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.overtime_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, overtime_hours: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="overtime_rate">加班时薪 ($)</Label>
                  <Input
                    id="overtime_rate"
                    type="number"
                    step="0.01"
                    placeholder={`${(parseFloat(formData.hourly_rate) * 1.5 || 0).toFixed(2)} (默认1.5倍)`}
                    value={formData.overtime_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, overtime_rate: e.target.value }))}
                  />
                </div>
              </div>

              {(formData.base_salary || formData.hourly_rate || formData.hours_worked || formData.overtime_hours) && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">
                    总薪资: ${calculateTotal().toFixed(2)}
                  </p>
                </div>
              )}
              
              <div>
                <Label htmlFor="notes">备注</Label>
                <Textarea
                  id="notes"
                  placeholder="备注信息（可选）"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {editingId ? "更新" : "保存"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="mr-2 h-4 w-4" />
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>仓库人员工资记录列表</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && payrolls.length === 0 ? (
            <div className="text-center py-4">加载中...</div>
          ) : payrolls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无工资记录
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">员工姓名</th>
                    <th className="text-left p-2">期间</th>
                    <th className="text-left p-2">类型</th>
                    <th className="text-left p-2">工时/薪资</th>
                    <th className="text-left p-2">加班</th>
                    <th className="text-left p-2">总薪资</th>
                    <th className="text-left p-2">结算</th>
                    <th className="text-left p-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map((payroll) => (
                    <tr key={payroll.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{payroll.employee_name}</td>
                      <td className="p-2">{payroll.period}</td>
                      <td className="p-2">{payroll.payment_type === 'monthly' ? '月薪' : '时薪'}</td>
                      <td className="p-2">
                        {payroll.payment_type === 'monthly' 
                          ? `$${payroll.base_salary}` 
                          : `${payroll.hours_worked}h × $${payroll.hourly_rate}`
                        }
                      </td>
                      <td className="p-2">
                        {payroll.overtime_hours ? `${payroll.overtime_hours}h × $${payroll.overtime_rate}` : '-'}
                      </td>
                      <td className="p-2 font-medium">${payroll.total_amount.toFixed(2)}</td>
                      <td className="p-2">{payroll.settlement_frequency === 'half_monthly' ? '半月结' : '月结'}</td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(payroll)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(payroll.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WarehousePayrollManager;
