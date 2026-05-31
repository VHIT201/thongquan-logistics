export interface CeoOverview {
  totalEmails: number
  totalAttachments: number
  totalTasks: number
  completedTasks: number
  processingTasks: number
  pendingTasks: number
  overdueTasks: number
  aiSuccessRate: number
  completionRate: number
  reportRows: number
  missingDataRows: number
}

export interface EmployeeCustomer {
  customerName: string
  totalEmails: number
  totalTasks: number
  processingTasks: number
  overdueTasks: number
}

export interface EmployeeTask {
  id: string
  customerName: string
  emailSubject: string
  documentType: string
  status: string
  receivedAt: string
  dueAt: string
  warning: string
}

export interface EmployeePerformance {
  id: string
  name: string
  department: string
  role: string
  email: string
  totalEmails: number
  totalTasks: number
  completedTasks: number
  processingTasks: number
  pendingTasks: number
  overdueTasks: number
  completionRate: number
  averageProcessingTime: string
  aiExtractedFiles: number
  aiNeedReviewFiles: number
  customers: EmployeeCustomer[]
  currentTasks: EmployeeTask[]
}

export type AlertLevel = "low" | "medium" | "high" | "critical"
export type AlertType =
  | "overdue_task"
  | "unprocessed_email"
  | "employee_overload"
  | "low_performance"
  | "ai_error"
  | "missing_data"
  | "customer_pending"
  | "waiting_customer"
  | "waiting_customs"

export interface CeoAlert {
  id: string
  type: AlertType
  level: AlertLevel
  title: string
  description: string
  relatedEmployeeId?: string
  relatedTaskIds?: string[]
  createdAt: string
}

export interface AiExtractionByDocType {
  documentType: string
  total: number
  success: number
  needReview: number
  failed: number
  successRate: number
}

export interface AiExtractionSummary {
  totalFiles: number
  success: number
  needReview: number
  failed: number
  successRate: number
  byDocumentType: AiExtractionByDocType[]
}

export interface DepartmentSummary {
  name: string
  totalTasks: number
  completedTasks: number
  processingTasks: number
  overdueTasks: number
  completionRate: number
  alert: string
}

export interface ReportRow {
  stt: number
  customerName: string
  invoice: string
  bill: string
  booking: string
  type: string
  employee: string
  status: string
  receivedDate: string
  completedDate: string
  notes: string
}
