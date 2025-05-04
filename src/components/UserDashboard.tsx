import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface File {
  id: string;
  name: string;
  description: string;
  file_type: 'pre' | 'regular';
  file_url: string;
  created_at: string;
}

const UserDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('files')
        .select('*')
        .or(`file_type.eq.pre,file_type.eq.regular`);

      if (error) throw error;
      setFiles(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const preFiles = files.filter(file => file.file_type === 'pre');
  const regularFiles = files.filter(file => file.file_type === 'regular');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("preFiles")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">{t("processing")}</div>
          ) : preFiles.length > 0 ? (
            <div className="space-y-4">
              {preFiles.map(file => (
                <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{file.name}</h3>
                    <p className="text-sm text-muted-foreground">{file.description}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      {t("downloadFile")}
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              {t("noFilesFound")}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("regularFiles")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">{t("processing")}</div>
          ) : regularFiles.length > 0 ? (
            <div className="space-y-4">
              {regularFiles.map(file => (
                <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{file.name}</h3>
                    <p className="text-sm text-muted-foreground">{file.description}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      {t("downloadFile")}
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              {t("noFilesFound")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard; 