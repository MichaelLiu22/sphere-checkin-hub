import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import DocumentUpload from "@/components/DocumentUpload";
import UserAuth from "@/components/UserAuth";

const Home: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">{t("welcome")}</h1>
        <p className="text-xl text-gray-600">{t("welcomeDescription")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("documentUpload")}</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentUpload />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("userLogin")}</CardTitle>
          </CardHeader>
          <CardContent>
            <UserAuth />
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-8">
        <Link to="/admin">
          <Button variant="outline" size="lg">
            {t("adminLogin")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Home; 