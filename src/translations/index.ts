export type LangKey = "en" | "zh" | "es";

export type TranslationKey = 
  | "appTitle"
  | "languageEn"
  | "languageZh"
  | "languageEs"
  | "payrollInfoTitle"
  | "payrollInfoText"
  | "uploadTitle"
  | "uploadSubtitle"
  | "uploadW9"
  | "uploadNDA"
  | "uploadButton"
  | "uploadSuccess"
  | "uploadError"
  | "calendar"
  | "payPeriodStart"
  | "payDay"
  | "january"
  | "february"
  | "march"
  | "april"
  | "may"
  | "june"
  | "july"
  | "august"
  | "september"
  | "october"
  | "november"
  | "december"
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "downloadW9"
  | "choosePdfFile"
  | "uploading"
  | "pdfOnly"
  | "fullLegalName"
  | "fullLegalNamePlaceholder"
  | "submitForms"
  | "submitting"
  | "formError"
  | "requiredFields"
  | "submissionSuccess"
  | "submissionEmailSent"
  | "payPeriods"
  | "payDays"
  | "monthEnd"
  | "payByHours"
  | "questionsContact"
  | "uploadInstructions"
  | "welcomeBanner"
  | "payDayExplanation"
  | "clockInReminder"
  | "adminLogin";

type Translations = {
  [key in LangKey]: {
    [key in TranslationKey]: string;
  };
};

