import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface StreamerSalary {
  id: string;
  streamer_name: string;
  salary_type: 'monthly' | 'commission' | 'hourly';
  base_amount: number;
  commission_rate?: number;
  work_schedule?: any;
  is_active: boolean;
  created_at: string;
}

const StreamerSalaryManager: React.FC = () => {
  const [salaries, setSalaries] = useState<StreamerSalary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { user } = useAuth();

  // 表单状态
  const [formData, setFormData] = useState({
    streamer_name: "",
    salary_type: "monthly" as 'monthly' | 'commission' | 'hourly',
    base_amount: 0,
    commission_rate: 0,
    is_active: true
  });

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      const { data, error } = await supabase
        .from('streamer_salary')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // 类型安全地处理数据
      const typedData = (data || []).map(item => ({
        ...item,
        salary_type: item.salary_type as 'monthly' | 'commission' | 'hourly'
      }));
      
      setSalaries(typedData);
    } catch (error: any) {
      console.error("获取主播工资数据失败:", error);
      toast.error("获取数据失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.streamer_name.trim()) {
      toast.error("请输入主播姓名");
      return;
    }

    if (formData.base_amount <= 0) {
      toast.error("请输入有效的基础金额");
      return;
    }

    if (formData.salary_type === 'commission' && formData.commission_rate <= 0) {
      toast.error("提成模式需要设置提成比例");
      return;
    }

    try {
      const salaryData = {
        streamer_name: formData.streamer_name,
        salary_type: formData.salary_type,
        base_amount: formData.base_amount,
        commission_rate: formData.salary_type === 'commission' ? formData.commission_rate : null,
        is_active: formData.is_active,
        created_by: user?.id
      };

      if (editingId) {
        const { error } = await supabase
          .from('streamer_salary')
          .update(salaryData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success("更新成功");
      } else {
        const { error } = await supabase
          .from('streamer_salary')
          .insert(salaryData);

        if (error) throw error;
        toast.success("添加成功");
      }

      resetForm();
      fetchSalaries();
    } catch (error: any) {
      console.error("操作失败:", error);
      toast.error("操作失败");
    }
  };

  const resetForm = () => {
    setFormData({
      streamer_name: "",
      salary_type: "monthly",
      base_amount: 0,
      commission_rate: 0,
      is_active: true
    });
    setIsAddingNew(false);
    setEditingId(null);
  };

  const handleEdit = (salary: StreamerSalary) => {
    setFormData({
      streamer_name: salary.streamer_name,
      salary_type: salary.salary_type,
      base_amount: salary.base_amount,
      commission_rate: salary.commission_rate || 0,
      is_active: salary.is_active
    });
    setEditingId(salary.id);
    setIsAddingNew(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条记录吗？")) return;

    try {
      const { error } = await supabase
        .from('streamer_salary')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("删除成功");
      fetchSalaries();
    } catch (error: any) {
      console.error("删除失败:", error);
      toast.error("删除失败");
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('streamer_salary')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      toast.success("状态更新成功");
      fetchSalaries();
    } catch (error: any) {
      console.error("状态更新失败:", error);
      toast.error("状态更新失败");
    }
  };

  const getSalaryTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly':
        return '月薪';
      case 'commission':
        return '提成';
      case 'hourly':
        return '时薪';
      default:
        return type;
    }
  };

  const getTotalMonthlyCost = () => {
    return salaries
      .filter(s => s.is_active)
      .reduce((total, salary) => {
        if (salary.salary_type === 'monthly') {
          return total + salary.base_amount;
        }
        return total;
      }, 0);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">加载中...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 汇总信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">活跃主播</p>
                <p className="text-2xl font-bold">{salaries.filter(s => s.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">月度固定成本</p>
                <p className="text-2xl font-bold text-green-600">
                  ¥{getTotalMonthlyCost().toLocaleString()}
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
                <p className="text-sm text-muted-foreground">总主播数</p>
                <p className="text-2xl font-bold text-purple-600">{salaries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 添加新主播 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>主播工资管理</CardTitle>
            <Button onClick={() => setIsAddingNew(true)} disabled={isAddingNew}>
              <Plus className="mr-2 h-4 w-4" />
              添加主播
            </Button>
          </div>
        </CardHeader>
        
        {isAddingNew && (
          <CardContent className="border-t">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="streamerName">主播姓名</Label>
                  <Input
                    id="streamerName"
                    value={formData.streamer_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, streamer_name: e.target.value }))}
                    placeholder="输入主播姓名"
                  />
                </div>

                <div>
                  <Label htmlFor="salaryType">薪资类型</Label>
                  <Select 
                    value={formData.salary_type} 
                    onValueChange={(value: 'monthly' | 'commission' | 'hourly') => 
                      setFormData(prev => ({ ...prev, salary_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">月薪</SelectItem>
                      <SelectItem value="commission">提成</SelectItem>
                      <SelectItem value="hourly">时薪</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="baseAmount">
                    {formData.salary_type === 'monthly' ? '月薪金额 (¥)' : 
                     formData.salary_type === 'hourly' ? '时薪金额 (¥)' : '基础工资 (¥)'}
                  </Label>
                  <Input
                    id="baseAmount"
                    type="number"
                    value={formData.base_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, base_amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="输入金额"
                  />
                </div>

                {formData.salary_type === 'commission' && (
                  <div>
                    <Label htmlFor="commissionRate">提成比例 (%)</Label>
                    <Input
                      id="commissionRate"
                      type="number"
                      value={formData.commission_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, commission_rate: parseFloat(e.target.value) || 0 }))}
                      placeholder="输入提成比例"
                      min="0"
                      max="100"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="isActive">激活状态</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit}>
                  {editingId ? "更新" : "添加"}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  取消
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 主播列表 */}
      <Card>
        <CardHeader>
          <CardTitle>主播列表 ({salaries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salaries.map((salary) => (
              <div key={salary.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{salary.streamer_name}</h3>
                      <Badge variant={salary.is_active ? "default" : "secondary"}>
                        {salary.is_active ? "活跃" : "停用"}
                      </Badge>
                      <Badge variant="outline">
                        {getSalaryTypeLabel(salary.salary_type)}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>基础金额: ¥{salary.base_amount.toLocaleString()}</p>
                      {salary.commission_rate && (
                        <p>提成比例: {salary.commission_rate}%</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Switch
                      checked={salary.is_active}
                      onCheckedChange={() => toggleActive(salary.id, salary.is_active)}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(salary)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(salary.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {salaries.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                暂无主播工资数据
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreamerSalaryManager;
