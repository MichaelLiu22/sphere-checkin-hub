
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Save, X, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import * as XLSX from "xlsx";

interface HostPayroll {
  id: string;
  host_name: string;
  work_date: string;
  hours_worked: number;
  hourly_rate: number;
  total_amount: number;
  notes?: string;
  created_at: string;
}

const HostPayrollManager: React.FC = () => {
  const [payrolls, setPayrolls] = useState<HostPayroll[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    host_name: "",
    work_date: "",
    hours_worked: "",
    hourly_rate: "",
    notes: ""
  });

  useEffect(() => {
    loadPayrolls();
  }, []);

  const loadPayrolls = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('host_payroll')
        .select('*')
        .order('work_date', { ascending: false });

      if (error) throw error;
      setPayrolls(data || []);
    } catch (error: any) {
      console.error("加载工资记录失败:", error);
      toast.error(`加载失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    const hours = parseFloat(formData.hours_worked) || 0;
    const rate = parseFloat(formData.hourly_rate) || 0;
    return hours * rate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.host_name || !formData.work_date || !formData.hours_worked || !formData.hourly_rate) {
      toast.error("请填写必填字段");
      return;
    }

    setIsLoading(true);
    try {
      const payrollData = {
        host_name: formData.host_name,
        work_date: formData.work_date,
        hours_worked: parseFloat(formData.hours_worked),
        hourly_rate: parseFloat(formData.hourly_rate),
        total_amount: calculateTotal(),
        notes: formData.notes || null,
        created_by: user?.id
      };

      if (editingId) {
        const { error } = await supabase
          .from('host_payroll')
          .update(payrollData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success("工资记录已更新");
      } else {
        const { error } = await supabase
          .from('host_payroll')
          .insert([payrollData]);

        if (error) throw error;
        toast.success("工资记录已添加");
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

  const handleEdit = (payroll: HostPayroll) => {
    setFormData({
      host_name: payroll.host_name,
      work_date: payroll.work_date,
      hours_worked: payroll.hours_worked.toString(),
      hourly_rate: payroll.hourly_rate.toString(),
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
        .from('host_payroll')
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
      host_name: "",
      work_date: "",
      hours_worked: "",
      hourly_rate: "",
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
      '主播姓名': payroll.host_name,
      '工作日期': payroll.work_date,
      '工作时长(小时)': payroll.hours_worked,
      '时薪(元)': payroll.hourly_rate,
      '总工资(元)': payroll.total_amount,
      '备注': payroll.notes || '',
      '创建时间': new Date(payroll.created_at).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "主播工资表");
    
    const fileName = `主播工资表_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success("工资表已导出");
  };

  return (
    <div className="space-y-6">
      {/* 操作按钮 */}
      {!showAddForm && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Button onClick={() => setShowAddForm(true)} className="flex-1">
                <Plus className="mr-2 h-4 w-4" />
                添加工资记录
              </Button>
              <Button variant="outline" onClick={exportToExcel} disabled={payrolls.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                导出Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 添加/编辑表单 */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "编辑工资记录" : "添加工资记录"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="host_name">主播姓名 *</Label>
                  <Input
                    id="host_name"
                    placeholder="输入主播姓名"
                    value={formData.host_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, host_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="work_date">工作日期 *</Label>
                  <Input
                    id="work_date"
                    type="date"
                    value={formData.work_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, work_date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hours_worked">工作时长 (小时) *</Label>
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
                <div>
                  <Label htmlFor="hourly_rate">时薪 (元) *</Label>
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
              </div>

              {/* 自动计算总工资 */}
              {formData.hours_worked && formData.hourly_rate && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">
                    总工资: ¥{calculateTotal().toFixed(2)}
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

      {/* 工资记录列表 */}
      <Card>
        <CardHeader>
          <CardTitle>工资记录列表</CardTitle>
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
                    <th className="text-left p-2">主播姓名</th>
                    <th className="text-left p-2">工作日期</th>
                    <th className="text-left p-2">工作时长</th>
                    <th className="text-left p-2">时薪</th>
                    <th className="text-left p-2">总工资</th>
                    <th className="text-left p-2">备注</th>
                    <th className="text-left p-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map((payroll) => (
                    <tr key={payroll.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{payroll.host_name}</td>
                      <td className="p-2">{payroll.work_date}</td>
                      <td className="p-2">{payroll.hours_worked}小时</td>
                      <td className="p-2">¥{payroll.hourly_rate}</td>
                      <td className="p-2 font-medium">¥{payroll.total_amount.toFixed(2)}</td>
                      <td className="p-2 max-w-32 truncate">{payroll.notes || "-"}</td>
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

export default HostPayrollManager;
