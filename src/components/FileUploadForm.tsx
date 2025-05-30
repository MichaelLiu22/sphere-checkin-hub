
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExternalLink, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client.ts";

type FileType = "nda" | "w9" | "employment";

const FileUploadForm: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [fullLegalName, setFullLegalName] = useState("");
  const [files, setFiles] = useState<{ [key in FileType]?: File }>({});
  const [isUploading, setIsUploading] = useState<{ [key in FileType]?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<{ [key in FileType]?: string }>({});

  // 文件变更处理函数
  const handleFileChange = (type: FileType, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // 检查文件是否是PDF
      if (file.type !== "application/pdf") {
        toast({
          title: t("uploadError"),
          description: t("pdfOnly"),
          variant: "destructive",
        });
        return;
      }
      
      setFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  // 上传单个文件的处理函数
  const handleUpload = async (type: FileType) => {
    const file = files[type];
    if (!file || !fullLegalName) {
      toast({
        title: t("uploadError"),
        description: t("nameRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsUploading(prev => ({ ...prev, [type]: true }));

    try {
      // 生成唯一文件名
      const fileName = `${fullLegalName}_${type}.pdf`;
      
      // 上传到Supabase存储
      const { data, error } = await supabase.storage
          .from("pdffileupload")
          .upload(`uploads/${fileName}`, file, {
            contentType: "application/pdf",
            upsert: true,
          });

      setIsUploading(prev => ({ ...prev, [type]: false }));

      if (error || !data) {
        toast({
          title: t("uploadError"),
          description: error?.message || "Unknown error",
          variant: "destructive",
        });
        return;
      }

      // 获取公共URL
      const publicUrlResponse = supabase
          .storage
          .from("pdffileupload")
          .getPublicUrl(`uploads/${fileName}`);

      const publicUrl = publicUrlResponse.data.publicUrl;
      
      // 存储上传的URL
      setUploadedUrls(prev => ({ ...prev, [type]: publicUrl }));

      toast({
        title: t("uploadSuccess"),
        description: `${t("fileUploaded")}`,
      });

    } catch (error: any) {
      setIsUploading(prev => ({ ...prev, [type]: false }));
      console.error("Upload failed:", error);
      toast({
        title: t("uploadError"),
        description: error?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  // 姓名变更处理函数
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullLegalName(e.target.value);
  };

  // 表单提交处理函数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullLegalName) {
      toast({
        title: t("formError"),
        description: t("requiredFields"),
        variant: "destructive",
      });
      return;
    }

    if (!files.w9) {
      toast({
        title: t("formError"),
        description: t("w9Required"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 如果文件还未上传，则先上传
      if (!uploadedUrls.w9 && files.w9) await handleUpload("w9");
      if (!uploadedUrls.nda && files.nda) await handleUpload("nda");
      if (!uploadedUrls.employment && files.employment) await handleUpload("employment");
      
      // 提交表单数据到Supabase
      const { data, error } = await supabase
        .from("spherecheckin")
        .insert([{
          full_legal_name: fullLegalName,
          w9_file: uploadedUrls.w9,
          nda_file: uploadedUrls.nda
        }]);
        
      if (error) throw error;

      toast({
        title: t("submissionSuccess"),
        description: t("submissionEmailSent"),
      });

      // 重置表单
      setFullLegalName("");
      setFiles({});
      setUploadedUrls({});
      
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: t("submissionError"),
        description: error?.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("uploadTitle")}</CardTitle>
        <CardDescription>{t("uploadSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="full-legal-name" className="font-medium">
              {t("fullLegalName")}
            </Label>
            <Input 
              id="full-legal-name"
              value={fullLegalName}
              onChange={handleNameChange}
              required
              placeholder={t("fullLegalNamePlaceholder")}
            />
          </div>

          {/* W9 Upload Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-medium">
                {t("uploadW9")} ({t("required")})
              </Label>
              <Button
                variant="link"
                className="flex items-center gap-1 text-primary hover:text-primary/80"
                asChild
              >
                <a 
                  href="https://www.irs.gov/pub/irs-pdf/fw9.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4" />
                  {t("downloadW9")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="w9-upload"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange("w9", e)}
                className="hidden"
              />
              <Label
                htmlFor="w9-upload"
                className="cursor-pointer flex-1 px-4 py-2 border border-dashed rounded-md border-gray-300 hover:border-gray-400 transition-colors text-center"
              >
                {files.w9 ? files.w9.name : t("choosePdfFile")}
              </Label>
              <Button 
                type="button"
                onClick={() => handleUpload("w9")} 
                disabled={!files.w9 || isUploading.w9 || !fullLegalName}
              >
                {isUploading.w9 ? t("uploading") : t("uploadButton")}
              </Button>
            </div>
            {uploadedUrls.w9 && <p className="text-sm text-green-600">✓ 文件已上传</p>}
          </div>

          {/* NDA Upload Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-medium">
                {t("uploadNDA")}
              </Label>
              <Button
                variant="link"
                className="flex items-center gap-1 text-primary hover:text-primary/80"
                asChild
              >
                <a 
                  href="/nda-template.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4" />
                  {t("downloadNDA")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="nda-upload"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange("nda", e)}
                className="hidden"
              />
              <Label
                htmlFor="nda-upload"
                className="cursor-pointer flex-1 px-4 py-2 border border-dashed rounded-md border-gray-300 hover:border-gray-400 transition-colors text-center"
              >
                {files.nda ? files.nda.name : t("choosePdfFile")}
              </Label>
              <Button 
                type="button"
                onClick={() => handleUpload("nda")} 
                disabled={!files.nda || isUploading.nda || !fullLegalName}
              >
                {isUploading.nda ? t("uploading") : t("uploadButton")}
              </Button>
            </div>
            {uploadedUrls.nda && <p className="text-sm text-green-600">✓ 文件已上传</p>}
          </div>

          {/* Employment Agreement Upload Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-medium">
                {t("uploadEmployment")}
              </Label>
              <Button
                variant="link"
                className="flex items-center gap-1 text-primary hover:text-primary/80"
                asChild
              >
                <a 
                  href="/employment-agreement.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4" />
                  {t("downloadEmployment")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="employment-upload"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange("employment", e)}
                className="hidden"
              />
              <Label
                htmlFor="employment-upload"
                className="cursor-pointer flex-1 px-4 py-2 border border-dashed rounded-md border-gray-300 hover:border-gray-400 transition-colors text-center"
              >
                {files.employment ? files.employment.name : t("choosePdfFile")}
              </Label>
              <Button 
                type="button"
                onClick={() => handleUpload("employment")} 
                disabled={!files.employment || isUploading.employment || !fullLegalName}
              >
                {isUploading.employment ? t("uploading") : t("uploadButton")}
              </Button>
            </div>
            {uploadedUrls.employment && <p className="text-sm text-green-600">✓ 文件已上传</p>}
          </div>

          <Button 
            type="submit" 
            className="w-full mt-4" 
            disabled={isSubmitting || !fullLegalName || !files.w9}
          >
            {isSubmitting ? t("submitting") : t("submitForms")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FileUploadForm;
