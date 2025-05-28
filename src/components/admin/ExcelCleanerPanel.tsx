import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Download, Calendar as CalendarIcon, FileX } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface ExcelRow {
  [key: string]: any;
}

type AccountingMode = 'order_created' | 'statement_date';

const ExcelCleanerPanel: React.FC = () => {
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [filteredData, setFilteredData] = useState<ExcelRow[]>([]);
  const [originalHeaders, setOriginalHeaders] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [accountingMode, setAccountingMode] = useState<AccountingMode>('order_created');

  // Load user preference on component mount
  useEffect(() => {
    const savedMode = localStorage.getItem('tiktok-fs-accounting-mode') as AccountingMode;
    if (savedMode && ['order_created', 'statement_date'].includes(savedMode)) {
      setAccountingMode(savedMode);
    }
  }, []);

  // Save user preference when mode changes
  useEffect(() => {
    localStorage.setItem('tiktok-fs-accounting-mode', accountingMode);
  }, [accountingMode]);

  // Get current accounting mode display text
  const getAccountingModeText = () => {
    return accountingMode === 'order_created' ? 'Order Created Date' : 'Statement Date';
  };

  // Handle file upload - FIXED: Read all rows, not just first 5
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
          // FIXED: Read ALL rows, not just slice(1, 6)
          const rows = jsonData.slice(1).map(row => {
            const obj: ExcelRow = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });

          console.log(`📊 Excel文件读取完成 - 总行数: ${rows.length}`);
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

  // Find date column based on accounting mode
  const findDateColumn = useCallback(() => {
    if (accountingMode === 'order_created') {
      const dateColumns = originalHeaders.filter(header => 
        header.toLowerCase().includes('order') && 
        (header.toLowerCase().includes('create') || header.toLowerCase().includes('date')) ||
        header.includes('订单') && header.includes('创建') ||
        header.includes('创建日期')
      );
      return dateColumns[0] || '';
    } else {
      const dateColumns = originalHeaders.filter(header =>
        header.toLowerCase().includes('statement') && header.toLowerCase().includes('date') ||
        header.includes('结算') && header.includes('日期') ||
        header.includes('Statement date')
      );
      return dateColumns[0] || '';
    }
  }, [originalHeaders, accountingMode]);

  // Find settlement column
  const findSettlementColumn = useCallback(() => {
    const settlementColumns = originalHeaders.filter(header =>
      header.toLowerCase().includes('settlement') ||
      header.includes('结算') ||
      header.includes('金额') ||
      header.includes('Total settlement amount')
    );
    return settlementColumns[0] || '';
  }, [originalHeaders]);

  // Parse date - enhanced date parsing logic
  const parseDate = useCallback((dateStr: string): Date | null => {
    if (!dateStr) return null;
    
    const dateString = String(dateStr).trim();
    
    // YYYY/MM/DD format
    const yyyymmddPattern = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/;
    const yyyymmddMatch = dateString.match(yyyymmddPattern);
    if (yyyymmddMatch) {
      const [, year, month, day] = yyyymmddMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // YYYY-MM-DD format
    const yyyymmddDashPattern = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
    const yyyymmddDashMatch = dateString.match(yyyymmddDashPattern);
    if (yyyymmddDashMatch) {
      const [, year, month, day] = yyyymmddDashMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // MM/DD/YYYY format
    const mmddyyyyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const mmddyyyyMatch = dateString.match(mmddyyyyPattern);
    if (mmddyyyyMatch) {
      const [, month, day, year] = mmddyyyyMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Excel date serial number
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

    // Direct parse
    const directParse = new Date(dateString);
    if (!isNaN(directParse.getTime())) {
      return directParse;
    }

    return null;
  }, []);

  // Parse number
  const parseNumber = useCallback((value: string | number): number => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;
    
    // 移除非数字字符（保留负号和小数点）
    const cleaned = value.replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }, []);

  // Apply filter and clean with enhanced debugging
  const applyFilterAndClean = useCallback(() => {
    if (!excelData.length) return;

    console.log('🚀 Tiktok FS - Beast 数据清洗调试开始');
    console.log('='.repeat(50));
    
    // 1. Output header fields
    console.log('📊 表头字段：', originalHeaders);
    console.log(`📊 数据总行数: ${excelData.length}`);
    
    // 2. Show first row field names
    if (excelData.length > 0) {
      console.log('📋 第1行所有字段名：', Object.keys(excelData[0]));
    }

    const dateColumn = findDateColumn();
    const settlementColumn = findSettlementColumn();

    console.log(`🎯 当前会计模式：${getAccountingModeText()}`);
    console.log('🎯 自动识别的日期字段：', dateColumn || '❌ 未找到');
    console.log('🎯 自动识别的金额字段：', settlementColumn || '❌ 未找到');

    if (!dateColumn) {
      const expectedField = accountingMode === 'order_created' ? 'Order created date' : 'Statement date';
      console.error(`❌ 未找到${getAccountingModeText()}字段`);
      console.log(`💡 建议检查字段名是否为："${expectedField}"`);
      toast.error(`未找到${getAccountingModeText()}字段`);
      return;
    }

    if (!settlementColumn) {
      console.error('❌ 未找到结算金额字段');
      console.log('💡 建议检查字段名是否为："Total settlement amount"');
      toast.error('未找到结算金额字段');
      return;
    }

    // 3. Output user selected date range
    console.log('📅 用户选择的筛选范围：');
    console.log('  起始日期：', startDate ? format(startDate, 'yyyy-MM-dd') : '未设置');
    console.log('  结束日期：', endDate ? format(endDate, 'yyyy-MM-dd') : '未设置');

    let filtered = [...excelData];

    // 4. Analyze date parsing row by row
    console.log('📅 日期字段解析分析：');
    excelData.slice(0, Math.min(10, excelData.length)).forEach((row, index) => {
      const rawDateValue = row[dateColumn];
      const parsedDate = parseDate(rawDateValue);
      
      if (parsedDate) {
        console.log(`✅ 第${index + 1}行日期字段值：'${rawDateValue}' → 解析成功：${parsedDate.toISOString()}`);
      } else {
        console.log(`❌ 第${index + 1}行日期字段值：'${rawDateValue}' → 解析失败`);
      }
    });

    // 5. Analyze amount parsing row by row
    console.log('💰 金额字段解析分析：');
    excelData.slice(0, Math.min(10, excelData.length)).forEach((row, index) => {
      const rawAmountValue = row[settlementColumn];
      const parsedAmount = parseNumber(rawAmountValue);
      
      if (isNaN(parsedAmount)) {
        console.log(`⚠️ 第${index + 1}行金额字段值：'${rawAmountValue}' → 转换失败（NaN）`);
      } else {
        console.log(`✅ 第${index + 1}行金额字段值：'${rawAmountValue}' → 转换后数值：${parsedAmount}`);
      }
    });

    // Time filtering
    if (startDate || endDate) {
      const beforeFilterCount = filtered.length;
      
      filtered = filtered.filter(row => {
        const rowDate = parseDate(row[dateColumn]);
        if (!rowDate) {
          console.log(`⚠️ 跳过无效日期的行：'${row[dateColumn]}'`);
          return false;
        }

        if (startDate && rowDate < startDate) {
          console.log(`📅 行被过滤（早于起始日期）：${rowDate.toISOString()} < ${startDate.toISOString()}`);
          return false;
        }
        if (endDate && rowDate > endDate) {
          console.log(`📅 行被过滤（晚于结束日期）：${rowDate.toISOString()} > ${endDate.toISOString()}`);
          return false;
        }
        return true;
      });
      
      console.log(`📊 筛选前行数：${beforeFilterCount}，筛选后行数：${filtered.length}`);
      
      if (filtered.length === 0) {
        console.warn('⚠️ 无数据满足当前日期筛选条件，可能为字段名或日期格式问题');
        console.log('💡 检查要点：');
        console.log(`  1. 日期字段名是否正确（当前模式期望："${accountingMode === 'order_created' ? 'Order created date' : 'Statement date'}"）`);
        console.log('  2. 日期格式是否为 YYYY/MM/DD 或其他支持的格式');
        console.log('  3. 选择的日期范围是否包含数据');
      }
    }

    // Sort by date in ascending order
    filtered.sort((a, b) => {
      const dateA = parseDate(a[dateColumn]);
      const dateB = parseDate(b[dateColumn]);
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    });

    // Process settlement field
    filtered = filtered.map(row => ({
      ...row,
      [settlementColumn]: parseNumber(row[settlementColumn])
    }));

    // Calculate total and add summary row
    const total = filtered.reduce((sum, row) => {
      const value = parseNumber(row[settlementColumn]);
      return sum + value;
    }, 0);

    console.log(`💰 计算得出的总金额：${total}`);

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
    
    console.log('✅ 筛选完成，最终结果：');
    console.log(`  数据行数：${filtered.length - 1}`);
    console.log(`  合计行数：1`);
    console.log('='.repeat(50));
    console.log('🏁 Tiktok FS - Beast 数据清洗调试结束');
    
    toast.success(`筛选完成，共 ${filtered.length - 1} 条数据记录 + 1 条合计`);
  }, [excelData, startDate, endDate, originalHeaders, accountingMode, findDateColumn, findSettlementColumn, parseDate, parseNumber, getAccountingModeText]);

  // Export Excel
  const exportToExcel = useCallback(() => {
    if (!filteredData.length) {
      toast.error('没有数据可导出');
      return;
    }

    try {
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Cleaned Data');
      XLSX.writeFile(workbook, 'cleaned_financial_report.xlsx');
      toast.success('Excel文件导出成功');
    } catch (error) {
      console.error('导出错误:', error);
      toast.error('导出失败');
    }
  }, [filteredData]);

  // Check if row has negative amount
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
            Tiktok FS - Beast
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Accounting Mode Selector */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Choose Accounting Mode</label>
              <RadioGroup 
                value={accountingMode} 
                onValueChange={(value: AccountingMode) => setAccountingMode(value)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="order_created" id="order_created" />
                  <label htmlFor="order_created" className="text-sm">By Order Created Date</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="statement_date" id="statement_date" />
                  <label htmlFor="statement_date" className="text-sm">By Statement Date</label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Current mode indicator */}
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>📊 当前计算模式:</strong> You're currently calculating profit based on: <strong>{getAccountingModeText()}</strong>
              </p>
            </div>
          </div>

          {/* File upload */}
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

          {/* Time filtering */}
          {excelData.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">时间范围筛选</h3>
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>📊 调试模式已启用</strong> - 点击"应用筛选和清洗"后请查看浏览器控制台(F12)获取详细调试信息
                </p>
                <p className="text-xs text-blue-600">
                  当前期望字段名：<code>"{accountingMode === 'order_created' ? 'Order created date' : 'Statement date'}"</code> 和 <code>"Total settlement amount"</code>
                </p>
              </div>
              
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

      {/* Data preview table - FIXED: Proper contained scrolling */}
      {filteredData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>数据预览</CardTitle>
              <Button onClick={exportToExcel} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                导出清洗后的财务报告
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* FIXED: Use ScrollArea with fixed height and contained scrolling */}
            <ScrollArea className="h-96 w-full border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    {originalHeaders.map((header, index) => (
                      <TableHead key={index} className="whitespace-nowrap min-w-[120px]">
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
                        <TableCell key={colIndex} className="whitespace-nowrap min-w-[120px]">
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
            </ScrollArea>
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
