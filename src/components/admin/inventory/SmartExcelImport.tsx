
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, CheckCircle, ArrowRight } from "lucide-react";
import * as XLSX from "xlsx";
import type { Database } from "@/integrations/supabase/types";

type InReason = Database['public']['Enums']['inventory_in_reason'];

interface SmartExcelImportProps {
  onSuccess: () => void;
}

interface ColumnMapping {
  sku: string;
  product_name: string;
  quantity: string;
  unit_cost: string;
  batch_number?: string;
  expiration_date?: string;
  date?: string;
}

interface ParsedRow {
  sku: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
  batch_number?: string;
  expiration_date?: string;
  date?: string;
}

const SmartExcelImport: React.FC<SmartExcelImportProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [excelData, setExcelData] = useState<any[][]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    sku: "",
    product_name: "",
    quantity: "",
    unit_cost: ""
  });
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [inReason, setInReason] = useState<InReason | "">("");

  const inReasons: InReason[] = ["买货", "return", "赠送", "盘点", "调拨", "其它"];

  // 智能识别列名的关键词映射
  const columnKeywords = {
    sku: ['sku', '编号', '货号', '商品编号', 'item code', 'product code'],
    product_name: ['name', '名称', '商品名称', '产品名称', 'product name', 'item name', 'bag name'],
    quantity: ['quantity', '数量', 'qty', '入库数量', 'amount'],
    unit_cost: ['cost', '成本', '单价', '价格', 'price', 'unit cost', 'bag cost'],
    batch_number: ['batch', '批次', '批号', 'batch number', 'lot'],
    expiration_date: ['expiration', '有效期', '过期时间', 'expiry date', 'exp date'],
    date: ['date', '日期', '时间', '入库时间', '导入时间', 'import date']
  };

  const smartDetectColumns = (headers: string[]): Partial<ColumnMapping> => {
    const mapping: Partial<ColumnMapping> = {};
    
    Object.entries(columnKeywords).forEach(([field, keywords]) => {
      const matchedHeader = headers.find(header => 
        keywords.some(keyword => 
          header.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      if (matchedHeader) {
        mapping[field as keyof ColumnMapping] = matchedHeader;
      }
    });

    return mapping;
  };

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

        if (jsonData.length === 0) {
          toast.error("Excel文件为空");
          return;
        }

        const headers = jsonData[0] as string[];
        const dataRows = jsonData.slice(1) as any[][];

        setExcelHeaders(headers);
        setExcelData(dataRows);

        // 智能检测列映射
        const detectedMapping = smartDetectColumns(headers);
        setColumnMapping(prev => ({
          ...prev,
          ...detectedMapping
        }));

        setStep('mapping');
        toast.success(`成功读取Excel文件，发现 ${headers.length} 个列`);
      } catch (error) {
        console.error("Excel解析错误:", error);
        toast.error("Excel文件格式错误");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleMappingComplete = () => {
    if (!columnMapping.sku || !columnMapping.product_name || !columnMapping.unit_cost) {
      toast.error("请至少映射SKU、商品名称和成本列");
      return;
    }

    // 检查是否选择了数量列或默认数量为1
    if (!columnMapping.quantity || columnMapping.quantity === "default-quantity-1") {
      if (columnMapping.quantity !== "default-quantity-1") {
        toast.error("请选择数量列或选择数量默认为1");
        return;
      }
    }

    try {
      const parsed: ParsedRow[] = excelData
        .filter(row => row.length > 0)
        .map(row => {
          const skuIndex = excelHeaders.indexOf(columnMapping.sku);
          const nameIndex = excelHeaders.indexOf(columnMapping.product_name);
          const quantityIndex = columnMapping.quantity === "default-quantity-1" ? -1 : excelHeaders.indexOf(columnMapping.quantity);
          const costIndex = excelHeaders.indexOf(columnMapping.unit_cost);
          const batchIndex = columnMapping.batch_number ? excelHeaders.indexOf(columnMapping.batch_number) : -1;
          const expIndex = columnMapping.expiration_date ? excelHeaders.indexOf(columnMapping.expiration_date) : -1;
          const dateIndex = columnMapping.date ? excelHeaders.indexOf(columnMapping.date) : -1;

          return {
            sku: String(row[skuIndex] || "").trim(),
            product_name: String(row[nameIndex] || "").trim(),
            quantity: columnMapping.quantity === "default-quantity-1" ? 1 : (Number(row[quantityIndex]) || 0),
            unit_cost: Number(row[costIndex]) || 0,
            batch_number: batchIndex >= 0 && row[batchIndex] ? String(row[batchIndex]).trim() : undefined,
            expiration_date: expIndex >= 0 && row[expIndex] ? String(row[expIndex]).trim() : undefined,
            date: dateIndex >= 0 && row[dateIndex] ? String(row[dateIndex]).trim() : undefined,
          };
        })
        .filter(item => item.sku && item.product_name && item.quantity > 0 && item.unit_cost > 0);

      setParsedData(parsed);
      setStep('preview');
      toast.success(`成功解析 ${parsed.length} 条有效记录`);
    } catch (error) {
      console.error("数据解析错误:", error);
      toast.error("数据解析失败");
    }
  };

  const handleImport = async () => {
    if (!inReason) {
      toast.error("请选择入库原因");
      return;
    }

    if (parsedData.length === 0) {
      toast.error("没有可导入的数据");
      return;
    }

    setLoading(true);

    try {
      const reasonValue = inReason as Database['public']['Enums']['inventory_in_reason'];
      
      for (const item of parsedData) {
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
            reason: `智能Excel批量入库 - ${reasonValue}`,
            created_by: user?.id
          });

        if (historyError) throw historyError;
      }

      toast.success(`成功导入 ${parsedData.length} 条记录`);
      
      // 重置状态
      setStep('upload');
      setExcelHeaders([]);
      setExcelData([]);
      setParsedData([]);
      setColumnMapping({
        sku: "",
        product_name: "",
        quantity: "",
        unit_cost: ""
      });
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
          智能Excel批量导入
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'upload' && (
          <>
            <div className="space-y-2">
              <Label>支持的列名示例</Label>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                <p>系统会自动识别以下列名（不区分大小写）：</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>SKU列：</strong>SKU、编号、货号、商品编号等</li>
                  <li><strong>商品名称：</strong>Name、名称、商品名称、产品名称、BAG Name等</li>
                  <li><strong>数量：</strong>Quantity、数量、QTY、入库数量等（可选，默认为1）</li>
                  <li><strong>成本：</strong>Cost、成本、单价、价格、BAG Cost等</li>
                  <li><strong>批次号：</strong>Batch、批次、批号等（可选）</li>
                  <li><strong>有效期：</strong>Expiration、有效期、过期时间等（可选）</li>
                  <li><strong>日期：</strong>Date、日期、时间、入库时间等（可选）</li>
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
          </>
        )}

        {step === 'mapping' && (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                已检测到 {excelHeaders.length} 个列，请确认字段映射
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SKU列 *</Label>
                  <Select value={columnMapping.sku} onValueChange={(value) => 
                    setColumnMapping(prev => ({ ...prev, sku: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="选择SKU列" />
                    </SelectTrigger>
                    <SelectContent>
                      {excelHeaders.map((header, index) => (
                        <SelectItem key={index} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>商品名称列 *</Label>
                  <Select value={columnMapping.product_name} onValueChange={(value) => 
                    setColumnMapping(prev => ({ ...prev, product_name: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="选择商品名称列" />
                    </SelectTrigger>
                    <SelectContent>
                      {excelHeaders.map((header, index) => (
                        <SelectItem key={index} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>数量列</Label>
                  <Select value={columnMapping.quantity} onValueChange={(value) => 
                    setColumnMapping(prev => ({ ...prev, quantity: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="选择数量列或默认为1" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default-quantity-1">数量默认为1</SelectItem>
                      {excelHeaders.map((header, index) => (
                        <SelectItem key={index} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>成本列 *</Label>
                  <Select value={columnMapping.unit_cost} onValueChange={(value) => 
                    setColumnMapping(prev => ({ ...prev, unit_cost: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="选择成本列" />
                    </SelectTrigger>
                    <SelectContent>
                      {excelHeaders.map((header, index) => (
                        <SelectItem key={index} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>批次号列（可选）</Label>
                  <Select value={columnMapping.batch_number || "no-mapping"} onValueChange={(value) => 
                    setColumnMapping(prev => ({ ...prev, batch_number: value === "no-mapping" ? undefined : value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="选择批次号列" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-mapping">不映射</SelectItem>
                      {excelHeaders.map((header, index) => (
                        <SelectItem key={index} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>有效期列（可选）</Label>
                  <Select value={columnMapping.expiration_date || "no-mapping"} onValueChange={(value) => 
                    setColumnMapping(prev => ({ ...prev, expiration_date: value === "no-mapping" ? undefined : value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="选择有效期列" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-mapping">不映射</SelectItem>
                      {excelHeaders.map((header, index) => (
                        <SelectItem key={index} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('upload')}>
                  重新上传
                </Button>
                <Button onClick={handleMappingComplete}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  确认映射
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'preview' && (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                数据预览 ({parsedData.length} 条有效记录)
              </div>

              <div className="space-y-2">
                <Label htmlFor="in-reason">入库原因 *</Label>
                <Select value={inReason} onValueChange={(value: InReason) => setInReason(value)}>
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

              <div className="max-h-48 overflow-y-auto border rounded p-2">
                {parsedData.slice(0, 5).map((item, index) => (
                  <div key={index} className="text-sm py-1 border-b last:border-b-0">
                    {item.sku} - {item.product_name} - 数量: {item.quantity} - 成本: ¥{item.unit_cost}
                    {item.batch_number && ` - 批次: ${item.batch_number}`}
                    {item.expiration_date && ` - 有效期: ${item.expiration_date}`}
                  </div>
                ))}
                {parsedData.length > 5 && (
                  <div className="text-sm text-muted-foreground py-1">
                    ... 还有 {parsedData.length - 5} 条记录
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('mapping')}>
                  返回映射
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={loading || !inReason}
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
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartExcelImport;
