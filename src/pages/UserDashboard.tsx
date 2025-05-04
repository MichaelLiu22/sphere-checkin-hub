import React, { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface FileRecord {
  id: string;
  name: string;
  description: string;
  file_type: "pre" | "regular";
  file_url: string;
  created_at: string;
}

const UserDashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const preFiles = files.filter(file => file.file_type === "pre");
  const regularFiles = files.filter(file => file.file_type === "regular");

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("userDashboard")}</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("logout")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("preFiles")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>{t("loading")}</p>
          ) : preFiles.length === 0 ? (
            <p>{t("noFilesFound")}</p>
          ) : (
            <div className="space-y-4">
              {preFiles.map((file) => (
                <Card key={file.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{file.name}</h3>
                        <p className="text-sm text-gray-500">{file.description}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2" size={16} />
                          {t("download")}
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
            <p>{t("loading")}</p>
          ) : regularFiles.length === 0 ? (
            <p>{t("noFilesFound")}</p>
          ) : (
            <div className="space-y-4">
              {regularFiles.map((file) => (
                <Card key={file.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{file.name}</h3>
                        <p className="text-sm text-gray-500">{file.description}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2" size={16} />
                          {t("download")}
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard; 