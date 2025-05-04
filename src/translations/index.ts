
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
  | "adminLogin"
  | "invalidCredentials"
  | "username"
  | "password"
  | "login"
  | "adminDashboardTitle"
  | "submittedAt"
  | "w9Form"
  | "ndaForm"
  | "download"
  | "noSubmissions"
  | "backToHome"
  | "userLogin"
  | "userRegistration"
  | "confirmPassword"
  | "processing"
  | "register"
  | "needToRegister"
  | "alreadyHaveAccount"
  | "loginSuccess"
  | "registrationSuccess"
  | "passwordsDoNotMatch"
  | "userDashboard"
  | "uploadFile"
  | "fileName"
  | "fileDescription"
  | "fileType"
  | "selectFileType"
  | "preFile"
  | "regularFile"
  | "chooseFile"
  | "myFiles"
  | "preFiles"
  | "regularFiles"
  | "downloadFile"
  | "noFilesFound"
  | "adminDashboard"
  | "uploadedFiles"
  | "loading"
  | "noFiles"
  | "welcome"
  | "welcomeDescription"
  | "documentUpload"
  | "upload"
  | "uploadingFile"
  | "fileUploadSuccess"
  | "fileUploadError"
  | "loginError"
  | "registrationError"
  | "passwordMismatch"
  | "logout"
  | "employeeSubmissions"
  | "notUploaded"
  | "fileUploaded";

type Translations = {
  [key in LangKey]: {
    [key in TranslationKey]?: string;
  };
};

