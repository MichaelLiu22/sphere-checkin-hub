
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, FileText, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ProductReportHistory from "./product-report/ProductReportHistory";
import ProductReportPreview from "./product-report/ProductReportPreview";
import ProductSuggestions from "./product-report/ProductSuggestions";

interface ProductReportData {
  id: string;
  product_name: string;
  report_data: any;
  pdf_url: string | null;
  created_at: string;
}

const ProductReportPanel: React.FC = () => {
  const [productName, setProductName] = useState("");
  const [confirmedProductName, setConfirmedProductName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentReport, setCurrentReport] = useState<ProductReportData | null>(null);
  const [reports, setReports] = useState<ProductReportData[]>([]);
  const { user } = useAuth();

  const handleInputChange = (value: string) => {
    setProductName(value);
    setConfirmedProductName("");
    setShowSuggestions(value.length >= 2);
  };

  const handleProductSelect = (selectedProduct: string) => {
    setConfirmedProductName(selectedProduct);
    setProductName(selectedProduct);
  };

  const handleConfirmProduct = () => {
    setShowSuggestions(false);
    toast.success(`已确认产品: ${confirmedProductName}`);
  };

  const handleGenerateReport = async () => {
    const finalProductName = confirmedProductName || productName.trim();
    
    if (!finalProductName) {
      toast.error("请输入产品名称");
      return;
    }

    if (!user?.id) {
      toast.error("请先登录");
      return;
    }

    setIsGenerating(true);
    try {
      console.log("开始生成产品报告:", finalProductName);
      
      // 调用 Edge Function 生成报告
      const { data, error } = await supabase.functions.invoke('product-research', {
        body: { 
          productName: finalProductName,
          userId: user.id 
        }
      });

      if (error) {
        console.error("Edge Function 错误:", error);
        throw error;
      }

      console.log("报告生成成功:", data);
      
      // 刷新报告列表
      await fetchReports();
      
      // 设置当前报告为最新生成的
      if (data?.reportId) {
        const { data: reportData } = await supabase
          .from('product_reports')
          .select('*')
          .eq('id', data.reportId)
          .single();
        
        if (reportData) {
          setCurrentReport(reportData);
        }
      }

      toast.success("产品报告生成成功！");
      setProductName("");
      setConfirmedProductName("");
      setShowSuggestions(false);
    } catch (error: any) {
      console.error("生成报告失败:", error);
      toast.error(`生成报告失败: ${error.message || '未知错误'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchReports = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('product_reports')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      console.error("获取报告列表失败:", error);
      toast.error("获取报告列表失败");
    }
  };

  React.useEffect(() => {
    fetchReports();
  }, [user?.id]);

  const handleDownloadPDF = async (report: ProductReportData) => {
    if (!report.pdf_url) {
      toast.error("PDF文件不存在");
      return;
    }

    try {
      // 这里可以直接使用 pdf_url 进行下载
      const link = document.createElement('a');
      link.href = report.pdf_url;
      link.download = `${report.product_name}_报告.pdf`;
      link.click();
      toast.success("开始下载PDF文件");
    } catch (error) {
      console.error("下载失败:", error);
      toast.error("下载失败");
    }
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-2xl font-bold">📊 产品智能报告生成器</h2>
        <p className="text-muted-foreground mt-2">
          搜索任何产品，自动生成包含维基百科介绍、市场数据和图片的专业PDF报告
        </p>
      </div>

      {/* 搜索表单 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            生成新报告
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="输入产品名称 (例如: Jordan 1 Chicago, iPhone 15 Pro)"
                value={productName}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !showSuggestions) {
                    handleGenerateReport();
                  }
                }}
                disabled={isGenerating}
                className="flex-1"
              />
              <Button 
                onClick={handleGenerateReport}
                disabled={isGenerating || !productName.trim() || showSuggestions}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                {isGenerating ? "生成中..." : "生成报告"}
              </Button>
            </div>

            {/* 产品建议组件 */}
            <ProductSuggestions
              query={productName}
              onSelect={handleProductSelect}
              onConfirm={handleConfirmProduct}
              isVisible={showSuggestions}
            />
          </div>
          
          {isGenerating && (
            <div className="text-sm text-muted-foreground">
              正在收集产品信息... 这可能需要1-2分钟时间
            </div>
          )}

          {confirmedProductName && !showSuggestions && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
              ✓ 已确认产品: {confirmedProductName}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 当前报告预览 */}
      {currentReport && (
        <ProductReportPreview 
          report={currentReport} 
          onDownload={() => handleDownloadPDF(currentReport)}
        />
      )}

      {/* 历史报告 */}
      <ProductReportHistory 
        reports={reports}
        onReportSelect={setCurrentReport}
        onDownload={handleDownloadPDF}
        onRefresh={fetchReports}
      />
    </div>
  );
};

export default ProductReportPanel;
