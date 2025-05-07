
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Interface definition for database W9 records
interface W9Record {
  full_legal_name: string;
  created_at: string;
  w9_file: string;
}

// Interface for storage files
interface StorageFile {
  name: string;
  created_at: string;
  url: string;
}

const W9FilesPanel: React.FC = () => {
  const { t } = useLanguage();
  
  const [w9Files, setW9Files] = useState<W9Record[]>([]);
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>([]);
  const [w9Loading, setW9Loading] = useState(true);

  useEffect(() => {
    // Fetch both database records and storage files
    fetchW9Files();
    fetchStorageW9Files();
  }, []);

  // Fetch records from SphereCheckIN table
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

  // Fetch files directly from storage bucket
  const fetchStorageW9Files = async () => {
    try {
      // List all files in the uploads folder of pdffileupload bucket
      const { data, error } = await supabase.storage
        .from('pdffileupload')
        .list('uploads', {
          sortBy: { column: 'created_at', order: 'desc' }
        });
      
      if (error) throw error;
      
      // Filter only W9 files (files with w9 in their name)
      const w9Files = data
        .filter(file => file.name.toLowerCase().includes('w9'))
        .map(file => ({
          name: file.name.replace(/_w9\.pdf$/, ''),  // Extract user name from filename
          created_at: file.created_at,
          url: supabase.storage.from('pdffileupload').getPublicUrl(`uploads/${file.name}`).data.publicUrl
        }));
      
      console.log("Storage W9 files:", w9Files);
      setStorageFiles(w9Files);
    } catch (error: any) {
      console.error("Error fetching storage W9 files:", error);
      toast.error(`Error fetching storage W9 files: ${error.message}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Determine if we need to show the combined table
  const hasFiles = w9Files.length > 0 || storageFiles.length > 0;

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
            ) : hasFiles ? (
              <>
                {/* Show database records */}
                {w9Files.map((record, index) => (
                  <TableRow key={`db-w9-${index}`}>
                    <TableCell>{record.full_legal_name}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <a href={record.w9_file} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2" size={16} />
                          {t("download")} (DB)
                        </a>
                      </Button>
                    </TableCell>
                    <TableCell>{formatDate(record.created_at)}</TableCell>
                  </TableRow>
                ))}
                
                {/* Show storage files */}
                {storageFiles.map((file, index) => (
                  <TableRow key={`storage-w9-${index}`}>
                    <TableCell>{file.name}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2" size={16} />
                          {t("download")} (Storage)
                        </a>
                      </Button>
                    </TableCell>
                    <TableCell>{formatDate(file.created_at)}</TableCell>
                  </TableRow>
                ))}
              </>
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
