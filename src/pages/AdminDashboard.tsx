
import React, { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminFileUpload from "@/components/AdminFileUpload";
import { useNavigate } from "react-router-dom";

interface FileSubmission {
  id: string;
  full_legal_name: string;
  submitted_at: string;
  w9_file: { url: string };
  nda_file: { url: string };
}

interface FileRecord {
  id: string;
  name: string;
  description: string;
  file_type: "pre" | "regular";
  file_url: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<FileSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileRecord[]>([]);
  
  useEffect(() => {
    fetchSubmissions();
    fetchFiles();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const fetchSubmissions = async () => {
    try {
      setError(null);
      console.log("开始获取文件列表...");
      
      const { data: files, error: filesError } = await supabase.storage
        .from("pdffileupload")
        .list("uploads", {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (filesError) {
        console.error("获取文件列表失败:", filesError);
        setError("无法获取文件列表");
        return;
      }

      if (!files || files.length === 0) {
        console.log("没有找到文件");
        setSubmissions([]);
        setLoading(false);
        return;
      }

      console.log("获取到的文件列表:", files);

      const submissionsMap = new Map<string, FileSubmission>();
      
      for (const file of files) {
        try {
          console.log("处理文件:", file.name);
          const fileName = file.name;
          const [fullLegalName, fileType] = fileName.split("_");
          const fileTypeWithoutExt = fileType.replace(".pdf", "");
          
          const { data: { publicUrl } } = supabase.storage
            .from("pdffileupload")
            .getPublicUrl(`uploads/${fileName}`);

          console.log("文件URL:", publicUrl);

          if (!submissionsMap.has(fullLegalName)) {
            submissionsMap.set(fullLegalName, {
              id: fullLegalName,
              full_legal_name: fullLegalName,
              submitted_at: file.created_at,
              w9_file: { url: "" },
              nda_file: { url: "" }
            });
          }

          const submission = submissionsMap.get(fullLegalName)!;
          if (fileTypeWithoutExt === "w9") {
            submission.w9_file.url = publicUrl;
          } else if (fileTypeWithoutExt === "nda") {
            submission.nda_file.url = publicUrl;
          }
        } catch (fileError) {
          console.error("处理文件时出错:", fileError);
          continue;
        }
      }

      const submissionsList = Array.from(submissionsMap.values());
      console.log("处理后的提交列表:", submissionsList);
      
      setSubmissions(submissionsList);
      setLoading(false);
    } catch (error) {
      console.error("获取文件时发生错误:", error);
      setError("获取文件时发生错误");
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the file_type to the expected type
      const typedFiles = data?.map(file => ({
        ...file,
        file_type: file.file_type as "pre" | "regular"
      })) || [];
      
      setFiles(typedFiles);
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("adminDashboard")}</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("logout")}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("employeeSubmissions")}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("fullLegalName")}</TableHead>
                <TableHead>{t("submittedAt")}</TableHead>
                <TableHead>{t("w9Form")}</TableHead>
                <TableHead>{t("ndaForm")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">{t("loading")}</TableCell>
                </TableRow>
              ) : submissions.length > 0 ? (
                submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.full_legal_name}</TableCell>
                    <TableCell>{formatDate(submission.submitted_at)}</TableCell>
                    <TableCell>
                      {submission.w9_file.url ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={submission.w9_file.url} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2" size={16} />
                            {t("download")}
                          </a>
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">{t("notUploaded")}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {submission.nda_file.url ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={submission.nda_file.url} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2" size={16} />
                            {t("download")}
                          </a>
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">{t("notUploaded")}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">{t("noSubmissions")}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("uploadFile")}</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminFileUpload />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
