
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Interface definition
interface W9Record {
  full_legal_name: string;
  created_at: string;
  w9_file: string;
}

const W9FilesPanel: React.FC = () => {
  const { t } = useLanguage();
  
  const [w9Files, setW9Files] = useState<W9Record[]>([]);
  const [w9Loading, setW9Loading] = useState(true);

  useEffect(() => {
    fetchW9Files();
  }, []);

  const fetchW9Files = async () => {
    setW9Loading(true);
    try {
      // Fetch directly from SphereCheckIN table where w9_file IS NOT NULL
      const { data, error } = await supabase
        .from('SphereCheckIN')
        .select('full_legal_name, created_at, w9_file')
        .not('w9_file', 'is', null)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      console.log("W9 files data:", data);
      setW9Files(data || []);
    } catch (error: any) {
      console.error("Error fetching W9 files:", error);
      toast.error(`Error fetching W9 files: ${error.message}`);
    } finally {
      setW9Loading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Card className="h-full">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-blue-600" />
          所有用户提交的W9表格
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("fullLegalName")}</TableHead>
              <TableHead>W9 {t("file")}</TableHead>
              <TableHead>{t("submittedAt")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {w9Loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6">{t("loading")}</TableCell>
              </TableRow>
            ) : w9Files.length > 0 ? (
              w9Files.map((record, index) => (
                <TableRow key={`w9-${index}`}>
                  <TableCell>{record.full_legal_name}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <a href={record.w9_file} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2" size={16} />
                        {t("download")}
                      </a>
                    </Button>
                  </TableCell>
                  <TableCell>{formatDate(record.created_at)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6">No W9 files found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default W9FilesPanel;
