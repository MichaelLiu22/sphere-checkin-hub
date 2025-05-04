import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FileRecord {
  id: string;
  name: string;
  description: string;
  file_type: "pre" | "regular";
  file_url: string;
  uploaded_by: string;
  created_at: string;
}

const AdminFileUpload: React.FC = () => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fileType, setFileType] = useState<"pre" | "regular">("regular");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      // 上传文件到 Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${name}.${fileExt}`;
      const filePath = `${fileType}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 获取文件URL
      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      // 创建文件记录
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          name,
          description,
          file_type: fileType,
          file_url: publicUrl,
          uploaded_by: 'admin' // 由于使用基本认证，这里直接使用 'admin'
        });

      if (dbError) throw dbError;

      toast.success(t("uploadSuccess"));
      // 重置表单
      setFile(null);
      setName("");
      setDescription("");
      setFileType("regular");
      
      // 刷新文件列表
      window.location.reload();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || t("uploadError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("uploadFile")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("fileName")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("fileDescription")}</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileType">{t("fileType")}</Label>
            <Select
              value={fileType}
              onValueChange={(value: "pre" | "regular") => setFileType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectFileType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pre">{t("preFile")}</SelectItem>
                <SelectItem value="regular">{t("regularFile")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">{t("chooseFile")}</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("uploading") : t("uploadFile")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminFileUpload; 