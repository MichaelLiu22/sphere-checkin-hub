
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Save, X, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface StreamerSalary {
  id: string;
  streamer_name: string;
  salary_type: 'hourly' | 'monthly' | 'commission';
  base_amount: number;
  commission_rate: number;
  work_schedule: any;
  is_active: boolean;
}

const StreamerSalaryManager: React.FC = () => {
  const [streamers, setStreamers] = useState<StreamerSalary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    streamer_name: '',
    salary_type: 'monthly' as const,
    base_amount: '',
    commission_rate: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchStreamers();
  }, []);

  const fetchStreamers = async () => {
    try {
      const { data, error } = await supabase
        .from('streamer_salary')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure the data matches our interface
      const typedData = (data || []).map(item => ({
        ...item,
        salary_type: item.salary_type as 'hourly' | 'monthly' | 'commission'
      }));
      
      setStreamers(typedData);
    } catch (error: any) {
      console.error('获取主播工资失败:', error);
      toast.error('获取主播工资失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.streamer_name || !formData.base_amount) {
      toast.error('请填写必填字段');
      return;
    }

    try {
      const { error } = await supabase
        .from('streamer_salary')
        .insert({
          streamer_name: formData.streamer_name,
          salary_type: formData.salary_type,
          base_amount: parseFloat(formData.base_amount),
          commission_rate: parseFloat(formData.commission_rate || '0'),
          created_by: user?.id
        });

      if (error) throw error;

      toast.success('主播工资信息添加成功');
      setFormData({ streamer_name: '', salary_type: 'monthly', base_amount: '', commission_rate: '' });
      setShowAddForm(false);
      fetchStreamers();
    } catch (error: any) {
      console.error('添加主播工资失败:', error);
      toast.error('添加失败');
    }
  };

  const handleUpdate = async (id: string, updates: Partial<StreamerSalary>) => {
    try {
      const { error } = await supabase
        .from('streamer_salary')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('更新成功');
      fetchStreamers();
    } catch (error: any) {
      console.error('更新失败:', error);
      toast.error('更新失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个主播工资信息吗？')) return;

    try {
      const { error } = await supabase
        .from('streamer_salary')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('删除成功');
      fetchStreamers();
    } catch (error: any) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  };

  const getSalaryTypeLabel = (type: string) => {
    switch (type) {
      case 'hourly': return '时薪';
      case 'monthly': return '月薪';
      case 'commission': return '提成';
      default: return type;
    }
  };

  if (isLoading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            主播工资管理
          </CardTitle>
          <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
            <Plus className="mr-2 h-4 w-4" />
            添加主播
          </Button>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="streamer_name">主播姓名 *</Label>
                  <Input
                    id="streamer_name"
                    value={formData.streamer_name}
                    onChange={(e) => setFormData({ ...formData, streamer_name: e.target.value })}
                    placeholder="例如：张小明"
                  />
                </div>
                <div>
                  <Label htmlFor="salary_type">工资类型 *</Label>
                  <Select
                    value={formData.salary_type}
                    onValueChange={(value: any) => setFormData({ ...formData, salary_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">时薪</SelectItem>
                      <SelectItem value="monthly">月薪</SelectItem>
                      <SelectItem value="commission">提成</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="base_amount">
                    {formData.salary_type === 'hourly' ? '时薪' : 
                     formData.salary_type === 'monthly' ? '月薪' : '基础工资'} *
                  </Label>
                  <Input
                    id="base_amount"
                    type="number"
                    step="0.01"
                    value={formData.base_amount}
                    onChange={(e) => setFormData({ ...formData, base_amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                {formData.salary_type === 'commission' && (
                  <div>
                    <Label htmlFor="commission_rate">提成比例 (%)</Label>
                    <Input
                      id="commission_rate"
                      type="number"
                      step="0.01"
                      max="100"
                      value={formData.commission_rate}
                      onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                      placeholder="5.00"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  保存
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  <X className="mr-2 h-4 w-4" />
                  取消
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {streamers.map((streamer) => (
              <div key={streamer.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{streamer.streamer_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {getSalaryTypeLabel(streamer.salary_type)} - ¥{streamer.base_amount.toLocaleString()}
                    {streamer.salary_type === 'commission' && streamer.commission_rate > 0 && (
                      <span> (提成: {streamer.commission_rate}%)</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={streamer.is_active}
                    onCheckedChange={(checked) => handleUpdate(streamer.id, { is_active: checked })}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(streamer.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {streamers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                暂无主播工资信息，点击上方按钮添加
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreamerSalaryManager;
