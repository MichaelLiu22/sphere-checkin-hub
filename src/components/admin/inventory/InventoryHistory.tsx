import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, ArrowUp, ArrowDown, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HistoryRecord {
  id: string;
  sku: string;
  product_name: string;
  quantity: number;
  operation_type: 'in' | 'out';
  unit_cost?: number;
  reason?: string;
  batch_number?: string;
  expiration_date?: string;
  created_at: string;
  created_by?: string;
  user?: {
    full_name: string;
  };
}

const InventoryHistory: React.FC = () => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [operationFilter, setOperationFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [history, searchTerm, operationFilter, dateRange]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_history')
        .select(`
          *,
          user:users!inventory_history_created_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: HistoryRecord[] = (data || []).map(item => ({
        ...item,
        operation_type: item.operation_type as 'in' | 'out',
        user: Array.isArray(item.user) ? item.user[0] : item.user
      }));
      
      setHistory(transformedData);
    } catch (error: any) {
      console.error("Error fetching inventory history:", error);
      toast.error("获取历史记录失败");
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = [...history];

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 操作类型过滤
    if (operationFilter !== "all") {
      filtered = filtered.filter(record => record.operation_type === operationFilter);
    }

    // 日期范围过滤
    if (dateRange.start) {
      filtered = filtered.filter(record => 
        new Date(record.created_at) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(record => 
        new Date(record.created_at) <= new Date(dateRange.end + "T23:59:59")
      );
    }

    setFilteredHistory(filtered);
  };

  const exportToExcel = () => {
    const csvContent = [
      ["操作时间", "操作类型", "SKU", "商品名称", "数量", "单价", "原因", "批次", "有效期", "操作人"],
      ...filteredHistory.map(record => [
        new Date(record.created_at).toLocaleString('zh-CN'),
        record.operation_type === 'in' ? '入库' : '出库',
        record.sku,
        record.product_name,
        record.quantity,
        record.unit_cost || "",
        record.reason || "",
        record.batch_number || "",
        record.expiration_date || "",
        record.user?.full_name || ""
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `inventory_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("历史记录已导出");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <History className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>加载历史记录中...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            入库/出库历史记录
          </CardTitle>
          <Button onClick={exportToExcel} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出记录
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 过滤器 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>搜索</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索SKU、商品名称或原因..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>操作类型</Label>
            <Select value={operationFilter} onValueChange={setOperationFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="in">入库</SelectItem>
                <SelectItem value="out">出库</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>开始日期</Label>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>结束日期</Label>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>

        {/* 历史记录表格 */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>操作时间</TableHead>
                <TableHead>操作类型</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>商品名称</TableHead>
                <TableHead>数量</TableHead>
                <TableHead>单价</TableHead>
                <TableHead>总价值</TableHead>
                <TableHead>原因</TableHead>
                <TableHead>批次</TableHead>
                <TableHead>有效期</TableHead>
                <TableHead>操作人</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="text-sm">
                    {new Date(record.created_at).toLocaleString('zh-CN')}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={record.operation_type === 'in' ? 'default' : 'destructive'}
                      className="flex items-center gap-1 w-fit"
                    >
                      {record.operation_type === 'in' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                      {record.operation_type === 'in' ? '入库' : '出库'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{record.sku}</TableCell>
                  <TableCell>{record.product_name}</TableCell>
                  <TableCell className="font-semibold">
                    {record.operation_type === 'in' ? '+' : '-'}{record.quantity}
                  </TableCell>
                  <TableCell>
                    {record.unit_cost ? formatCurrency(record.unit_cost) : '-'}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {record.unit_cost ? formatCurrency(record.quantity * record.unit_cost) : '-'}
                  </TableCell>
                  <TableCell>{record.reason || '-'}</TableCell>
                  <TableCell>{record.batch_number || '-'}</TableCell>
                  <TableCell>{record.expiration_date || '-'}</TableCell>
                  <TableCell>{record.user?.full_name || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            暂无历史记录
          </div>
        )}

        {/* 统计信息 */}
        {filteredHistory.length > 0 && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground">总操作次数</p>
                <p className="text-lg font-semibold">{filteredHistory.length}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">入库操作</p>
                <p className="text-lg font-semibold text-green-600">
                  {filteredHistory.filter(r => r.operation_type === 'in').length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">出库操作</p>
                <p className="text-lg font-semibold text-red-600">
                  {filteredHistory.filter(r => r.operation_type === 'out').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryHistory;
