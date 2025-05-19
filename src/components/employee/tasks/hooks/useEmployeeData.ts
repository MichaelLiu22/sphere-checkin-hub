
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../utils";

interface UseEmployeeDataReturn {
  allEmployees: User[];
  departmentEmployees: User[];
  loading: boolean;
}

const useEmployeeData = (
  isAdmin = false,
  departmentId?: string
): UseEmployeeDataReturn => {
  const [allEmployees, setAllEmployees] = useState<User[]>([]);
  const [departmentEmployees, setDepartmentEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          // 管理员可以看到所有员工
          const { data: allUsers, error } = await supabase
            .from("users")
            .select("id, full_name, department_id, user_type")
            .order("full_name");

          if (error) throw error;
          setAllEmployees(allUsers);
        }

        // 获取部门员工（对于管理员和部门主管）
        if (departmentId) {
          const { data: deptUsers, error: deptError } = await supabase
            .from("users")
            .select("id, full_name, department_id, user_type")
            .eq("department_id", departmentId)
            .order("full_name");

          if (deptError) throw deptError;
          setDepartmentEmployees(deptUsers);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [isAdmin, departmentId]);

  return { allEmployees, departmentEmployees, loading };
};

export default useEmployeeData;