export const translations: Translations = {
  en: {
    appTitle: "MS Sphere Media Check-In",
    languageEn: "English",
    languageZh: "中文",
    languageEs: "Español",
    payrollInfoTitle: "Payroll Information",
    payrollInfoText: "Our pay periods are divided into:\n• 1st - 15th of each month\n• 15th - end of each month\nPaydays are on the 5th and 20th of each month, and wages are paid based on actual hours worked. Please verify your hours with Jocelyn each time. If you have any questions, please contact acctspheremedia@gmail.com.",
    uploadTitle: "Document Upload",
    uploadSubtitle: "You can upload PDF versions of your forms here, or print them and give them to Michael.",
    uploadW9: "W-9 Form (Required)",
    uploadNDA: "Non-Disclosure Agreement",
    uploadButton: "Upload File",
    uploadSuccess: "File uploaded successfully!",
    uploadError: "Error uploading file. Please try again.",
    calendar: "Calendar",
    payPeriodStart: "Pay Period Start",
    payDay: "Pay Day",
    january: "January",
    february: "February",
    march: "March",
    april: "April",
    may: "May",
    june: "June",
    july: "July",
    august: "August",
    september: "September",
    october: "October",
    november: "November",
    december: "December",
    sunday: "Sun",
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    downloadW9: "Download W-9 Form",
    choosePdfFile: "Choose PDF File",
    uploading: "Uploading...",
    pdfOnly: "Please upload PDF files only",
    fullLegalName: "We will issue the check to this name",
    fullLegalNamePlaceholder: "Enter your full legal name",
    submitForms: "Submit Forms",
    submitting: "Submitting...",
    formError: "Form Error",
    requiredFields: "Please fill out all required fields and upload the W-9 form",
    submissionSuccess: "Submission Successful",
    submissionEmailSent: "Your forms have been submitted and a notification has been sent to the admin",
    payPeriods: "Pay Periods",
    payDays: "Pay Days",
    monthEnd: "Month End",
    payByHours: "Pay by hours—verify with Jocelyn.",
    questionsContact: "Questions? Contact: acctspheremedia@gmail.com",
    uploadInstructions: "You can upload PDF forms here or print and hand to Michael.",
    welcomeBanner: "Welcome to Our TEAM!",
    payDayExplanation: "\"Pay Day\" means you will receive the previous period's pay by the end of that day.",
    clockInReminder: "Please clock in/out on time, including for lunch breaks. Delayed payments due to missing clock records will not be our responsibility.",
    adminLogin: "Admin Login"
  },
  zh: {
    appTitle: "MS Sphere 员工登记系统",
    languageEn: "English",
    languageZh: "中文",
    languageEs: "Español",
    payrollInfoTitle: "工资信息",
    payrollInfoText: "我们的工资周期分为：\n• 每月1日–15日\n• 每月15日–月末\n发薪日为每月的5日和20日，工资按实际工时支付。每次工时请与 Jocelyn 核对。若有问题，请联系 acctspheremedia@gmail.com。",
    uploadTitle: "文件上传",
    uploadSubtitle: "您可以在此处上传PDF版本的表格，或打印后交给 Michael。",
    uploadW9: "W-9 表格（必填）",
    uploadNDA: "保密协议",
    uploadButton: "上传文件",
    uploadSuccess: "文件上传成功！",
    uploadError: "文件上传失败。请重试。",
    calendar: "日历",
    payPeriodStart: "工资周期开始",
    payDay: "发薪日",
    january: "一月",
    february: "二月",
    march: "三月",
    april: "四月",
    may: "五月",
    june: "六月",
    july: "七月",
    august: "八月",
    september: "九月",
    october: "十月",
    november: "十一月",
    december: "十二月",
    sunday: "日",
    monday: "一",
    tuesday: "二",
    wednesday: "三",
    thursday: "四",
    friday: "五",
    saturday: "六",
    downloadW9: "下载 W-9 表格",
    choosePdfFile: "选择PDF文件",
    uploading: "上传中...",
    pdfOnly: "请只上传PDF文件",
    fullLegalName: "我们将会给这个名字开支票",
    fullLegalNamePlaceholder: "请输入您的全名",
    submitForms: "提交表格",
    submitting: "提交中...",
    formError: "表格错误",
    requiredFields: "请填写所有必填字段并上传 W-9 表格",
    submissionSuccess: "提交成功",
    submissionEmailSent: "您的表格已提交，通知已发送给管理员",
    payPeriods: "我们的工资周期",
    payDays: "发薪日 (Pay Day)",
    monthEnd: "月末",
    payByHours: "工资按工时支付，工时请与 Jocelyn 核对。",
    questionsContact: "如有问题，请联系：acctspheremedia@gmail.com",
    uploadInstructions: "您可以在此处上传 PDF 版本的表格，或打印后交给 Michael。",
    welcomeBanner: "欢迎加入我们的 TEAM!",
    payDayExplanation: "Pay Day 的意思是：您将在这一天结束之前拿到上一段时间的工资。",
    clockInReminder: "请上班下班，午饭准时打卡，如果没有打卡记录造成的工资延时发放问题概不负责",
    adminLogin: "Admin 登录"
  },
  es: {
    appTitle: "MS Sphere Media Check-In",
    languageEn: "English",
    languageZh: "中文",
    languageEs: "Español",
    payrollInfoTitle: "Información de Nómina",
    payrollInfoText: "Nuestros períodos de pago se dividen en:\n• 1 al 15 de cada mes\n• 15 al final de cada mes\nLos días de pago son el 5 y el 20 de cada mes, y los salarios se pagan según las horas realmente trabajadas. Por favor, verifique sus horas con Jocelyn cada vez. Si tiene alguna pregunta, comuníquese con acctspheremedia@gmail.com.",
    uploadTitle: "Subir Documentos",
    uploadSubtitle: "Puede subir versiones PDF de sus formularios aquí, o imprimirlos y entregarlos a Michael.",
    uploadW9: "Formulario W-9 (Obligatorio)",
    uploadNDA: "Acuerdo de Confidencialidad",
    uploadButton: "Subir Archivo",
    uploadSuccess: "¡Archivo subido con éxito!",
    uploadError: "Error al subir el archivo. Por favor, inténtelo de nuevo.",
    calendar: "Calendario",
    payPeriodStart: "Inicio de Período de Pago",
    payDay: "Día de Pago",
    january: "Enero",
    february: "Febrero",
    march: "Marzo",
    april: "Abril",
    may: "Mayo",
    june: "Junio",
    july: "Julio",
    august: "Agosto",
    september: "Septiembre",
    october: "Octubre",
    november: "Noviembre",
    december: "Diciembre",
    sunday: "Dom",
    monday: "Lun",
    tuesday: "Mar",
    wednesday: "Mié",
    thursday: "Jue",
    friday: "Vie",
    saturday: "Sáb",
    downloadW9: "Descargar Formulario W-9",
    choosePdfFile: "Seleccionar archivo PDF",
    uploading: "Subiendo...",
    pdfOnly: "Por favor, suba solo archivos PDF",
    fullLegalName: "Emitiremos el cheque a este nombre",
    fullLegalNamePlaceholder: "Ingrese su nombre legal completo",
    submitForms: "Enviar Formularios",
    submitting: "Enviando...",
    formError: "Error en el Formulario",
    requiredFields: "Por favor complete todos los campos obligatorios y suba el formulario W-9",
    submissionSuccess: "Envío Exitoso",
    submissionEmailSent: "Sus formularios han sido enviados y se ha enviado una notificación al administrador",
    payPeriods: "Períodos de pago",
    payDays: "Días de pago",
    monthEnd: "fin de mes",
    payByHours: "Pago por horas—verifica con Jocelyn.",
    questionsContact: "Preguntas? Contacta: acctspheremedia@gmail.com",
    uploadInstructions: "Puede cargar formularios PDF aquí o imprimir y entregar a Michael.",
    welcomeBanner: "¡Bienvenido a Nuestro EQUIPO!",
    payDayExplanation: "\"Día de pago\" significa que recibirá el pago del período anterior antes de que termine ese día.",
    clockInReminder: "Por favor, registre entrada/salida a tiempo, incluso para el almuerzo. No seremos responsables por pagos retrasados debido a registros de tiempo faltantes.",
    adminLogin: "Inicio de Admin"
  }
};
