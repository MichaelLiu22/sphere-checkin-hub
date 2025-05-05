
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import FileUploadForm from "@/components/FileUploadForm";
import UserAuth from "@/components/UserAuth";
import PayrollCalendar from "@/components/PayrollCalendar";
import PayrollInfo from "@/components/PayrollInfo";
import Layout from "@/components/Layout";

const Home: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Michael Studio Check-in System</h1>
          <p className="text-xl text-gray-600 mb-4">Sphere Media Inc.</p>
          <p className="text-lg text-gray-600">{t("welcomeDescription")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("documentUpload")}</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUploadForm />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t("payrollInfoTitle")}</CardTitle>
              </CardHeader>
              <CardContent>
                <PayrollInfo />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("userAuthentication")}</CardTitle>
              </CardHeader>
              <CardContent>
                <UserAuth />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t("calendar")}</CardTitle>
              </CardHeader>
              <CardContent>
                <PayrollCalendar />
              </CardContent>
            </Card>

            <div className="text-center">
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
