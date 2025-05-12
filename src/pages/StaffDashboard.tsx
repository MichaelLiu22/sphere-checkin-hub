
import React from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const StaffDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          <Button variant="outline" onClick={logout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-lg">{user.full_name}</p>
                  <p className="text-muted-foreground capitalize">{user.user_type}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm font-medium">Feature Assignment:</p>
                <p className="text-lg font-semibold mt-1">
                  {user.feature || "No feature assigned"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Feature Information</CardTitle>
            </CardHeader>
            <CardContent>
              {user.feature ? (
                <div>
                  <p>You are assigned to: <strong>{user.feature}</strong></p>
                  <p className="mt-4">
                    This section will display content relevant to your assigned feature.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>You haven't been assigned any feature yet.</p>
                  <p>Please contact your administrator for feature assignment.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default StaffDashboard;
