import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DocumentUpload: React.FC = () => {
  const { t } = useLanguage();
  const [fullLegalName, setFullLegalName] = useState("");
  const [w9File, setW9File] = useState<File | null>(null);
  const [ndaFile, setNdaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleW9Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setW9File(e.target.files[0]);
    }
  };

  const handleNDAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNdaFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullLegalName || !w9File || !ndaFile) {
      toast.error(t("uploadError"));
      return;
    }

    setLoading(true);
    try {
      // 上传 W9 文件
      const w9FileName = `${fullLegalName}_w9.pdf`;
      const { error: w9Error } = await supabase.storage
        .from("pdffileupload")
        .upload(`uploads/${w9FileName}`, w9File);

      if (w9Error) throw w9Error;

      // 上传 NDA 文件
      const ndaFileName = `${fullLegalName}_nda.pdf`;
      const { error: ndaError } = await supabase.storage
        .from("pdffileupload")
        .upload(`uploads/${ndaFileName}`, ndaFile);

      if (ndaError) throw ndaError;

      toast.success(t("uploadSuccess"));
      setFullLegalName("");
      setW9File(null);
      setNdaFile(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(t("uploadError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullLegalName" className="block text-sm font-medium mb-1">
          {t("fullLegalName")}
        </label>
        <Input
          id="fullLegalName"
          value={fullLegalName}
          onChange={(e) => setFullLegalName(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="w9File" className="block text-sm font-medium mb-1">
          {t("uploadW9")}
        </label>
        <Input
          id="w9File"
          type="file"
          accept=".pdf"
          onChange={handleW9Change}
          required
        />
      </div>

      <div>
        <label htmlFor="ndaFile" className="block text-sm font-medium mb-1">
          {t("uploadNDA")}
        </label>
        <Input
          id="ndaFile"
          type="file"
          accept=".pdf"
          onChange={handleNDAChange}
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? t("uploading") : t("upload")}
      </Button>
    </form>
  );
};

export default DocumentUpload; 