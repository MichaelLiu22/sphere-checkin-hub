
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Minus, Package, Search, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface InventoryItem {
  id: string;
  sku: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
}

interface RemoveInventoryFormProps {
  inventory: InventoryItem[];
  onSuccess: () => void;
}

const RemoveInventoryForm: React.FC<RemoveInventoryFormProps> = ({ inventory, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [outDate, setOutDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    quantity: "",
    reason: ""
  });

  const outReasons = [
    "发货",
    "退货",
    "调拨",
    "损耗",
    "盘亏",
    "其他"
  ];

  // 过滤库存数据
  const filteredInventory = useMemo(() => {
    if (!searchTerm) return inventory;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return inventory.filter(item => 
      item.sku.toLowerCase().includes(lowerSearchTerm) ||
      item.product_name.toLowerCase().includes(lowerSearchTerm)
    );
  }, [inventory, searchTerm]);

  const handleItemSelect = (sku: string) => {
    const item = inventory.find(item => item.sku === sku);
    setSelectedItem(item || null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReasonChange = (reason: string) => {
    setFormData(prev => ({
      ...prev,
      reason
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem || !formData.quantity || !formData.reason || !outDate) {
      toast.error("请填写所有必填字段并选择出库日期");
      return;
    }

    const outQuantity = parseInt(formData.quantity);
    
    if (outQuantity <= 0) {
      toast.error("出库数量必须大于0");
      return;
    }

    if (outQuantity > selectedItem.quantity) {
      toast.error(`出库数量不能超过当前库存 ${selectedItem.quantity}`);
      return;
    }

    setLoading(true);

    try {
      // 更新库存数量
      const newQuantity = selectedItem.quantity - outQuantity;
      
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', selectedItem.id);

      if (updateError) throw updateError;

      // 记录出库历史，包含出库日期
      const { error: historyError } = await supabase
        .from('inventory_history')
        .insert({
          sku: selectedItem.sku,
          product_name: selectedItem.product_name,
          quantity: outQuantity,
          operation_type: 'out',
          unit_cost: selectedItem.unit_cost,
          reason: formData.reason,
          out_date: format(outDate, 'yyyy-MM-dd'),
          created_by: user?.id
        });

      if (historyError) throw historyError;

      toast.success(`${selectedItem.product_name} 已成功出库 ${outQuantity} 件`);
      
      // 重置表单
      setSelectedItem(null);
      setSearchTerm("");
      setOutDate(new Date());
      setFormData({
        quantity: "",
        reason: ""
      });
      
      onSuccess();
    } catch (error: any) {
      console.error("Error removing inventory:", error);
      toast.error("出库操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Minus className="h-5 w-5" />
          出库管理
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">搜索商品</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="输入SKU或商品名称搜索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">选择商品 *</Label>
            <Select onValueChange={handleItemSelect}>
              <SelectTrigger>
                <SelectValue placeholder="请选择要出库的商品" />
              </SelectTrigger>
              <SelectContent>
                {filteredInventory.map((item) => (
                  <SelectItem key={item.id} value={item.sku}>
                    {item.sku} - {item.product_name} (库存: {item.quantity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {searchTerm && filteredInventory.length === 0 && (
              <p className="text-sm text-muted-foreground">
                没有找到匹配的商品
              </p>
            )}
            {searchTerm && filteredInventory.length > 0 && (
              <p className="text-sm text-muted-foreground">
                找到 {filteredInventory.length} 个匹配的商品
              </p>
            )}
          </div>

          {selectedItem && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">商品信息</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>SKU: <span className="font-mono">{selectedItem.sku}</span></div>
                  <div>商品名称: {selectedItem.product_name}</div>
                  <div>当前库存: <span className="font-semibold text-blue-600">{selectedItem.quantity}</span></div>
                  <div>单件成本: ¥{selectedItem.unit_cost}</div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">出库数量 *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                max={selectedItem?.quantity || 0}
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="请输入出库数量"
                disabled={!selectedItem}
                required
              />
              {selectedItem && (
                <p className="text-xs text-muted-foreground">
                  最大可出库: {selectedItem.quantity} 件
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="out_date">出库日期 *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !outDate && "text-muted-foreground"
                    )}
                    disabled={!selectedItem}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {outDate ? format(outDate, "yyyy/MM/dd") : "选择出库日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={outDate}
                    onSelect={(date) => date && setOutDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">出库原因 *</Label>
              <Select onValueChange={handleReasonChange} disabled={!selectedItem}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择出库原因" />
                </SelectTrigger>
                <SelectContent>
                  {outReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.reason === "其他" && (
            <div className="space-y-2">
              <Label htmlFor="custom_reason">请说明具体原因</Label>
              <Textarea
                id="custom_reason"
                placeholder="请输入具体的出库原因..."
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button 
              type="submit" 
              disabled={loading || !selectedItem}
              variant="destructive"
            >
              {loading ? (
                <>
                  <Minus className="h-4 w-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4 mr-2" />
                  确认出库
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RemoveInventoryForm;
