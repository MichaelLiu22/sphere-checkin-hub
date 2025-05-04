export type TranslationKey = 
  | "welcome"
  | "uploadW9"
  | "uploadNDA"
  | "choosePdfFile"
  | "uploadButton"
  | "uploading"
  | "downloadW9"
  | "downloadNDA"
  | "uploadSuccess"
  | "uploadError"
  | "submitButton"
  | "submitting"
  | "submitSuccess"
  | "submitError"
  | "uploadTitle"
  | "uploadSubtitle"
  | "fullLegalName"
  | "fullLegalNamePlaceholder"
  | "formError"
  | "requiredFields"
  | "submissionSuccess"
  | "submissionEmailSent"
  | "fileUploaded"
  | "pdfOnly"
  | "required"
  | "documentUpload"
  | "payrollInfoTitle"
  | "userAuthentication"
  | "calendar"
  | "adminLogin"
  | "welcomeDescription";

export const translations = {
  en: {
    welcome: "Welcome",
    uploadW9: "Upload W9",
    uploadNDA: "Upload NDA",
    choosePdfFile: "Choose PDF file",
    uploadButton: "Upload",
    uploading: "Uploading...",
    downloadW9: "Download W9",
    downloadNDA: "Download NDA",
    uploadSuccess: "Upload Success",
    uploadError: "Upload Error",
    submitButton: "Submit",
    submitting: "Submitting...",
    submitSuccess: "Submission Success",
    submitError: "Submission Error",
    uploadTitle: "Document Upload",
    uploadSubtitle: "We will issue the check to this name",
    fullLegalName: "Full Legal Name",
    fullLegalNamePlaceholder: "Enter your full legal name",
    formError: "Form Error",
    requiredFields: "Please fill in all required fields",
    submissionSuccess: "Success",
    submissionEmailSent: "Your submission has been received",
    fileUploaded: "File uploaded",
    pdfOnly: "Only PDF files are allowed",
    required: "Required",
    documentUpload: "Document Upload",
    payrollInfoTitle: "Payroll Information",
    userAuthentication: "User Authentication",
    calendar: "Calendar",
    adminLogin: "Admin Login",
    welcomeDescription: "Welcome to Sphere Check-in Hub"
  },
  zh: {
    welcome: "欢迎",
    uploadW9: "上传 W9",
    uploadNDA: "上传保密协议",
    choosePdfFile: "选择 PDF 文件",
    uploadButton: "上传",
    uploading: "上传中...",
    downloadW9: "下载 W9",
    downloadNDA: "下载保密协议",
    uploadSuccess: "上传成功",
    uploadError: "上传错误",
    submitButton: "提交",
    submitting: "提交中...",
    submitSuccess: "提交成功",
    submitError: "提交错误",
    uploadTitle: "文件上传",
    uploadSubtitle: "支票将开具给此姓名",
    fullLegalName: "法定全名",
    fullLegalNamePlaceholder: "请输入您的法定全名",
    formError: "表单错误",
    requiredFields: "请填写所有必填字段",
    submissionSuccess: "成功",
    submissionEmailSent: "您的提交已收到",
    fileUploaded: "文件已上传",
    pdfOnly: "仅允许 PDF 文件",
    required: "必填",
    documentUpload: "文件上传",
    payrollInfoTitle: "工资信息",
    userAuthentication: "用户认证",
    calendar: "日历",
    adminLogin: "管理员登录",
    welcomeDescription: "欢迎使用 Sphere 签到中心"
  },
  es: {
    welcome: "Bienvenido",
    uploadW9: "Subir W9",
    uploadNDA: "Subir NDA",
    choosePdfFile: "Elegir archivo PDF",
    uploadButton: "Subir",
    uploading: "Subiendo...",
    downloadW9: "Descargar W9",
    downloadNDA: "Descargar NDA",
    uploadSuccess: "Subida Exitosa",
    uploadError: "Error de Subida",
    submitButton: "Enviar",
    submitting: "Enviando...",
    submitSuccess: "Envío Exitoso",
    submitError: "Error de Envío",
    uploadTitle: "Subir Documento",
    uploadSubtitle: "Emitiremos el cheque a este nombre",
    fullLegalName: "Nombre Legal Completo",
    fullLegalNamePlaceholder: "Ingrese su nombre legal completo",
    formError: "Error de Formulario",
    requiredFields: "Por favor complete todos los campos requeridos",
    submissionSuccess: "Éxito",
    submissionEmailSent: "Su envío ha sido recibido",
    fileUploaded: "Archivo subido",
    pdfOnly: "Solo se permiten archivos PDF",
    required: "Requerido",
    documentUpload: "Subir Documentos",
    payrollInfoTitle: "Información de Nómina",
    userAuthentication: "Autenticación de Usuario",
    calendar: "Calendario",
    adminLogin: "Acceso de Administrador",
    welcomeDescription: "Bienvenido a Sphere Check-in Hub"
  }
} as const; 