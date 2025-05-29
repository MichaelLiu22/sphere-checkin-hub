
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  sku: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
  image_url?: string;
  batch_number?: string;
  expiration_date?: string;
  min_stock_alert: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

interface InventoryTableProps {
  inventory: InventoryItem[];
  onUpdate: () => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ inventory, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditingItem({ ...item });
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from('inventory')
        .update({
          product_name: editingItem.product_name,
          quantity: editingItem.quantity,
          unit_cost: editingItem.unit_cost,
          min_stock_alert: editingItem.min_stock_alert,
          batch_number: editingItem.batch_number,
          expiration_date: editingItem.expiration_date
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      toast.success("库存信息已更新");
      setEditingId(null);
      setEditingItem(null);
      onUpdate();
    } catch (error: any) {
      console.error("Error updating inventory:", error);
      toast.error("更新失败");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingItem(null);
  };

  const handleDelete = async (id: string, sku: string) => {
    if (!confirm(`确定要删除 SKU: ${sku} 的库存记录吗？`)) return;

    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("库存记录已删除");
      onUpdate();
    } catch (error: any) {
      console.error("Error deleting inventory:", error);
      toast.error("删除失败");
    }
  };

  const getRowClassName = (item: InventoryItem) => {
    const today = new Date();
    const isExpired = item.expiration_date && new Date(item.expiration_date) < today;
    const isLowStock = item.quantity <= item.min_stock_alert;
    
    if (isExpired) return "bg-red-50 border-red-200";
    if (isLowStock) return "bg-orange-50 border-orange-200";
    return "";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>库存总览</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>图片</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>商品名称</TableHead>
                <TableHead>当前库存</TableHead>
                <TableHead>单件成本</TableHead>
                <TableHead>总库存价值</TableHead>
                <TableHead>有效期</TableHead>
                <TableHead>批次</TableHead>
                <TableHead>最低库存告警</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id} className={getRowClassName(item)}>
                  <TableCell>
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.product_name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                        无图片
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono">{item.sku}</TableCell>
                  <TableCell>
                    {editingId === item.id ? (
                      <Input
                        value={editingItem?.product_name || ""}
                        onChange={(e) => setEditingItem(prev => prev ? {...prev, product_name: e.target.value} : null)}
                        className="w-full"
                      />
                    ) : (
                      item.product_name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === item.id ? (
                      <Input
                        type="number"
                        value={editingItem?.quantity || 0}
                        onChange={(e) => setEditingItem(prev => prev ? {...prev, quantity: parseInt(e.target.value) || 0} : null)}
                        className="w-20"
                      />
                    ) : (
                      <span className={item.quantity <= item.min_stock_alert ? "text-orange-600 font-semibold" : ""}>
                        {item.quantity}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === item.id ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editingItem?.unit_cost || 0}
                        onChange={(e) => setEditingItem(prev => prev ? {...prev, unit_cost: parseFloat(e.target.value) || 0} : null)}
                        className="w-24"
                      />
                    ) : (
                      formatCurrency(item.unit_cost)
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(item.quantity * item.unit_cost)}
                  </TableCell>
                  <TableCell>
                    {editingId === item.id ? (
                      <Input
                        type="date"
                        value={editingItem?.expiration_date || ""}
                        onChange={(e) => setEditingItem(prev => prev ? {...prev, expiration_date: e.target.value} : null)}
                        className="w-32"
                      />
                    ) : (
                      item.expiration_date ? (
                        <span className={new Date(item.expiration_date) < new Date() ? "text-red-600 font-semibold" : ""}>
                          {item.expiration_date}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === item.id ? (
                      <Input
                        value={editingItem?.batch_number || ""}
                        onChange={(e) => setEditingItem(prev => prev ? {...prev, batch_number: e.target.value} : null)}
                        className="w-24"
                      />
                    ) : (
                      item.batch_number || <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === item.id ? (
                      <Input
                        type="number"
                        value={editingItem?.min_stock_alert || 0}
                        onChange={(e) => setEditingItem(prev => prev ? {...prev, min_stock_alert: parseInt(e.target.value) || 0} : null)}
                        className="w-20"
                      />
                    ) : (
                      item.min_stock_alert
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {item.quantity <= item.min_stock_alert && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          低库存
                        </Badge>
                      )}
                      {item.expiration_date && new Date(item.expiration_date) < new Date() && (
                        <Badge variant="destructive" className="text-xs">
                          已过期
                        </Badge>
                      )}
                      {item.quantity > item.min_stock_alert && 
                       (!item.expiration_date || new Date(item.expiration_date) >= new Date()) && (
                        <Badge variant="secondary" className="text-xs">
                          正常
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {editingId === item.id ? (
                        <>
                          <Button size="sm" onClick={handleSave}>
                            保存
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel}>
                            取消
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.id, item.sku)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {inventory.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            暂无库存数据
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryTable;
