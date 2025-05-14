
// 此文件由系统自动生成，请勿直接编辑。
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Supabase项目URL
 * 用于连接到特定的Supabase实例
 */
const SUPABASE_URL = "https://ruretfzgoetshyjeqwhl.supabase.co";

/**
 * Supabase可公开密钥
 * 用于以匿名或公共用户身份进行API调用
 */
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1cmV0Znpnb2V0c2h5amVxd2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MTMyMTQsImV4cCI6MjA2MTM4OTIxNH0.Ep_sqfgzsqIPkksx0OgS1c32Z3_TmeW-oXQzzAVumjI";

/**
 * 导入Supabase客户端的示例：
 * import { supabase } from "@/integrations/supabase/client";
 */

/**
 * 创建并导出Supabase客户端实例
 * 使用项目URL和公开密钥初始化，并通过类型参数提供类型安全
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
