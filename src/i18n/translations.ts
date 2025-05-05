
export type TranslationKey = 
  | "welcome"
  | "uploadW9"
  | "uploadNDA"
  | "uploadEmployment"
  | "choosePdfFile"
  | "uploadButton"
  | "uploading"
  | "downloadW9"
  | "downloadNDA"
  | "downloadEmployment"
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
  | "welcomeDescription"
  // Month names
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
  // Day names
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  // Language keys
  | "languageEn"
  | "languageZh"
  | "languageEs"
  // Payroll information
  | "payPeriods"
  | "payDays"
  | "monthEnd"
  | "payByHours"
  | "questionsContact"
  | "uploadInstructions"
  | "payDayExplanation"
  | "clockInReminder"
  | "payPeriodStart"
  | "payDay"
  // Authentication
  | "invalidCredentials"
  | "username"
  | "password"
  | "login"
  | "loginSuccess"
  | "loginError"
  | "passwordMismatch"
  | "registrationSuccess"
  | "registrationError"
  | "userLogin"
  | "userRegistration"
  | "needToRegister"
  | "alreadyHaveAccount"
  | "confirmPassword"
  | "processing"
  | "register"
  // File upload
  | "uploadFile"
  | "fileName"
  | "fileDescription"
  | "fileType"
  | "selectFileType"
  | "preFile"
  | "regularFile"
  | "chooseFile"
  | "upload"
  | "submitForms";

