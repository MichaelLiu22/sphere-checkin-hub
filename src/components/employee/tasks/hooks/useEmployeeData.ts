
/**
 * 员工数据获取钩子
 * 根据用户权限获取可分配任务的员工列表
 */
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "../utils";

interface UseEmployeeDataProps {
  isAdmin: boolean; // 是否为管理员，决定获取所有员工还是仅同部门员工
}

/**
 * 员工数据获取钩子
 * 管理员可查看所有员工，普通用户只能查看同部门员工
 * 
 * @param {UseEmployeeDataProps} options - 钩子配置选项
 * @returns {Object} 员工列表和加载状态
 */
export const useEmployeeData = ({ isAdmin }: UseEmployeeDataProps) => {
  const { user } = useAuth();
  const [departmentEmployees, setDepartmentEmployees] = useState<User[]>([]);
  const [allEmployees, setAllEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!user) return;
      setLoading(true);

      try {
        // 管理员获取所有员工
        if (isAdmin) {
          const { data: employeesData, error: employeesError } = await supabase
            .from("users")
            .select("id, full_name, department_id")
            .neq("id", user.id) // 排除当前用户
            .order("full_name");

          if (employeesError) throw employeesError;
          setAllEmployees(employeesData || []);
        } else {
          // 普通有任务权限的员工只能获取同部门员工
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("department_id")
            .eq("id", user.id)
            .single();

          if (userError) throw userError;

          if (!userData.department_id) {
            console.log("User has no department assigned");
            return;
          }

          // 获取同部门的所有员工
          const { data: departmentData, error: deptError } = await supabase
            .from("users")
            .select("id, full_name, department_id")
            .eq("department_id", userData.department_id)
            .neq("id", user.id) // 排除当前用户
            .order("full_name");

          if (deptError) throw deptError;
          setDepartmentEmployees(departmentData || []);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("获取员工列表失败");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [user, isAdmin]);

  return {
    departmentEmployees,
    allEmployees,
    loading,
  };
};
