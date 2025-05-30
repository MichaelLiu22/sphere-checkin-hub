
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Upload, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import type { Database } from "@/integrations/supabase/types";

type InReason = Database['public']['Enums']['inventory_in_reason'];

interface ExcelImportProps {
  onSuccess: () => void;
}

interface ExcelRow {
  sku: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
  batch_number?: string;
  expiration_date?: string;
}

const ExcelImport: React.FC<ExcelImportProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [inReason, setInReason] = useState<InReason | "">("");

  const inReasons: InReason[] = ["买货", "return", "赠送", "盘点", "调拨", "其它"];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // 假设第一行是标题，从第二行开始是数据
        const rows = jsonData.slice(1) as any[][];
        const parsedData: ExcelRow[] = rows
          .filter(row => row.length >= 4) // 至少需要SKU, 名称, 数量, 成本
          .map(row => ({
            sku: String(row[0] || "").trim(),
            product_name: String(row[1] || "").trim(),
            quantity: Number(row[2]) || 0,
            unit_cost: Number(row[3]) || 0,
            batch_number: row[4] ? String(row[4]).trim() : undefined,
            expiration_date: row[5] ? String(row[5]).trim() : undefined,
          }))
          .filter(item => item.sku && item.product_name && item.quantity > 0 && item.unit_cost > 0);

        setExcelData(parsedData);
        toast.success(`成功解析 ${parsedData.length} 条记录`);
      } catch (error) {
        console.error("Excel解析错误:", error);
        toast.error("Excel文件格式错误");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (!inReason) {
      toast.error("请选择入库原因");
      return;
    }

    if (excelData.length === 0) {
      toast.error("没有可导入的数据");
      return;
    }

    setLoading(true);

    try {
      const reasonValue = inReason as InReason;
      
      for (const item of excelData) {
        // 检查SKU是否已存在
        const { data: existingItem, error: queryError } = await supabase
          .from('inventory')
          .select('id, quantity')
          .eq('sku', item.sku)
          .maybeSingle();

        if (queryError) throw queryError;

        if (existingItem) {
          // 更新现有库存
          const newQuantity = existingItem.quantity + item.quantity;
          
          const { error: updateError } = await supabase
            .from('inventory')
            .update({
              quantity: newQuantity,
              unit_cost: item.unit_cost,
              in_reason: reasonValue,
              ...(item.batch_number && { batch_number: item.batch_number }),
              ...(item.expiration_date && { expiration_date: item.expiration_date }),
            })
            .eq('id', existingItem.id);

          if (updateError) throw updateError;
        } else {
          // 创建新库存记录
          const { error: insertError } = await supabase
            .from('inventory')
            .insert({
              sku: item.sku,
              product_name: item.product_name,
              quantity: item.quantity,
              unit_cost: item.unit_cost,
              in_reason: reasonValue,
              batch_number: item.batch_number || null,
              expiration_date: item.expiration_date || null,
              created_by: user?.id
            });

          if (insertError) throw insertError;
        }

        // 记录入库历史
        const { error: historyError } = await supabase
          .from('inventory_history')
          .insert({
            sku: item.sku,
            product_name: item.product_name,
            quantity: item.quantity,
            operation_type: 'in',
            unit_cost: item.unit_cost,
            in_reason: reasonValue,
            batch_number: item.batch_number || null,
            expiration_date: item.expiration_date || null,
            reason: `Excel批量入库 - ${reasonValue}`,
            created_by: user?.id
          });

        if (historyError) throw historyError;
      }

      toast.success(`成功导入 ${excelData.length} 条记录`);
      setExcelData([]);
      setInReason("");
      onSuccess();
    } catch (error: any) {
      console.error("导入失败:", error);
      toast.error("导入失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Excel批量导入
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Excel文件格式说明</Label>
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
            <p>Excel文件应包含以下列（按顺序）：</p>
            <ul className="list-disc list-inside mt-2">
              <li>第1列：SKU编号（必填）</li>
              <li>第2列：商品名称（必填）</li>
              <li>第3列：数量（必填）</li>
              <li>第4列：单件成本（必填）</li>
              <li>第5列：批次编号（可选）</li>
              <li>第6列：有效期（可选，格式：YYYY-MM-DD）</li>
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excel-file">选择Excel文件</Label>
          <Input
            id="excel-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="in-reason">入库原因 *</Label>
          <Select onValueChange={(value: InReason) => setInReason(value)}>
            <SelectTrigger>
              <SelectValue placeholder="请选择入库原因" />
            </SelectTrigger>
            <SelectContent>
              {inReasons.map((reason) => (
                <SelectItem key={reason} value={reason}>
                  {reason}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {excelData.length > 0 && (
          <div className="space-y-2">
            <Label>预览数据 ({excelData.length} 条记录)</Label>
            <div className="max-h-48 overflow-y-auto border rounded p-2">
              {excelData.slice(0, 5).map((item, index) => (
                <div key={index} className="text-sm py-1 border-b last:border-b-0">
                  {item.sku} - {item.product_name} - 数量: {item.quantity} - 成本: ¥{item.unit_cost}
                </div>
              ))}
              {excelData.length > 5 && (
                <div className="text-sm text-muted-foreground py-1">
                  ... 还有 {excelData.length - 5} 条记录
                </div>
              )}
            </div>
          </div>
        )}

        <Button 
          onClick={handleImport} 
          disabled={loading || excelData.length === 0 || !inReason}
          className="w-full"
        >
          {loading ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              导入中...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              确认导入
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExcelImport;
