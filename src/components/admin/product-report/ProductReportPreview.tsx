
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, TrendingUp, Image as ImageIcon } from "lucide-react";

interface ProductReportData {
  id: string;
  product_name: string;
  report_data: any;
  pdf_url: string | null;
  created_at: string;
}

interface ProductReportPreviewProps {
  report: ProductReportData;
  onDownload: () => void;
}

const ProductReportPreview: React.FC<ProductReportPreviewProps> = ({
  report,
  onDownload
}) => {
  const reportData = report.report_data || {};
  const wikipedia = reportData.wikipedia || {};
  const stockxData = reportData.stockx || {};
  const images = reportData.images || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>📋 报告预览: {report.product_name}</CardTitle>
        {report.pdf_url && (
          <Button onClick={onDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            下载PDF
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 报告状态 */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={wikipedia.title ? "default" : "secondary"}>
            维基百科: {wikipedia.title ? "✓" : "✗"}
          </Badge>
          <Badge variant={stockxData.prices ? "default" : "secondary"}>
            市场数据: {stockxData.prices ? "✓" : "✗"}
          </Badge>
          <Badge variant={images.length > 0 ? "default" : "secondary"}>
            图片: {images.length}张
          </Badge>
        </div>

        {/* 维基百科信息 */}
        {wikipedia.title && (
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              📖 产品介绍
              {wikipedia.url && (
                <a 
                  href={wikipedia.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {wikipedia.extract || "暂无描述"}
            </p>
          </div>
        )}

        {/* 市场数据 */}
        {stockxData.prices && (
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              市场价格信息
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {stockxData.prices.current && (
                <div>
                  <div className="text-muted-foreground">当前价格</div>
                  <div className="font-semibold">${stockxData.prices.current}</div>
                </div>
              )}
              {stockxData.prices.average && (
                <div>
                  <div className="text-muted-foreground">平均价格</div>
                  <div className="font-semibold">${stockxData.prices.average}</div>
                </div>
              )}
              {stockxData.prices.highest && (
                <div>
                  <div className="text-muted-foreground">最高价格</div>
                  <div className="font-semibold">${stockxData.prices.highest}</div>
                </div>
              )}
              {stockxData.prices.lowest && (
                <div>
                  <div className="text-muted-foreground">最低价格</div>
                  <div className="font-semibold">${stockxData.prices.lowest}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 图片预览 */}
        {images.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              产品图片 ({images.length}张)
            </h4>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {images.slice(0, 6).map((image: any, index: number) => (
                <div key={index} className="aspect-square">
                  <img
                    src={image.url || image}
                    alt={`产品图片 ${index + 1}`}
                    className="w-full h-full object-cover rounded border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
            {images.length > 6 && (
              <p className="text-sm text-muted-foreground">
                还有 {images.length - 6} 张图片...
              </p>
            )}
          </div>
        )}

        {/* 生成状态 */}
        <div className="text-xs text-muted-foreground">
          报告生成时间: {new Date(report.created_at).toLocaleString('zh-CN')}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductReportPreview;
