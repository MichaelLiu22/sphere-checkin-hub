import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Layout from "@/components/Layout";
import UserSidebar from "@/components/user/UserSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const UserDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div>{t("loading")}...</div>;
  }

  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">{t("userDashboard")}</h2>
            {/* Overview content */}
            <p>Welcome to your user dashboard, {user.full_name}!</p>
          </div>
        );
      case "host_schedule":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Host Schedule</h2>
            {/* Host schedule content */}
          </div>
        );
      case "finance":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Finance</h2>
            {/* Finance content */}
          </div>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <Layout>
      <SidebarProvider>
        <div className="flex w-full min-h-screen">
          <aside className="sticky top-0 h-screen">
            <UserSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </aside>
          <main className="flex-1 bg-gray-50">
            {renderContent()}
          </main>
        </div>
      </SidebarProvider>
    </Layout>
  );
};

export default UserDashboard;
