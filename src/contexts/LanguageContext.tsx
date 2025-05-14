
import React, { createContext, useContext, useState } from "react";
import { translations } from "@/i18n/translations";

// 定义翻译键类型
type TranslationKey = string;

// 定义支持的语言类型
type Language = "en" | "zh" | "es";

/**
 * 语言上下文类型接口定义
 * 包含当前语言、设置语言的方法和翻译函数
 */
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
}

/**
 * 获取浏览器语言
 * 如果浏览器语言是支持的语言，则使用它，否则默认为英语
 * @returns {Language} 返回支持的语言代码
 */
const getBrowserLanguage = (): Language => {
  const lang = navigator.language.split("-")[0];
  return (lang === "zh" || lang === "es") ? lang as Language : "en";
};

// 创建语言上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * 语言提供者组件
 * 提供语言选择和翻译功能
 * @param {object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 */
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 语言状态管理，初始使用浏览器语言
  const [language, setLanguage] = useState<Language>(getBrowserLanguage());

  /**
   * 翻译函数
   * 根据当前语言和键值获取翻译文本
   * 
   * @param {TranslationKey} key - 翻译键值
   * @param {Record<string, string>} params - 可选的参数，用于替换文本中的占位符
   * @returns {string} 翻译后的文本
   */
  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    // 获取当前语言的翻译，如果不存在则回退到英语翻译，如果都不存在则使用键值本身
    let text = translations[language]?.[key] || translations.en?.[key] || key;
    
    // 替换文本中的参数（如果存在）
    if (params) {
      Object.keys(params).forEach(param => {
        text = text.replace(`{{${param}}}`, params[param] || '');
      });
    }
    
    return text;
  };

  // 提供语言上下文给子组件
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * 使用语言上下文的钩子函数
 * 提供对当前语言和翻译功能的访问
 * 
 * @returns {LanguageContextType} 语言上下文
 * @throws {Error} 如果在LanguageProvider外部使用则抛出错误
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
