
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface FixedCost {
  id: string;
  cost_name: string;
  cost_type: 'monthly' | 'daily' | 'variable';
  amount: number;
  description: string;
  is_active: boolean;
}

const FixedCostsManager: React.FC = () => {
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    cost_name: '',
    cost_type: 'monthly' as const,
    amount: '',
    description: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchFixedCosts();
  }, []);

  const fetchFixedCosts = async () => {
    try {
      const { data, error } = await supabase
        .from('fixed_costs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFixedCosts(data || []);
    } catch (error: any) {
      console.error('获取固定成本失败:', error);
      toast.error('获取固定成本失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cost_name || !formData.amount) {
      toast.error('请填写必填字段');
      return;
    }

    try {
      const { error } = await supabase
        .from('fixed_costs')
        .insert({
          cost_name: formData.cost_name,
          cost_type: formData.cost_type,
          amount: parseFloat(formData.amount),
          description: formData.description,
          created_by: user?.id
        });

      if (error) throw error;

      toast.success('固定成本添加成功');
      setFormData({ cost_name: '', cost_type: 'monthly', amount: '', description: '' });
      setShowAddForm(false);
      fetchFixedCosts();
    } catch (error: any) {
      console.error('添加固定成本失败:', error);
      toast.error('添加失败');
    }
  };

  const handleUpdate = async (id: string, updates: Partial<FixedCost>) => {
    try {
      const { error } = await supabase
        .from('fixed_costs')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('更新成功');
      setEditingId(null);
      fetchFixedCosts();
    } catch (error: any) {
      console.error('更新失败:', error);
      toast.error('更新失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个固定成本项目吗？')) return;

    try {
      const { error } = await supabase
        .from('fixed_costs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('删除成功');
      fetchFixedCosts();
    } catch (error: any) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  };

  const getCostTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly': return '月度成本';
      case 'daily': return '日度成本';
      case 'variable': return '变动成本';
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
          <CardTitle>🏢 公司固定成本设置</CardTitle>
          <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
            <Plus className="mr-2 h-4 w-4" />
            添加成本项目
          </Button>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost_name">成本名称 *</Label>
                  <Input
                    id="cost_name"
                    value={formData.cost_name}
                    onChange={(e) => setFormData({ ...formData, cost_name: e.target.value })}
                    placeholder="例如：办公室租金"
                  />
                </div>
                <div>
                  <Label htmlFor="cost_type">成本类型 *</Label>
                  <Select
                    value={formData.cost_type}
                    onValueChange={(value: any) => setFormData({ ...formData, cost_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">月度成本</SelectItem>
                      <SelectItem value="daily">日度成本</SelectItem>
                      <SelectItem value="variable">变动成本</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="amount">金额 *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="成本项目的详细描述..."
                />
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
            {fixedCosts.map((cost) => (
              <div key={cost.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{cost.cost_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {getCostTypeLabel(cost.cost_type)} - ¥{cost.amount.toLocaleString()}
                    {cost.description && (
                      <div className="mt-1">{cost.description}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={cost.is_active}
                    onCheckedChange={(checked) => handleUpdate(cost.id, { is_active: checked })}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(cost.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(cost.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {fixedCosts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                暂无固定成本项目，点击上方按钮添加
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FixedCostsManager;
