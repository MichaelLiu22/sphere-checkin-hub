
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Eye, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DataUploadSectionProps {
  onDataUpload: (data: any[], mapping: any) => void;
  existingData: any[];
  fieldMapping: {
    orderDate: string;
    settlementAmount: string;
  };
}

const DataUploadSection: React.FC<DataUploadSectionProps> = ({
  onDataUpload,
  existingData,
  fieldMapping
}) => {
  const [uploadedData, setUploadedData] = useState<any[]>(existingData);
  const [currentMapping, setCurrentMapping] = useState(fieldMapping);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error("请上传Excel文件 (.xlsx 或 .xls)");
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log("上传的TikTok Payout数据:", jsonData);
      setUploadedData(jsonData);
      setShowPreview(true);
      
      // Auto-detect common field names
      if (jsonData.length > 0) {
        const firstRow = jsonData[0];
        const fields = Object.keys(firstRow);
        
        // Auto-detect order date field
        const dateField = fields.find(field => 
          field.toLowerCase().includes('order') && 
          (field.toLowerCase().includes('create') || field.toLowerCase().includes('date'))
        ) || fields.find(field => 
          field.toLowerCase().includes('date')
        ) || '';

        // Auto-detect settlement amount field
        const amountField = fields.find(field => 
          field.toLowerCase().includes('settlement') && 
          field.toLowerCase().includes('amount')
        ) || fields.find(field => 
          field.toLowerCase().includes('total') && 
          field.toLowerCase().includes('amount')
        ) || fields.find(field => 
          field.toLowerCase().includes('revenue')
        ) || '';

        if (dateField || amountField) {
          setCurrentMapping({
            orderDate: dateField,
            settlementAmount: amountField
          });
          
          if (dateField && amountField) {
            toast.success("字段自动映射成功");
          } else {
            toast.warning("部分字段需要手动映射");
          }
        }
      }
      
      toast.success(`成功读取 ${jsonData.length} 条TikTok订单记录`);
    } catch (error) {
      console.error("文件读取失败:", error);
      toast.error("文件读取失败，请检查文件格式");
    }
  };

  const validateAndConfirm = () => {
    if (!currentMapping.orderDate || !currentMapping.settlementAmount) {
      toast.error("请完成字段映射");
      return;
    }

    if (uploadedData.length === 0) {
      toast.error("请先上传数据");
      return;
    }

    // Validate data quality
    const validRows = uploadedData.filter(row => {
      const date = row[currentMapping.orderDate];
      const amount = row[currentMapping.settlementAmount];
      return date && !isNaN(new Date(date).getTime()) && !isNaN(parseFloat(amount));
    });

    if (validRows.length === 0) {
      toast.error("没有找到有效的订单数据，请检查字段映射");
      return;
    }

    if (validRows.length < uploadedData.length) {
      toast.warning(`${uploadedData.length - validRows.length} 条数据存在问题，将被忽略`);
    }

    onDataUpload(validRows, currentMapping);
  };

  const availableFields = uploadedData.length > 0 ? Object.keys(uploadedData[0]) : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            上传TikTok Payout数据
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="payoutFile">选择Excel文件</Label>
            <Input
              id="payoutFile"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              ref={fileInputRef}
            />
            <p className="text-sm text-muted-foreground mt-1">
              支持从TikTok导出的.xlsx或.xls格式文件
            </p>
          </div>

          {uploadedData.length > 0 && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                已成功读取 {uploadedData.length} 条订单记录
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {uploadedData.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>字段映射</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>订单创建日期字段 *</Label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={currentMapping.orderDate}
                    onChange={(e) => setCurrentMapping(prev => ({ ...prev, orderDate: e.target.value }))}
                  >
                    <option value="">选择日期字段</option>
                    {availableFields.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>结算金额字段 *</Label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={currentMapping.settlementAmount}
                    onChange={(e) => setCurrentMapping(prev => ({ ...prev, settlementAmount: e.target.value }))}
                  >
                    <option value="">选择金额字段</option>
                    {availableFields.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {showPreview ? '隐藏' : '显示'}数据预览
                </Button>
                <Button 
                  onClick={validateAndConfirm}
                  disabled={!currentMapping.orderDate || !currentMapping.settlementAmount}
                  className="flex-1"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  确认数据并继续
                </Button>
              </div>
            </CardContent>
          </Card>

          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle>数据预览 (前10行)</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 w-full border rounded">
                  <div className="min-w-max">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          {availableFields.slice(0, 8).map((field) => (
                            <th key={field} className="p-2 text-left border-r whitespace-nowrap">
                              {field}
                              {field === currentMapping.orderDate && (
                                <span className="ml-1 text-blue-600">(日期)</span>
                              )}
                              {field === currentMapping.settlementAmount && (
                                <span className="ml-1 text-green-600">(金额)</span>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {uploadedData.slice(0, 10).map((row, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            {availableFields.slice(0, 8).map((field) => (
                              <td key={field} className="p-2 border-r whitespace-nowrap">
                                {row[field]?.toString() || ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
                <p className="text-sm text-muted-foreground mt-2">
                  显示前8列和前10行数据
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default DataUploadSection;