export const translations: Translations = {
  en: {
    appTitle: "Michael Studio Sphere media",
    languageEn: "English",
    languageZh: "中文",
    languageEs: "Español",
    payrollInfoTitle: "Payroll Information",
    payrollInfoText: "Our pay periods are divided into:\n• 15th - end of each month\n• End of month - 15th of next month\nPaydays are on the 5th and 20th of each month, and wages are paid based on actual hours worked. Please verify your hours with Jocelyn each time. If you have any questions, please contact acctspheremedia@gmail.com.",
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
    adminLogin: "Admin Login",
    invalidCredentials: "Invalid username or password",
    username: "Username",
    password: "Password",
    login: "Login",
    adminDashboardTitle: "Admin Dashboard",
    submittedAt: "Submitted At",
    w9Form: "W-9 Form",
    ndaForm: "NDA Form",
    download: "Download",
    noSubmissions: "No submissions found",
    backToHome: "Back to Home",
    userLogin: "User Login",
    userRegistration: "User Registration",
    confirmPassword: "Confirm Password",
    processing: "Processing...",
    register: "Register",
    needToRegister: "Need to register?",
    alreadyHaveAccount: "Already have an account?",
    loginSuccess: "Login successful!",
    registrationSuccess: "Registration successful!",
    passwordsDoNotMatch: "Passwords do not match",
    userDashboard: "User Dashboard",
    uploadFile: "Upload File",
    fileName: "File Name",
    fileDescription: "File Description",
    fileType: "File Type",
    selectFileType: "Select File Type",
    preFile: "Pre File",
    regularFile: "Regular File",
    chooseFile: "Choose File",
    myFiles: "My Files",
    preFiles: "Pre-employment Files",
    regularFiles: "Regular Files",
    downloadFile: "Download",
    noFilesFound: "No files found",
    adminDashboard: "Admin Dashboard",
    uploadedFiles: "Uploaded Files",
    loading: "Loading...",
    noFiles: "No files uploaded yet",
    welcome: "Welcome to Sphere Check-in Hub",
    welcomeDescription: "Please upload your required documents and manage your account",
    documentUpload: "Document Upload",
    upload: "Upload",
    uploadingFile: "Uploading...",
    fileUploadSuccess: "File uploaded successfully!",
    fileUploadError: "Error uploading file. Please try again.",
    loginError: "Login failed. Please try again.",
    registrationError: "Registration failed. Please try again.",
    passwordMismatch: "Passwords do not match",
    logout: "Logout",
    employeeSubmissions: "Employee Submissions",
    notUploaded: "Not Uploaded",
    fileUploaded: "File Uploaded"
  },
  zh: {
    appTitle: "MS Sphere 员工登记系统",
    languageEn: "English",
    languageZh: "中文",
    languageEs: "Español",
    payrollInfoTitle: "工资信息",
    payrollInfoText: "我们的工资周期分为：\n• 每月15日–月末\n• 月末–下月15日\n发薪日为每月的5日和20日，工资按实际工时支付。每次工时请与 Jocelyn 核对。若有问题，请联系 acctspheremedia@gmail.com。",
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
    adminLogin: "Admin 登录",
    invalidCredentials: "用户名或密码无效",
    username: "用户名",
    password: "密码",
    login: "登录",
    adminDashboardTitle: "管理员面板",
    submittedAt: "提交时间",
    w9Form: "W-9 表格",
    ndaForm: "保密协议",
    download: "下载",
    noSubmissions: "没有找到提交记录",
    backToHome: "返回首页",
    userLogin: "用户登录",
    userRegistration: "用户注册",
    confirmPassword: "确认密码",
    processing: "处理中...",
    register: "注册",
    needToRegister: "需要注册？",
    alreadyHaveAccount: "已有账号？",
    loginSuccess: "登录成功！",
    registrationSuccess: "注册成功！",
    passwordsDoNotMatch: "密码不匹配",
    userDashboard: "用户面板",
    uploadFile: "上传文件",
    fileName: "文件名称",
    fileDescription: "文件描述",
    fileType: "文件类型",
    selectFileType: "选择文件类型",
    preFile: "预文件",
    regularFile: "常规文件",
    chooseFile: "选择文件",
    myFiles: "我的文件",
    preFiles: "入职文件",
    regularFiles: "普通文件",
    downloadFile: "下载",
    noFilesFound: "未找到文件",
    adminDashboard: "管理员仪表板",
    uploadedFiles: "已上传文件",
    loading: "加载中...",
    noFiles: "暂无上传文件",
    welcome: "欢迎使用 Sphere 签到中心",
    welcomeDescription: "请上传所需文件并管理您的账户",
    documentUpload: "文件上传",
    upload: "上传",
    uploadingFile: "正在上传...",
    fileUploadSuccess: "文件上传成功！",
    fileUploadError: "文件上传失败，请重试。",
    loginError: "登录失败，请重试。",
    registrationError: "注册失败，请重试。",
    passwordMismatch: "密码不匹配",
    logout: "退出登录",
    employeeSubmissions: "员工提交",
    notUploaded: "未上传",
    fileUploaded: "文件已上传"
  },
  es: {
    appTitle: "MS Sphere Media Check-In",
    languageEn: "English",
    languageZh: "中文",
    languageEs: "Español",
    payrollInfoTitle: "Información de Nómina",
    payrollInfoText: "Nuestros períodos de pago se dividen en:\n• 15 al final de cada mes\n• Final del mes al 15 del mes siguiente\nLos días de pago son el 5 y el 20 de cada mes, y los salarios se pagan según las horas realmente trabajadas. Por favor, verifique sus horas con Jocelyn cada vez. Si tiene alguna pregunta, comuníquese con acctspheremedia@gmail.com.",
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
    adminLogin: "Inicio de Admin",
    invalidCredentials: "Usuario o contraseña inválidos",
    username: "Usuario",
    password: "Contraseña",
    login: "Iniciar Sesión",
    adminDashboardTitle: "Panel de Administrador",
    submittedAt: "Fecha de envío",
    w9Form: "Formulario W-9",
    ndaForm: "Formulario NDA",
    download: "Descargar",
    noSubmissions: "No se encontraron envíos",
    backToHome: "Volver al inicio",
    userLogin: "Inicio de Sesión",
    userRegistration: "Registro de Usuario",
    confirmPassword: "Confirmar Contraseña",
    processing: "Procesando...",
    register: "Registrarse",
    needToRegister: "¿Necesitas registrarte?",
    alreadyHaveAccount: "¿Ya tienes una cuenta?",
    loginSuccess: "¡Inicio de sesión exitoso!",
    registrationSuccess: "¡Registro exitoso!",
    passwordsDoNotMatch: "Las contraseñas no coinciden",
    userDashboard: "Panel de Usuario",
    uploadFile: "Subir Archivo",
    fileName: "Nombre del Archivo",
    fileDescription: "Descripción del Archivo",
    fileType: "Tipo de Archivo",
    selectFileType: "Seleccionar Tipo de Archivo",
    preFile: "Archivo Pre",
    regularFile: "Archivo Regular",
    chooseFile: "Elegir Archivo",
    myFiles: "Mis Archivos",
    preFiles: "Archivos Pre-empleo",
    regularFiles: "Archivos Regulares",
    downloadFile: "Descargar",
    noFilesFound: "No se encontraron archivos",
    adminDashboard: "Panel de Administración",
    uploadedFiles: "Archivos Subidos",
    loading: "Cargando...",
    noFiles: "No hay archivos subidos",
    welcome: "Bienvenido al Centro de Registro de Sphere",
    welcomeDescription: "Por favor, suba sus documentos requeridos y administre su cuenta",
    documentUpload: "Subir Documentos",
    upload: "Subir",
    uploadingFile: "Subiendo...",
    fileUploadSuccess: "¡Archivo subido exitosamente!",
    fileUploadError: "Error al subir archivo. Por favor, intente de nuevo.",
    loginError: "Error al iniciar sesión. Por favor, intente de nuevo.",
    registrationError: "Error al registrarse. Por favor, intente de nuevo.",
    passwordMismatch: "Las contraseñas no coinciden",
    logout: "Cerrar sesión",
    employeeSubmissions: "Presentaciones de empleados",
    notUploaded: "No subido",
    fileUploaded: "Archivo subido"
  }
};
