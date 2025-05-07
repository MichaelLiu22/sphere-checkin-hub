import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import UserAuth from "@/components/UserAuth";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PayrollCalendar from "@/components/PayrollCalendar";
import PayrollInfo from "@/components/PayrollInfo";

const Home: React.FC = () => {
  const { t } = useLanguage();
  const [fullLegalName, setFullLegalName] = useState("");
  const [w9File, setW9File] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleW9FileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Check if file is PDF
      if (file.type !== "application/pdf") {
        toast(t("uploadError"), {
          description: t("pdfOnly"),
        });
        return;
      }
      
      setW9File(file);
    }
  };

  const handleUploadW9 = async () => {
    if (!w9File || !fullLegalName) return;

    setIsUploading(true);

    try {
      const { data, error } = await supabase.storage
        .from("pdffileupload")
        .upload(`uploads/${fullLegalName}_w9.pdf`, w9File, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (error || !data) {
        toast(t("uploadError"), {
          description: error?.message || "Unknown error",
        });
        setIsUploading(false);
        return;
      }

      // Get Public URL
      const publicUrlResponse = supabase
        .storage
        .from("pdffileupload")
        .getPublicUrl(`uploads/${fullLegalName}_w9.pdf`);

      const publicUrl = publicUrlResponse.data.publicUrl;

      // Add to SphereCheckIN table
      const { error: sphereError } = await supabase
        .from("SphereCheckIN")
        .upsert({
          full_legal_name: fullLegalName,
          w9_file: publicUrl
        });

      if (sphereError) {
        console.error("SphereCheckIN update error:", sphereError);
        toast(t("uploadError"), {
          description: sphereError?.message || "Unknown error",
        });
        setIsUploading(false);
        return;
      }

      // Create or update user in users table
      const { data: existingUser, error: findUserError } = await supabase
        .from("users")
        .select("id")
        .eq("full_name", fullLegalName)
        .maybeSingle();

      if (!findUserError) {
        if (existingUser) {
          // Update existing user
          await supabase
            .from("users")
            .update({
              notes: `W9 File URL: ${publicUrl}`
            })
            .eq("id", existingUser.id);
        } else {
          // Create new user
          await supabase
            .from("users")
            .insert({
              full_name: fullLegalName,
              notes: `W9 File URL: ${publicUrl}`,
              password_hash: "temporary" // Required field
            });
        }
      }

      toast(t("uploadSuccess"), {
        description: t("fileUploaded"),
      });

    } catch (error: any) {
      console.error("Upload failed:", error);
      toast(t("uploadError"), {
        description: error?.message || "Unknown error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullLegalName || !w9File) {
      toast(t("formError"), {
        description: t("requiredFields"),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload W9 file
      await handleUploadW9();

      // Submit form
      toast(t("submissionSuccess"), {
        description: t("submissionEmailSent"),
      });

      // Reset form
      setW9File(null);
      setIsSubmitting(false);
      
      // Do not reset the name as it might be needed for login
    } catch (error) {
      console.error("Submission error:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Michael Studio Check-in System</h1>
          <p className="text-xl text-gray-600 mb-4">Sphere Media Inc.</p>
          <p className="text-lg text-gray-600">{t("welcomeDescription")}</p>
        </div>

        {/* Main content section with two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column */}
          <div className="space-y-6">
            {/* W9 Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>{t("documentUpload")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-legal-name" className="font-medium">
                      {t("fullLegalName")}
                    </Label>
                    <Input 
                      id="full-legal-name"
                      value={fullLegalName}
                      onChange={(e) => setFullLegalName(e.target.value)}
                      required
                      placeholder={t("fullLegalNamePlaceholder")}
                    />
                  </div>

                  {/* W9 Upload Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">
                        {t("uploadW9")} ({t("required")})
                      </Label>
                      <Button
                        variant="link"
                        className="flex items-center gap-1 text-primary hover:text-primary/80"
                        asChild
                      >
                        <a 
                          href="https://www.irs.gov/pub/irs-pdf/fw9.pdf" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <span>{t("downloadW9")}</span>
                        </a>
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        id="w9-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handleW9FileChange}
                        className="hidden"
                      />
                      <Label
                        htmlFor="w9-upload"
                        className="cursor-pointer flex-1 px-4 py-2 border border-dashed rounded-md border-gray-300 hover:border-gray-400 transition-colors text-center"
                      >
                        {w9File ? w9File.name : t("choosePdfFile")}
                      </Label>
                      <Button 
                        type="button"
                        onClick={handleUploadW9} 
                        disabled={!w9File || isUploading}
                      >
                        {isUploading ? t("uploading") : t("uploadButton")}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full mt-4" 
                    disabled={isSubmitting || !fullLegalName || !w9File}
                  >
                    {isSubmitting ? t("submitting") : t("submitForms")}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* User Authentication */}
            <Card>
              <CardHeader>
                <CardTitle>{t("userAuthentication")}</CardTitle>
              </CardHeader>
              <CardContent>
                <UserAuth />
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Combined Payroll and Calendar Card */}
            <Card>
              <CardHeader>
                <CardTitle>{t("payrollInfoTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <PayrollInfo />
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-xl font-semibold mb-4">{t("calendar")}</h3>
                  <PayrollCalendar />
                </div>
              </CardContent>
            </Card>

            {/* Admin Login Button */}
            <div className="text-center mt-4">
              <Link to="/admin">
                <Button variant="outline" size="lg">
                  {t("adminLogin")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
