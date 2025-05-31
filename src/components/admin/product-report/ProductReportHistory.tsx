
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface ProductReportData {
  id: string;
  product_name: string;
  report_data: any;
  pdf_url: string | null;
  created_at: string;
}

interface ProductReportHistoryProps {
  reports: ProductReportData[];
  onReportSelect: (report: ProductReportData) => void;
  onDownload: (report: ProductReportData) => void;
  onRefresh: () => void;
}

const ProductReportHistory: React.FC<ProductReportHistoryProps> = ({
  reports,
  onReportSelect,
  onDownload,
  onRefresh
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          历史报告 ({reports.length})
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          刷新
        </Button>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>还没有生成任何报告</p>
            <p className="text-sm">输入产品名称开始生成您的第一份报告</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{report.product_name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Calendar className="h-4 w-4" />
                    {formatDistanceToNow(new Date(report.created_at), { 
                      addSuffix: true,
                      locale: zhCN 
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReportSelect(report)}
                  >
                    查看
                  </Button>
                  {report.pdf_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownload(report)}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      下载
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductReportHistory;
