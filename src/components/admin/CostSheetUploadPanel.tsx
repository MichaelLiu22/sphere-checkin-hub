
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CostRow {
  SKU?: string;
  Cost?: number | string;
  Notes?: string;
  [key: string]: any;
}

const CostSheetUploadPanel: React.FC = () => {
  const [excelData, setExcelData] = useState<CostRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { user } = useAuth();

  // 处理文件上传
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      toast.error('请上传 .xlsx 格式的文件');
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);
    setValidationErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // 读取第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        console.log(`📋 读取工作表: "${firstSheetName}"`);
        
        // 读取数据
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          raw: false
        }) as any[][];

        if (jsonData.length > 0) {
          const headerRow = jsonData[0] as string[];
          const dataRows = jsonData.slice(1).filter(row => {
            return row.some(cell => cell !== null && cell !== undefined && cell !== '');
          });

          // 转换为对象数组
          const rows = dataRows.map(row => {
            const obj: CostRow = {};
            headerRow.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });

          setHeaders(headerRow);
          setExcelData(rows);
          
          // 验证数据
          validateData(rows, headerRow);
          
          toast.success(`成功读取 ${rows.length} 行成本数据`);
        } else {
          toast.error('Excel文件中没有找到有效数据');
        }
      } catch (error) {
        console.error('Excel读取错误:', error);
        toast.error('Excel文件读取失败');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  }, []);

  // 验证数据
  const validateData = (rows: CostRow[], headers: string[]) => {
    const errors: string[] = [];
    
    // 检查必需字段
    const hasSKU = headers.some(h => h.toLowerCase().includes('sku'));
    const hasCost = headers.some(h => h.toLowerCase().includes('cost'));
    
    if (!hasSKU) {
      errors.push('缺少必需字段：SKU（产品编码）');
    }
    if (!hasCost) {
      errors.push('缺少必需字段：Cost（成本金额）');
    }

    // 检查数据行
    if (hasSKU && hasCost) {
      const skuField = headers.find(h => h.toLowerCase().includes('sku'));
      const costField = headers.find(h => h.toLowerCase().includes('cost'));
      
      rows.forEach((row, index) => {
        // 检查 SKU 是否为空
        if (!row[skuField!] || String(row[skuField!]).trim() === '') {
          errors.push(`第 ${index + 2} 行：SKU 不能为空`);
        }
        
        // 检查 Cost 是否为有效数字
        const costValue = row[costField!];
        if (!costValue || isNaN(Number(costValue))) {
          errors.push(`第 ${index + 2} 行：Cost 必须是有效数字`);
        }
      });
    }

    setValidationErrors(errors);
  };

  // 上传到数据库
  const uploadToDatabase = async () => {
    if (!user || validationErrors.length > 0) return;

    setIsUploading(true);
    try {
      const skuField = headers.find(h => h.toLowerCase().includes('sku'));
      const costField = headers.find(h => h.toLowerCase().includes('cost'));
      const notesField = headers.find(h => h.toLowerCase().includes('note')) || 
                        headers.find(h => h.toLowerCase().includes('备注'));

      let insertCount = 0;
      let updateCount = 0;

      for (const row of excelData) {
        const sku = String(row[skuField!]).trim();
        const cost = Number(row[costField!]);
        const notes = notesField ? String(row[notesField] || '').trim() : '';

        // 检查 SKU 是否已存在
        const { data: existingRecord } = await supabase
          .from('product_costs')
          .select('id')
          .eq('sku', sku)
          .single();

        if (existingRecord) {
          // 更新现有记录
          const { error } = await supabase
            .from('product_costs')
            .update({
              cost,
              notes,
              uploaded_by: user.id,
              updated_at: new Date().toISOString()
            })
            .eq('sku', sku);

          if (error) throw error;
          updateCount++;
        } else {
          // 插入新记录
          const { error } = await supabase
            .from('product_costs')
            .insert({
              sku,
              cost,
              notes,
              uploaded_by: user.id
            });

          if (error) throw error;
          insertCount++;
        }
      }

      toast.success(`✅ 成本表已成功上传，共 ${insertCount + updateCount} 条记录（新增 ${insertCount} 条，更新 ${updateCount} 条）`);
      
      // 清空数据
      setExcelData([]);
      setHeaders([]);
      setFileName('');
      setValidationErrors([]);
      
      // 重置文件输入
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('上传错误:', error);
      toast.error('上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            成本表上传（Upload Cost Sheet）
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 文件上传 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">上传成本表 Excel 文件 (.xlsx)</label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".xlsx"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="flex-1"
              />
              <Button disabled={isProcessing} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                {isProcessing ? '处理中...' : '选择文件'}
              </Button>
            </div>
            {fileName && (
              <p className="text-sm text-muted-foreground">已选择: {fileName}</p>
            )}
            <p className="text-xs text-blue-600">
              💡 支持多个工作表，将自动读取第一个工作表。必须包含 SKU 和 Cost 字段。
            </p>
          </div>

          {/* 验证错误显示 */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">数据验证错误</h3>
                  <ul className="mt-2 text-sm text-red-700 list-disc pl-5">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 数据预览表格 */}
          {excelData.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">数据预览</h3>
                <Button 
                  onClick={uploadToDatabase} 
                  disabled={validationErrors.length > 0 || isUploading}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {isUploading ? '上传中...' : '确认上传'}
                </Button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-2">
                <p className="text-sm text-blue-800 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  数据将用于匹配 TikTok 报表中的 SKU，自动计算利润（Sales - Cost）
                </p>
              </div>
              
              <ScrollArea className="h-96 w-full border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map((header, index) => (
                        <TableHead key={index} className="whitespace-nowrap min-w-[150px]">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* 显示前10行数据 */}
                    {excelData.slice(0, 10).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {headers.map((header, colIndex) => (
                          <TableCell key={colIndex} className="whitespace-nowrap min-w-[150px]">
                            {String(row[header] || '')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              <div className="text-right text-sm text-muted-foreground">
                {excelData.length > 10 ? `显示前 10 行，共 ${excelData.length} 行数据` : `共 ${excelData.length} 行数据`}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CostSheetUploadPanel;
