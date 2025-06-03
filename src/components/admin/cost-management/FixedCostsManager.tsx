
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
  cost_type: string;
  amount: number;
  description?: string;
  start_date?: string;
  is_active: boolean;
}

const FixedCostsManager: React.FC = () => {
  const [costs, setCosts] = useState<FixedCost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    cost_name: "",
    cost_type: "",
    amount: "",
    description: "",
    start_date: "",
    is_active: true
  });

  useEffect(() => {
    loadFixedCosts();
  }, []);

  const loadFixedCosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('fixed_costs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCosts(data || []);
    } catch (error: any) {
      console.error("加载固定成本失败:", error);
      toast.error(`加载失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cost_name || !formData.cost_type || !formData.amount) {
      toast.error("请填写必填字段");
      return;
    }

    setIsLoading(true);
    try {
      const costData = {
        cost_name: formData.cost_name,
        cost_type: formData.cost_type,
        amount: parseFloat(formData.amount),
        description: formData.description || null,
        start_date: formData.start_date || null,
        is_active: formData.is_active,
        created_by: user?.id
      };

      if (editingId) {
        const { error } = await supabase
          .from('fixed_costs')
          .update(costData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success("成本信息已更新");
      } else {
        const { error } = await supabase
          .from('fixed_costs')
          .insert([costData]);

        if (error) throw error;
        toast.success("成本信息已添加");
      }

      resetForm();
      loadFixedCosts();
    } catch (error: any) {
      console.error("保存失败:", error);
      toast.error(`保存失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (cost: FixedCost) => {
    setFormData({
      cost_name: cost.cost_name,
      cost_type: cost.cost_type,
      amount: cost.amount.toString(),
      description: cost.description || "",
      start_date: cost.start_date || "",
      is_active: cost.is_active
    });
    setEditingId(cost.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个成本项吗？")) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('fixed_costs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("成本项已删除");
      loadFixedCosts();
    } catch (error: any) {
      console.error("删除失败:", error);
      toast.error(`删除失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      cost_name: "",
      cost_type: "",
      amount: "",
      description: "",
      start_date: "",
      is_active: true
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const costTypes = [
    { value: "monthly", label: "月度成本" },
    { value: "daily", label: "日常成本" },
    { value: "one-time", label: "一次性成本" }
  ];

  return (
    <div className="space-y-6">
      {/* 添加按钮 */}
      {!showAddForm && (
        <Card>
          <CardContent className="p-4">
            <Button onClick={() => setShowAddForm(true)} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              添加固定成本
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 添加/编辑表单 */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "编辑固定成本" : "添加固定成本"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost_name">成本名称 *</Label>
                  <Input
                    id="cost_name"
                    placeholder="例如：办公室租金"
                    value={formData.cost_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cost_type">成本类别 *</Label>
                  <Select value={formData.cost_type} onValueChange={(value) => setFormData(prev => ({ ...prev, cost_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择成本类别" />
                    </SelectTrigger>
                    <SelectContent>
                      {costTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">金额 *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="start_date">起始日期</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  placeholder="成本描述（可选）"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">启用状态</Label>
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

      {/* 成本列表 */}
      <Card>
        <CardHeader>
          <CardTitle>固定成本列表</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && costs.length === 0 ? (
            <div className="text-center py-4">加载中...</div>
          ) : costs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无固定成本记录
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">成本名称</th>
                    <th className="text-left p-2">类别</th>
                    <th className="text-left p-2">金额</th>
                    <th className="text-left p-2">起始日期</th>
                    <th className="text-left p-2">状态</th>
                    <th className="text-left p-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {costs.map((cost) => (
                    <tr key={cost.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{cost.cost_name}</td>
                      <td className="p-2">
                        {costTypes.find(t => t.value === cost.cost_type)?.label || cost.cost_type}
                      </td>
                      <td className="p-2">¥{cost.amount.toLocaleString()}</td>
                      <td className="p-2">{cost.start_date || "-"}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          cost.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {cost.is_active ? '启用' : '禁用'}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(cost)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(cost.id)}
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

export default FixedCostsManager;
