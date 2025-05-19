
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "../utils";

interface UseEmployeeDataProps {
  isAdmin: boolean;
}

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
        // For admin, fetch all employees
        if (isAdmin) {
          const { data: employeesData, error: employeesError } = await supabase
            .from("users")
            .select("id, full_name, department_id")
            .neq("id", user.id) // Exclude current user
            .order("full_name");

          if (employeesError) throw employeesError;
          setAllEmployees(employeesData || []);
        } else {
          // For regular users with task permission, fetch department users
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

          // Get all employees in the same department
          const { data: departmentData, error: deptError } = await supabase
            .from("users")
            .select("id, full_name, department_id")
            .eq("department_id", userData.department_id)
            .neq("id", user.id) // Exclude current user
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
