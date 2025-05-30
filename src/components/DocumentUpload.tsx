
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
      // Upload W9 file
      const w9FileName = `${fullLegalName}_w9.pdf`;
      const { error: w9Error } = await supabase.storage
        .from("pdffileupload")
        .upload(`uploads/${w9FileName}`, w9File);

      if (w9Error) throw w9Error;

      // Get public URL for W9
      const w9PublicUrl = supabase
        .storage
        .from("pdffileupload")
        .getPublicUrl(`uploads/${w9FileName}`).data.publicUrl;

      // Upload NDA file
      const ndaFileName = `${fullLegalName}_nda.pdf`;
      const { error: ndaError } = await supabase.storage
        .from("pdffileupload")
        .upload(`uploads/${ndaFileName}`, ndaFile);

      if (ndaError) throw ndaError;

      // Get public URL for NDA
      const ndaPublicUrl = supabase
        .storage
        .from("pdffileupload")
        .getPublicUrl(`uploads/${ndaFileName}`).data.publicUrl;

      // Update the spherecheckin table with both files
      const { error: sphereError } = await supabase
        .from("spherecheckin")
        .upsert({
          full_legal_name: fullLegalName,
          w9_file: w9PublicUrl,
          nda_file: ndaPublicUrl
        });

      if (sphereError) throw sphereError;

      // Update or find the user in users table by full_name
      const { data: userData, error: userLookupError } = await supabase
        .from("users")
        .select("id")
        .eq("full_name", fullLegalName)
        .maybeSingle();

      if (userLookupError) throw userLookupError;

      if (userData) {
        // Update existing user with file URL in notes
        const { error: userUpdateError } = await supabase
          .from("users")
          .update({ 
            notes: `W9 File URL: ${w9PublicUrl}` 
          })
          .eq("id", userData.id);

        if (userUpdateError) throw userUpdateError;
      } else {
        // User does not exist yet, create a new record
        const { error: userCreateError } = await supabase
          .from("users")
          .insert({ 
            full_name: fullLegalName,
            notes: `W9 File URL: ${w9PublicUrl}`,
            password_hash: "temporary"
          });

        if (userCreateError) throw userCreateError;
      }

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
