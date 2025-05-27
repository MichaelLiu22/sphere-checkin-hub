
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Download, Calendar as CalendarIcon, FileX } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface ExcelRow {
  [key: string]: any;
}

const ExcelCleanerPanel: React.FC = () => {
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [filteredData, setFilteredData] = useState<ExcelRow[]>([]);
  const [originalHeaders, setOriginalHeaders] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>('');

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

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length > 0) {
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1).map(row => {
            const obj: ExcelRow = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });

          setOriginalHeaders(headers);
          setExcelData(rows);
          setFilteredData(rows);
          toast.success(`成功读取 ${rows.length} 行数据`);
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

  // 查找日期字段
  const findDateColumn = useCallback(() => {
    const dateColumns = originalHeaders.filter(header => 
      header.toLowerCase().includes('order') && 
      (header.toLowerCase().includes('create') || header.toLowerCase().includes('date')) ||
      header.includes('订单') && header.includes('创建') ||
      header.includes('创建日期')
    );
    return dateColumns[0] || '';
  }, [originalHeaders]);

  // 查找结算字段
  const findSettlementColumn = useCallback(() => {
    const settlementColumns = originalHeaders.filter(header =>
      header.toLowerCase().includes('settlement') ||
      header.includes('结算') ||
      header.includes('金额')
    );
    return settlementColumns[0] || '';
  }, [originalHeaders]);

  // 解析日期 - 修复日期解析逻辑，支持YYYY/MM/DD格式
  const parseDate = useCallback((dateStr: string): Date | null => {
    if (!dateStr) return null;
    
    // 转换为字符串处理
    const dateString = String(dateStr).trim();
    
    // 检查YYYY/MM/DD格式
    const yyyymmddPattern = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/;
    const yyyymmddMatch = dateString.match(yyyymmddPattern);
    if (yyyymmddMatch) {
      const [, year, month, day] = yyyymmddMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // 检查YYYY-MM-DD格式
    const yyyymmddDashPattern = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
    const yyyymmddDashMatch = dateString.match(yyyymmddDashPattern);
    if (yyyymmddDashMatch) {
      const [, year, month, day] = yyyymmddDashMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // 检查MM/DD/YYYY格式
    const mmddyyyyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const mmddyyyyMatch = dateString.match(mmddyyyyPattern);
    if (mmddyyyyMatch) {
      const [, month, day, year] = mmddyyyyMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // 如果是Excel日期序列号
    if (/^\d+$/.test(dateString) && parseInt(dateString) > 1000) {
      try {
        const excelDate = XLSX.SSF.parse_date_code(parseInt(dateString));
        if (excelDate) {
          return new Date(excelDate.y, excelDate.m - 1, excelDate.d);
        }
      } catch (error) {
        console.log('Excel日期解析失败:', error);
      }
    }

    // 尝试直接解析
    const directParse = new Date(dateString);
    if (!isNaN(directParse.getTime())) {
      return directParse;
    }

    return null;
  }, []);

  // 转换数字
  const parseNumber = useCallback((value: string | number): number => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;
    
    // 移除非数字字符（保留负号和小数点）
    const cleaned = value.replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }, []);

  // 应用筛选和清洗
  const applyFilterAndClean = useCallback(() => {
    if (!excelData.length) return;

    const dateColumn = findDateColumn();
    const settlementColumn = findSettlementColumn();

    if (!dateColumn) {
      toast.error('未找到订单创建日期字段');
      return;
    }

    if (!settlementColumn) {
      toast.error('未找到结算金额字段');
      return;
    }

    let filtered = [...excelData];

    // 时间筛选
    if (startDate || endDate) {
      filtered = filtered.filter(row => {
        const rowDate = parseDate(row[dateColumn]);
        if (!rowDate) return false;

        if (startDate && rowDate < startDate) return false;
        if (endDate && rowDate > endDate) return false;
        return true;
      });
    }

    // 按日期排序
    filtered.sort((a, b) => {
      const dateA = parseDate(a[dateColumn]);
      const dateB = parseDate(b[dateColumn]);
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    });

    // 处理结算字段
    filtered = filtered.map(row => ({
      ...row,
      [settlementColumn]: parseNumber(row[settlementColumn])
    }));

    // 计算总和并添加合计行
    const total = filtered.reduce((sum, row) => {
      const value = parseNumber(row[settlementColumn]);
      return sum + value;
    }, 0);

    const totalRow: ExcelRow = {};
    originalHeaders.forEach(header => {
      if (header === dateColumn) {
        totalRow[header] = '合计';
      } else if (header === settlementColumn) {
        totalRow[header] = total;
      } else {
        totalRow[header] = '';
      }
    });

    filtered.push(totalRow);
    setFilteredData(filtered);
    toast.success(`筛选完成，共 ${filtered.length - 1} 条数据记录 + 1 条合计`);
  }, [excelData, startDate, endDate, originalHeaders, findDateColumn, findSettlementColumn, parseDate, parseNumber]);

  // 导出Excel
  const exportToExcel = useCallback(() => {
    if (!filteredData.length) {
      toast.error('没有数据可导出');
      return;
    }

    try {
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Cleaned Data');
      XLSX.writeFile(workbook, 'cleaned_april_orders.xlsx');
      toast.success('Excel文件导出成功');
    } catch (error) {
      console.error('导出错误:', error);
      toast.error('导出失败');
    }
  }, [filteredData]);

  // 检查是否为负数行
  const isNegativeRow = useCallback((row: ExcelRow): boolean => {
    const settlementColumn = findSettlementColumn();
    if (!settlementColumn) return false;
    return parseNumber(row[settlementColumn]) < 0;
  }, [findSettlementColumn, parseNumber]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileX className="h-5 w-5" />
            Excel 数据清洗工具
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 文件上传 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">上传 Excel 文件</label>
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
          </div>

          {/* 时间筛选 */}
          {excelData.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">时间范围筛选</h3>
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">开始日期</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "yyyy-MM-dd") : "选择开始日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">结束日期</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "yyyy-MM-dd") : "选择结束日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button onClick={applyFilterAndClean} className="mt-6">
                  应用筛选和清洗
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 导出按钮 - 当有筛选数据时显示 */}
      {filteredData.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                共 {filteredData.length - 1} 条数据记录 + 1 条合计行
              </div>
              <Button onClick={exportToExcel} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                导出清洗后的 Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 数据预览表格 */}
      {filteredData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>数据预览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    {originalHeaders.map((header, index) => (
                      <TableHead key={index} className="whitespace-nowrap">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((row, index) => (
                    <TableRow 
                      key={index}
                      className={cn(
                        isNegativeRow(row) && "bg-red-50",
                        row[findDateColumn()] === '合计' && "bg-blue-50 font-semibold"
                      )}
                    >
                      {originalHeaders.map((header, colIndex) => (
                        <TableCell key={colIndex} className="whitespace-nowrap">
                          {typeof row[header] === 'number' ? 
                            row[header].toLocaleString() : 
                            String(row[header] || '')
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              共 {filteredData.length - 1} 条数据记录 + 1 条合计行
              {filteredData.some(isNegativeRow) && (
                <span className="ml-2 text-red-600">
                  (红色高亮表示结算金额为负数的记录)
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExcelCleanerPanel;