export const translations = {
  en: {
    welcome: "Welcome",
    uploadW9: "Upload W9",
    uploadNDA: "Upload NDA",
    uploadEmployment: "Upload Employment Agreement",
    choosePdfFile: "Choose PDF file",
    uploadButton: "Upload",
    uploading: "Uploading...",
    downloadW9: "Download W9",
    downloadNDA: "Download NDA",
    downloadEmployment: "Download Employment Agreement",
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
    welcomeDescription: "Welcome to Sphere Check-in Hub",
    // Month names
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
    // Day names
    sunday: "Sun",
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    // Language keys
    languageEn: "English",
    languageZh: "中文",
    languageEs: "Español",
    // Payroll information
    payPeriods: "Pay Periods",
    payDays: "Pay Days",
    monthEnd: "Month End",
    payByHours: "Pay by hours—verify with Jocelyn.",
    questionsContact: "Questions? Contact: acctspheremedia@gmail.com",
    uploadInstructions: "You can upload PDF forms here or print and hand to Michael.",
    payDayExplanation: "\"Pay Day\" means you will receive the previous period's pay by the end of that day.",
    clockInReminder: "Please clock in/out on time, including for lunch breaks. Delayed payments due to missing clock records will not be our responsibility.",
    payPeriodStart: "Pay Period Start",
    payDay: "Pay Day",
    // Authentication
    invalidCredentials: "Invalid username or password",
    username: "Username",
    password: "Password",
    login: "Login",
    loginSuccess: "Login successful!",
    loginError: "Login failed. Please try again.",
    passwordMismatch: "Passwords do not match",
    registrationSuccess: "Registration successful!",
    registrationError: "Registration failed. Please try again.",
    userLogin: "User Login",
    userRegistration: "User Registration",
    needToRegister: "Need to register?",
    alreadyHaveAccount: "Already have an account?",
    confirmPassword: "Confirm Password",
    processing: "Processing...",
    register: "Register",
    // File upload
    uploadFile: "Upload File",
    fileName: "File Name",
    fileDescription: "File Description",
    fileType: "File Type",
    selectFileType: "Select File Type",
    preFile: "Pre File",
    regularFile: "Regular File",
    chooseFile: "Choose File",
    upload: "Upload",
    submitForms: "Submit Forms"
  },
  zh: {
    welcome: "欢迎",
    uploadW9: "上传 W9",
    uploadNDA: "上传保密协议",
    uploadEmployment: "上传入职协议",
    choosePdfFile: "选择 PDF 文件",
    uploadButton: "上传",
    uploading: "上传中...",
    downloadW9: "下载 W9",
    downloadNDA: "下载保密协议",
    downloadEmployment: "下载入职协议",
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
    welcomeDescription: "欢迎使用 Sphere 签到中心",
    // Month names
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
    // Day names
    sunday: "日",
    monday: "一",
    tuesday: "二",
    wednesday: "三",
    thursday: "四",
    friday: "五",
    saturday: "六",
    // Language keys
    languageEn: "English",
    languageZh: "中文",
    languageEs: "Español",
    // Payroll information
    payPeriods: "我们的工资周期",
    payDays: "发薪日",
    monthEnd: "月末",
    payByHours: "工资按工时支付，工时请与 Jocelyn 核对。",
    questionsContact: "如有问题，请联系：acctspheremedia@gmail.com",
    uploadInstructions: "您可以在此处上传 PDF 版本的表格，或打印后交给 Michael。",
    payDayExplanation: "Pay Day 的意思是：您将在这一天结束之前拿到上一段时间的工资。",
    clockInReminder: "请上班下班，午饭准时打卡，如果没有打卡记录造成的工资延时发放问题概不负责",
    payPeriodStart: "工资周期开始",
    payDay: "发薪日",
    // Authentication
    invalidCredentials: "用户名或密码无效",
    username: "用户名",
    password: "密码",
    login: "登录",
    loginSuccess: "登录成功！",
    loginError: "登录失败，请重试。",
    passwordMismatch: "密码不匹配",
    registrationSuccess: "注册成功！",
    registrationError: "注册失败，请重试。",
    userLogin: "用户登录",
    userRegistration: "用户注册",
    needToRegister: "需要注册？",
    alreadyHaveAccount: "已有账号？",
    confirmPassword: "确认密码",
    processing: "处理中...",
    register: "注册",
    // File upload
    uploadFile: "上传文件",
    fileName: "文件名称",
    fileDescription: "文件描述",
    fileType: "文件类型",
    selectFileType: "选择文件类型",
    preFile: "预文件",
    regularFile: "常规文件",
    chooseFile: "选择文件",
    upload: "上传",
    submitForms: "提交表格"
  },
  es: {
    welcome: "Bienvenido",
    uploadW9: "Subir W9",
    uploadNDA: "Subir NDA",
    uploadEmployment: "Subir Acuerdo de Empleo",
    choosePdfFile: "Elegir archivo PDF",
    uploadButton: "Subir",
    uploading: "Subiendo...",
    downloadW9: "Descargar W9",
    downloadNDA: "Descargar NDA",
    downloadEmployment: "Descargar Acuerdo de Empleo",
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
    welcomeDescription: "Bienvenido a Sphere Check-in Hub",
    // Month names
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
    // Day names
    sunday: "Dom",
    monday: "Lun",
    tuesday: "Mar",
    wednesday: "Mié",
    thursday: "Jue",
    friday: "Vie",
    saturday: "Sáb",
    // Language keys
    languageEn: "English",
    languageZh: "中文",
    languageEs: "Español",
    // Payroll information
    payPeriods: "Períodos de pago",
    payDays: "Días de pago",
    monthEnd: "fin de mes",
    payByHours: "Pago por horas—verifica con Jocelyn.",
    questionsContact: "Preguntas? Contacta: acctspheremedia@gmail.com",
    uploadInstructions: "Puede cargar formularios PDF aquí o imprimir y entregar a Michael.",
    payDayExplanation: "\"Día de pago\" significa que recibirá el pago del período anterior antes de que termine ese día.",
    clockInReminder: "Por favor, registre entrada/salida a tiempo, incluso para el almuerzo. No seremos responsables por pagos retrasados debido a registros de tiempo faltantes.",
    payPeriodStart: "Inicio de Período de Pago",
    payDay: "Día de Pago",
    // Authentication
    invalidCredentials: "Usuario o contraseña inválidos",
    username: "Usuario",
    password: "Contraseña",
    login: "Iniciar Sesión",
    loginSuccess: "¡Inicio de sesión exitoso!",
    loginError: "Error al iniciar sesión. Por favor, intente de nuevo.",
    passwordMismatch: "Las contraseñas no coinciden",
    registrationSuccess: "¡Registro exitoso!",
    registrationError: "Error al registrarse. Por favor, intente de nuevo.",
    userLogin: "Inicio de Sesión",
    userRegistration: "Registro de Usuario",
    needToRegister: "¿Necesitas registrarte?",
    alreadyHaveAccount: "¿Ya tienes una cuenta?",
    confirmPassword: "Confirmar Contraseña",
    processing: "Procesando...",
    register: "Registrarse",
    // File upload
    uploadFile: "Subir Archivo",
    fileName: "Nombre del Archivo",
    fileDescription: "Descripción del Archivo",
    fileType: "Tipo de Archivo",
    selectFileType: "Seleccionar Tipo de Archivo",
    preFile: "Archivo Pre",
    regularFile: "Archivo Regular",
    chooseFile: "Elegir Archivo",
    upload: "Subir",
    submitForms: "Enviar Formularios"
  }
} as const; 
