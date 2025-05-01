import React, { createContext, useContext, useState } from "react";

type Language = "en" | "zh" | "es";

type TranslationKey =
  | "appTitle"
  | "welcomeBanner"
  | "payrollInfoTitle"
  | "payPeriods"
  | "payDays"
  | "payDayExplanation"
  | "monthEnd"
  | "payByHours"
  | "questionsContact"
  | "uploadInstructions"
  | "clockInReminder"
  | "uploadTitle"
  | "uploadSubtitle"
  | "fullLegalName"
  | "fullLegalNamePlaceholder"
  | "uploadW9"
  | "downloadW9"
  | "uploadNDA"
  | "choosePdfFile"
  | "uploadButton"
  | "uploading"
  | "submitForms"
  | "submitting"
  | "submissionSuccess"
  | "submissionEmailSent"
  | "uploadError"
  | "pdfOnly"
  | "formError"
  | "requiredFields"
  | "adminLogin"
  | "username"
  | "password"
  | "login"
  | "invalidCredentials"
  | "adminDashboardTitle"
  | "submittedAt"
  | "w9Form"
  | "ndaForm"
  | "download"
  | "noSubmissions"
  | "backToHome";

interface LanguageContextType {
  t: (key: TranslationKey) => string;
  currentLanguage: Language;
  changeLanguage: (language: Language) => void;
}

