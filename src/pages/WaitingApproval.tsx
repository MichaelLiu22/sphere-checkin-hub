
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * 等待审批页面
 * 用户注册后显示等待管理员审核的信息
 */
const WaitingApproval: React.FC = () => {
  const location = useLocation();
  const { username } = location.state || { username: "用户" };

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">等待管理员审核</CardTitle>
          <CardDescription className="text-center">
            您的账号正在等待管理员审核
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-center text-lg">
              <span className="font-semibold">{username}</span>，您已成功注册！
            </p>
            <p className="text-center mt-2">
              您的账号需要管理员审核后才能使用。审核通过后，您将收到通知。
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">注意事项：</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>审核过程通常需要1-2个工作日</li>
              <li>审核通过后，您可以使用您的用户名和密码登录系统</li>
              <li>如有疑问，请联系系统管理员</li>
            </ul>
          </div>
          
          <div className="text-center pt-4">
            <Link to="/">
              <Button variant="outline">返回登录页</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitingApproval;
