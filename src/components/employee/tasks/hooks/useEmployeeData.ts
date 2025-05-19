
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '../utils';

export const useEmployeeData = (isAdmin: boolean = false, departmentId?: string) => {
  const [allEmployees, setAllEmployees] = useState<User[]>([]);
  const [departmentEmployees, setDepartmentEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Fetch all employees (for admins)
        if (isAdmin) {
          const { data: allData, error: allError } = await supabase
            .from('users')
            .select('id, full_name, user_type, department_id, enabled_modules')
            .order('full_name');

          if (allError) throw allError;
          setAllEmployees(allData || []);
        }

        // Fetch department-specific employees
        if (departmentId) {
          const { data: deptData, error: deptError } = await supabase
            .from('users')
            .select('id, full_name, user_type, department_id, enabled_modules')
            .eq('department_id', departmentId)
            .order('full_name');

          if (deptError) throw deptError;
          setDepartmentEmployees(deptData || []);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [isAdmin, departmentId]);

  return { allEmployees, departmentEmployees, loading };
};

export default useEmployeeData;
