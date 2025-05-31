
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Download, FileText, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface CleanedData {
  originalName: string;
  cleanedData: any[];
  summary: {
    totalRows: number;
    cleanedRows: number;
    removedRows: number;
  };
}

const DataCleaningForm: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [cleanedData, setCleanedData] = useState<CleanedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      setOriginalData(data);
      setPreviewData(data.slice(0, 10)); // 显示前10行预览
      toast.success(`文件上传成功，共 ${data.length} 行数据`);
    } catch (error) {
      console.error('文件处理失败:', error);
      toast.error('文件处理失败，请检查文件格式');
    } finally {
      setIsProcessing(false);
    }
  };

  const performDataCleaning = () => {
    if (!originalData.length) {
      toast.error('请先上传数据文件');
      return;
    }

    setIsProcessing(true);

    try {
      // 数据清洗逻辑
      const cleaned = originalData.filter(row => {
        // 移除空行
        const hasData = Object.values(row).some(value => 
          value !== null && value !== undefined && String(value).trim() !== ''
        );
        
        // 移除无效的金额数据
        const amount = parseFloat(String(row.amount || row.Amount || row.金额 || 0));
        const hasValidAmount = !isNaN(amount) && amount > 0;
        
        return hasData && hasValidAmount;
      }).map(row => {
        // 标准化数据格式
        return {
          ...row,
          amount: parseFloat(String(row.amount || row.Amount || row.金额 || 0)),
          date: row.date || row.Date || row.日期 || '',
          streamer: row.streamer || row.Streamer || row.主播 || '',
          platform: row.platform || row.Platform || row.平台 || 'TikTok'
        };
      });

      const result: CleanedData = {
        originalName: uploadedFile?.name || '未知文件',
        cleanedData: cleaned,
        summary: {
          totalRows: originalData.length,
          cleanedRows: cleaned.length,
          removedRows: originalData.length - cleaned.length
        }
      };

      setCleanedData(result);
      toast.success(`数据清洗完成！保留 ${cleaned.length} 行有效数据`);
    } catch (error) {
      console.error('数据清洗失败:', error);
      toast.error('数据清洗失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCleanedData = () => {
    if (!cleanedData) return;

    const worksheet = XLSX.utils.json_to_sheet(cleanedData.cleanedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "清洗后数据");
    
    const fileName = `cleaned_${cleanedData.originalName}`;
    XLSX.writeFile(workbook, fileName);
    toast.success('清洗后的数据已下载');
  };

  const resetData = () => {
    setUploadedFile(null);
    setOriginalData([]);
    setCleanedData(null);
    setPreviewData([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧹 数据清洗工具</CardTitle>
          <p className="text-sm text-muted-foreground">
            上传TikTok导出的payout数据，系统将自动清洗无效数据并标准化格式
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 文件上传区域 */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    点击上传Excel文件或拖拽文件到此处
                  </span>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </Label>
                <p className="mt-1 text-xs text-gray-500">
                  支持 .xlsx, .xls, .csv 格式
                </p>
              </div>
            </div>
          </div>

          {/* 文件信息 */}
          {uploadedFile && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium">{uploadedFile.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({originalData.length} 行数据)
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetData}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  重新上传
                </Button>
              </div>
            </div>
          )}

          {/* 数据预览 */}
          {previewData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">数据预览（前10行）</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        {Object.keys(previewData[0] || {}).map(key => (
                          <th key={key} className="px-2 py-1 text-left font-medium">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr key={index} className="border-t">
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="px-2 py-1">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 清洗按钮 */}
          {originalData.length > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={performDataCleaning}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? '清洗中...' : '开始数据清洗'}
              </Button>
            </div>
          )}

          {/* 清洗结果 */}
          {cleanedData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-600">✅ 数据清洗完成</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {cleanedData.summary.totalRows}
                    </div>
                    <div className="text-sm text-gray-600">原始数据行数</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {cleanedData.summary.cleanedRows}
                    </div>
                    <div className="text-sm text-gray-600">清洗后行数</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <div className="text-2xl font-bold text-red-600">
                      {cleanedData.summary.removedRows}
                    </div>
                    <div className="text-sm text-gray-600">移除的无效行</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={downloadCleanedData} className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    下载清洗后的数据
                  </Button>
                </div>

                <div className="text-xs text-gray-500">
                  <strong>清洗规则：</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>移除所有空行和无效数据</li>
                    <li>移除金额为0或无效的记录</li>
                    <li>标准化字段名称（金额、日期、主播、平台）</li>
                    <li>统一数据格式便于后续分析</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataCleaningForm;
