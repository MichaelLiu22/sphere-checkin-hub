
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// Mock data for demonstration purposes
// In a real application, this would come from an API or database
const mockSubmissions = [
  {
    id: 1,
    full_legal_name: "John Doe",
    submitted_at: "2025-04-28T10:30:00",
    w9_file: { url: "#" },
    nda_file: { url: "#" }
  },
  {
    id: 2,
    full_legal_name: "Jane Smith",
    submitted_at: "2025-04-29T14:45:00",
    w9_file: { url: "#" },
    nda_file: { url: "#" }
  }
];

const AdminDashboard: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString(currentLanguage, options);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 animate-fade-in">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t("adminDashboardTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
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
                {mockSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.full_legal_name}</TableCell>
                    <TableCell>{formatDate(submission.submitted_at)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <a href={submission.w9_file.url} download>
                          <Download className="mr-2" size={16} />
                          {t("download")}
                        </a>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <a href={submission.nda_file.url} download>
                          <Download className="mr-2" size={16} />
                          {t("download")}
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {mockSubmissions.length === 0 && (
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
