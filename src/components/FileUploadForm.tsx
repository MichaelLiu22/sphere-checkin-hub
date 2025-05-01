
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExternalLink } from "lucide-react";

type FileType = "w9" | "nda";

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
        description: `${type === "w9" ? t("uploadW9") : t("uploadNDA")}: ${files[type]?.name}`,
      });
      
      setIsUploading(prev => ({ ...prev, [type]: false }));
    }, 1500);
    
    // In a real implementation, you would handle the actual file upload here
    // Example: const response = await uploadFile(files[type], type);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullLegalName(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullLegalName || !files.w9) {
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
      // This is where you would typically send the data to your backend
      // which would then send the email notification
      console.log("Submission data:", {
        full_legal_name: fullLegalName,
        w9_file: files.w9,
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

    // In a real implementation with Supabase integration:
    // 1. Upload files to Supabase storage
    // 2. Get the URLs for the uploaded files
    // 3. Create a record in a 'submissions' table with the name and file URLs
    // 4. Trigger a serverless function to send the email notification
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
              <Label htmlFor="w9-upload" className="font-medium">
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
                disabled={!files.w9 || isUploading.w9}
              >
                {isUploading.w9 ? t("uploading") : t("uploadButton")}
              </Button>
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