// Default to browser language if available, otherwise use English
const getBrowserLanguage = (): Language => {
  const lang = navigator.language.split("-")[0];
  return (lang === "zh" || lang === "es") ? lang as Language : "en";
};

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    appTitle: "MS Sphere Media Check In",
    welcomeBanner: "Welcome to Our TEAM!",
    payrollInfoTitle: "Payroll Information",
    payPeriods: "Pay Periods",
    payDays: "Pay Days",
    payDayExplanation: "\"Pay Day\" means you will receive the previous period's pay by the end of that day.",
    monthEnd: "Month End",
    payByHours: "Pay by hours—verify with Jocelyn.",
    questionsContact: "Questions? Contact: acctspheremedia@gmail.com",
    uploadInstructions: "You can upload PDF forms here or print and hand to Michael.",
    clockInReminder: "Please clock in/out and for lunch on time. We are not responsible for delayed payments due to missing clock records.",
    uploadTitle: "Employee Onboarding",
    uploadSubtitle: "Please complete and submit the following forms",
    fullLegalName: "We will issue the check to this name",
    fullLegalNamePlaceholder: "Enter your full legal name",
    uploadW9: "Upload Completed W-9 Form",
    downloadW9: "Download W-9 Form",
    uploadNDA: "Upload NDA",
    choosePdfFile: "Choose PDF file...",
    uploadButton: "Upload",
    uploading: "Uploading...",
    submitForms: "Submit Forms",
    submitting: "Submitting...",
    submissionSuccess: "Submission Successful",
    submissionEmailSent: "A confirmation email has been sent to the admin team.",
    uploadError: "Upload Error",
    pdfOnly: "Please upload PDF files only.",
    formError: "Form Error",
    requiredFields: "Please fill in all required fields.",
    adminLogin: "Admin Login",
    username: "Username",
    password: "Password",
    login: "Login",
    invalidCredentials: "Invalid username or password",
    adminDashboardTitle: "Admin Panel — MS Sphere Media Check In Submissions",
    submittedAt: "Submitted At",
    w9Form: "W-9 Form",
    ndaForm: "NDA Form",
    download: "Download",
    noSubmissions: "No submissions yet",
    backToHome: "Back to Home"
  },
  zh: {
    appTitle: "MS Sphere Media 签到系统",
    welcomeBanner: "欢迎加入我们的 TEAM!",
    payrollInfoTitle: "工资信息",
    payPeriods: "工资周期",
    payDays: "发薪日",
    payDayExplanation: "\"发薪日\"的意思是：您将在这一天结束之前拿到上一段时间的工资。",
    monthEnd: "月末",
    payByHours: "工资按工时支付，工时请与 Jocelyn 核对。",
    questionsContact: "如有问题，请联系：acctspheremedia@gmail.com",
    uploadInstructions: "您可以在此处上传 PDF 表格，或打印后交给 Michael。",
    clockInReminder: "请上班下班，午饭准时打卡，如果没有打卡记录造成的工资延时发放问题概不负责",
    uploadTitle: "员工入职",
    uploadSubtitle: "请完成并提交以下表格",
    fullLegalName: "我们将会给这个名字开支票",
    fullLegalNamePlaceholder: "输入您的全名",
    uploadW9: "上传已填写的 W-9 表格",
    downloadW9: "下载 W-9 表格",
    uploadNDA: "上传保密协议 (NDA)",
    choosePdfFile: "选择 PDF 文件...",
    uploadButton: "上传",
    uploading: "上传中...",
    submitForms: "提交表格",
    submitting: "提交中...",
    submissionSuccess: "提交成功",
    submissionEmailSent: "确认邮件已发送至管理团队。",
    uploadError: "上传错误",
    pdfOnly: "请只上传 PDF 文件。",
    formError: "表格错误",
    requiredFields: "请填写所有必填字段。",
    adminLogin: "管理员登录",
    username: "用户名",
    password: "密码",
    login: "登录",
    invalidCredentials: "用户名或密码无效",
    adminDashboardTitle: "管理员面板 — MS Sphere Media Check In 提交记录",
    submittedAt: "提交时间",
    w9Form: "W-9 表格",
    ndaForm: "NDA 表格",
    download: "下载",
    noSubmissions: "暂无提交记录",
    backToHome: "返回首页"
  },
  es: {
    appTitle: "MS Sphere Media Check In",
    welcomeBanner: "¡Bienvenido a Nuestro EQUIPO!",
    payrollInfoTitle: "Información de Nómina",
    payPeriods: "Períodos de pago",
    payDays: "Días de pago",
    payDayExplanation: "\"Día de pago\" significa que recibirá el pago del período anterior antes de que termine ese día.",
    monthEnd: "Fin de mes",
    payByHours: "Pago por horas—verifica con Jocelyn.",
    questionsContact: "Preguntas? Contacta: acctspheremedia@gmail.com",
    uploadInstructions: "Puede cargar formularios PDF aquí o imprimir y entregar a Michael.",
    clockInReminder: "Por favor registre su entrada/salida y almuerzo a tiempo. No nos hacemos responsables por retrasos en los pagos debido a registros de reloj faltantes.",
    uploadTitle: "Incorporación de Empleados",
    uploadSubtitle: "Complete y envíe los siguientes formularios",
    fullLegalName: "Emitiremos el cheque a este nombre",
    fullLegalNamePlaceholder: "Ingrese su nombre legal completo",
    uploadW9: "Cargar formulario W-9 completado",
    downloadW9: "Descargar formulario W-9",
    uploadNDA: "Cargar NDA",
    choosePdfFile: "Elegir archivo PDF...",
    uploadButton: "Cargar",
    uploading: "Cargando...",
    submitForms: "Enviar Formularios",
    submitting: "Enviando...",
    submissionSuccess: "Envío Exitoso",
    submissionEmailSent: "Se ha enviado un correo electrónico de confirmación al equipo administrativo.",
    uploadError: "Error de Carga",
    pdfOnly: "Por favor, suba solo archivos PDF.",
    formError: "Error en el Formulario",
    requiredFields: "Por favor complete todos los campos requeridos.",
    adminLogin: "Inicio de Admin",
    username: "Usuario",
    password: "Contraseña",
    login: "Iniciar Sesión",
    invalidCredentials: "Usuario o contraseña inválidos",
    adminDashboardTitle: "Panel de Administrador — MS Sphere Media Check In Submissions",
    submittedAt: "Fecha de envío",
    w9Form: "Formulario W-9",
    ndaForm: "Formulario NDA",
    download: "Descargar",
    noSubmissions: "Aún no hay envíos",
    backToHome: "Volver al Inicio"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(getBrowserLanguage());

  const t = (key: TranslationKey): string => {
    return translations[currentLanguage][key] || key;
  };

  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language);
  };

  return (
    <LanguageContext.Provider value={{ t, currentLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
