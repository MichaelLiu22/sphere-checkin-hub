
import React from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

const GuestPage: React.FC = () => {
  const { logout } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Guest Access</h1>
          <Button variant="outline" onClick={logout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Guest</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is a limited access area for guest users.</p>
            <p className="mt-4">
              You currently have visitor access. If you need additional permissions, 
              please contact an administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default GuestPage;
