import React, { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FileSubmission {
  id: string;
  full_legal_name: string;
  submitted_at: string;
  w9_file: { url: string };
  nda_file: { url: string };
}

const AdminDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const [submissions, setSubmissions] = useState<FileSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setError(null);
      console.log("开始获取文件列表...");
      
      // 首先检查存储桶是否存在
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();

      if (bucketsError) {
        console.error("获取存储桶列表失败:", bucketsError);
        setError("无法访问存储桶");
        return;
      }

      console.log("可用的存储桶:", buckets);

      // 获取存储桶中的所有文件
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

      // 处理文件列表，将相同用户名的文件组合在一起
      const submissionsMap = new Map<string, FileSubmission>();
      
      for (const file of files) {
        try {
          console.log("处理文件:", file.name);
          const fileName = file.name;
          const [fullLegalName, fileType] = fileName.split("_");
          const fileTypeWithoutExt = fileType.replace(".pdf", "");
          
          // 获取文件的公共URL
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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString(language, options);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 animate-fade-in">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t("adminDashboardTitle")}</CardTitle>
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
                    <TableCell colSpan={4} className="text-center py-6">加载中...</TableCell>
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
                          <span className="text-muted-foreground">未上传</span>
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
                          <span className="text-muted-foreground">未上传</span>
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
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <a href="/">{t("backToHome")}</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
