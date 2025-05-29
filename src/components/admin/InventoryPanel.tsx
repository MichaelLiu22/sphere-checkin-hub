
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, Search, Download, AlertTriangle, Package, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import InventoryTable from "./inventory/InventoryTable";
import AddInventoryForm from "./inventory/AddInventoryForm";
import RemoveInventoryForm from "./inventory/RemoveInventoryForm";
import InventoryCharts from "./inventory/InventoryCharts";
import InventoryHistory from "./inventory/InventoryHistory";

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

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  expiredItems: number;
}

const InventoryPanel: React.FC = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    expiredItems: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    // 过滤库存数据
    const filtered = inventory.filter(item => 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInventory(filtered);
  }, [inventory, searchTerm]);

  useEffect(() => {
    // 计算统计数据
    const today = new Date();
    const totalItems = inventory.length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    const lowStockItems = inventory.filter(item => item.quantity <= item.min_stock_alert).length;
    const expiredItems = inventory.filter(item => 
      item.expiration_date && new Date(item.expiration_date) < today
    ).length;

    setStats({
      totalItems,
      totalValue,
      lowStockItems,
      expiredItems
    });
  }, [inventory]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInventory(data || []);
    } catch (error: any) {
      console.error("Error fetching inventory:", error);
      toast.error("获取库存数据失败");
    } finally {
      setLoading(false);
    }
  };

  const handleInventoryUpdate = () => {
    fetchInventory();
  };

  const exportToExcel = () => {
    // 导出到Excel功能
    const csvContent = [
      ["SKU", "商品名称", "库存数量", "单件成本", "总价值", "批次编号", "有效期", "最低库存告警"],
      ...filteredInventory.map(item => [
        item.sku,
        item.product_name,
        item.quantity,
        item.unit_cost,
        item.quantity * item.unit_cost,
        item.batch_number || "",
        item.expiration_date || "",
        item.min_stock_alert
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("库存数据已导出");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>加载库存数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题和导出按钮 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📦 库存系统</h2>
        <Button onClick={exportToExcel} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          导出Excel
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">商品种类</p>
                <p className="text-xl font-semibold">{stats.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">库存总价值</p>
                <p className="text-xl font-semibold">¥{stats.totalValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">低库存告警</p>
                <p className="text-xl font-semibold text-orange-500">{stats.lowStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">过期商品</p>
                <p className="text-xl font-semibold text-red-500">{stats.expiredItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容选项卡 */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">库存总览</TabsTrigger>
          <TabsTrigger value="add">入库管理</TabsTrigger>
          <TabsTrigger value="remove">出库管理</TabsTrigger>
          <TabsTrigger value="charts">数据图表</TabsTrigger>
          <TabsTrigger value="history">历史记录</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* 搜索栏 */}
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索SKU或商品名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* 库存表格 */}
          <InventoryTable 
            inventory={filteredInventory} 
            onUpdate={handleInventoryUpdate}
          />
        </TabsContent>

        <TabsContent value="add">
          <AddInventoryForm onSuccess={handleInventoryUpdate} />
        </TabsContent>

        <TabsContent value="remove">
          <RemoveInventoryForm 
            inventory={inventory} 
            onSuccess={handleInventoryUpdate} 
          />
        </TabsContent>

        <TabsContent value="charts">
          <InventoryCharts inventory={inventory} />
        </TabsContent>

        <TabsContent value="history">
          <InventoryHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryPanel;
