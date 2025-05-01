
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExternalLink } from "lucide-react";

type FileType = "nda";

const FileUploadForm: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [fullLegalName, setFullLegalName] = useState("");
  const [files, setFiles] = useState<{ [key in FileType]?: File }>({});
  const [isUploading, setIsUploading] = useState<{ [key in FileType]?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (type: FileType, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Check if file is PDF
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

  const handleUpload = async (type: FileType) => {
    if (!files[type]) return;
    
    setIsUploading(prev => ({ ...prev, [type]: true }));
    
    // Simulate upload with timeout
    setTimeout(() => {
      toast({
        title: t("uploadSuccess"),
        description: `${type === "nda" ? t("uploadNDA") : ""}: ${files[type]?.name}`,
      });
      
      setIsUploading(prev => ({ ...prev, [type]: false }));
    }, 1500);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullLegalName(e.target.value);
  };

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

    setIsSubmitting(true);

    // Simulate form submission and email notification
    setTimeout(() => {
      console.log("Submission data:", {
        full_legal_name: fullLegalName,
        w9_link: "https://www.irs.gov/pub/irs-pdf/fw9.pdf",
        nda_file: files.nda,
      });

      toast({
        title: t("submissionSuccess"),
        description: t("submissionEmailSent"),
      });

      // Reset form
      setFullLegalName("");
      setFiles({});
      setIsSubmitting(false);
    }, 2000);
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-medium">
                {t("uploadW9")}
              </Label>
              <a 
                href="https://www.irs.gov/pub/irs-pdf/fw9.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-sm text-primary hover:underline"
              >
                {t("downloadW9")} <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nda-upload" className="font-medium">
              {t("uploadNDA")}
            </Label>
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
                disabled={!files.nda || isUploading.nda}
              >
                {isUploading.nda ? t("uploading") : t("uploadButton")}
              </Button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full mt-4" 
            disabled={isSubmitting || !fullLegalName}
          >
            {isSubmitting ? t("submitting") : t("submitForms")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FileUploadForm;
