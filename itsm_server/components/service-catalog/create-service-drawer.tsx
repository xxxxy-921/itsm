"use client"

import { useState, useEffect } from "react"
import {
  X,
  ChevronDown,
  Sparkles,
  Clock,
  Plus,
  FileText,
  Trash2,
  Upload,
  FileUp,
  Loader2,
  CheckCircle2,
  Brain,
  AlertTriangle,
  FileCode,
  Settings,
  Plug2,
  Server,
  Zap,
  Eye,
  EyeOff,
  Edit3,
  Play,
  CheckSquare,
  ArrowRight,
  User,
  ClipboardList,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { MermaidViewer } from "./mermaid-viewer"
import { convertCotToMermaid } from "@/lib/cot-to-mermaid"
import { cn } from "@/lib/utils"

// ============ 类型定义 ============
interface ServiceConfigJSON {
  script: string
  sla_tier: '2h' | '4h' | '8h' | '24h'
  nodes: {
    id: string
    label: string
    type: 'start' | 'approval' | 'processing' | 'end'
  }[]
  fields: {
    key: string
    label: string
    type: 'text' | 'select' | 'date' | 'textarea'
    permissions: Record<string, 'read' | 'write' | 'hide'>
  }[]
  mock_data?: Record<string, string>
}

interface CreateServiceDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: "create" | "edit"
  editingService?: {
    id: string
    title: string
    code: string
    description: string
    category: string
    sla: string
    icon?: string
    collaborationRules?: string
    infoCollectionPrompt?: string
    agentModel?: string
    uploadedDocument?: {
      name: string
      uploadedAt: string
    }
  } | null
}

// Mock categories for dropdown
const categories = [
  { id: "hr", label: "人事服务" },
  { id: "office", label: "办公支持" },
  { id: "assets", label: "设备与资产" },
  { id: "access", label: "账号与权限管理" },
  { id: "network", label: "网络" },
  { id: "email", label: "邮箱系统" },
]

// 示例 JSON 配置数据
const EXAMPLE_CONFIG_JSON: ServiceConfigJSON = {
  script: `### 协作规范
当用户发起VPN申请时，系统需校验其部门权限。

**提单阶段**
- 收集使用时长和原因
- 验证申请人身份信息

**审批阶段**
- 经理需审核合规性
- 检查申请原因是否充分

**处理阶段**
- IT 开通 VPN 权限
- 发送通知给申请人`,
  sla_tier: "8h",
  nodes: [
    { id: "start", label: "发起申请", type: "start" },
    { id: "manager_approve", label: "经理审批", type: "approval" },
    { id: "fulfillment", label: "IT开通", type: "processing" }
  ],
  fields: [
    { 
      key: "reason", 
      label: "申请原因", 
      type: "textarea",
      permissions: { "start": "write", "manager_approve": "read", "fulfillment": "read" }
    },
    { 
      key: "duration", 
      label: "使用时长(天)", 
      type: "select",
      permissions: { "start": "write", "manager_approve": "read", "fulfillment": "read" }
    },
    { 
      key: "manager_comment", 
      label: "审批意见", 
      type: "textarea",
      permissions: { "start": "hide", "manager_approve": "write", "fulfillment": "read" }
    },
    { 
      key: "it_note", 
      label: "处理备注", 
      type: "text",
      permissions: { "start": "hide", "manager_approve": "hide", "fulfillment": "write" }
    }
  ],
  mock_data: {
    reason: "需要远程访问公司内网资源进行项目开发",
    duration: "30",
    manager_comment: "",
    it_note: ""
  }
}

export function CreateServiceDrawer({ open, onOpenChange, mode = "create", editingService }: CreateServiceDrawerProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "process">("basic")
  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    code: "",
    icon: "",
    sla: "",
    description: "",
    collaborationRules: "",
    enabled: true,
  })
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // 文档上传 & AI 分析状态
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [aiAnalyzedSuccessfully, setAiAnalyzedSuccessfully] = useState(false)
  const [showReplaceUpload, setShowReplaceUpload] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false)
  const [mermaidZoom, setMermaidZoom] = useState(1)

  // 知识库挂载列表
  const [knowledgeLibrary, setKnowledgeLibrary] = useState<Array<{
    id: string
    name: string
    type: "source" | "reference"
    uploadedAt: string
  }>>([])
  
  // MCP 挂载列表
  const [mountedMCPs, setMountedMCPs] = useState<Array<{
    id: string
    name: string
    description: string
    config?: string
  }>>([])
  const [showAddMCPModal, setShowAddMCPModal] = useState(false)
  const [newMCPForm, setNewMCPForm] = useState({
    name: "",
    description: "",
    config: ""
  })
  
  // 可选的系统MCP列表（仅供选择，不可修改）
  const AVAILABLE_SYSTEM_MCPS = [
    { id: "mcp-db", name: "数据库查询", description: "支持 SQL 查询和数据分析" },
    { id: "mcp-api", name: "企业 API 网关", description: "调用内部业务系统接口" },
    { id: "mcp-file", name: "文件系统", description: "读取和管理共享文档" },
    { id: "mcp-email", name: "邮件服务", description: "发送和读取企业邮件" },
    { id: "mcp-calendar", name: "日历服务", description: "管理日程和会议" },
  ]
  
  // 工作流配置数据
  const [workflowConfig, setWorkflowConfig] = useState<ServiceConfigJSON | null>(null)
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)
  
  // 字段权限本地编辑状态
  const [localFieldPermissions, setLocalFieldPermissions] = useState<Record<string, Record<string, 'read' | 'write' | 'hide'>>>({})

  // 当编辑服务时，填充表单数据
  useEffect(() => {
    if (editingService) {
      setFormData({
        categoryId: editingService.category,
        name: editingService.title,
        code: editingService.code,
        icon: editingService.icon || "",
        description: editingService.description,
        sla: editingService.sla.replace('h', ''),
        collaborationRules: editingService.collaborationRules || "",
        enabled: true,
      })
      
      if (editingService.uploadedDocument) {
        setKnowledgeLibrary([{
          id: "source-doc",
          name: editingService.uploadedDocument.name,
          type: "source",
          uploadedAt: editingService.uploadedDocument.uploadedAt,
        }])
      }
      
      setShowReplaceUpload(false)
    } else {
      setFormData({
        categoryId: "",
        name: "",
        code: "",
        icon: "",
        sla: "",
        description: "",
        collaborationRules: "",
        enabled: true,
      })
      setUploadedFile(null)
      setUploadProgress(0)
      setHasAnalyzed(false)
      setShowReplaceUpload(false)
      setKnowledgeLibrary([])
      setWorkflowConfig(null)
      setActiveNodeId(null)
      setLocalFieldPermissions({})
    }
    setActiveTab("basic")
  }, [editingService, open])

  // 当 workflowConfig 变化时，初始化本地权限编辑状态
  useEffect(() => {
    if (workflowConfig) {
      const permissions: Record<string, Record<string, 'read' | 'write' | 'hide'>> = {}
      workflowConfig.fields.forEach(field => {
        permissions[field.key] = { ...field.permissions }
      })
      setLocalFieldPermissions(permissions)
      
      // 设置默认选中第一个节点
      if (workflowConfig.nodes.length > 0 && !activeNodeId) {
        setActiveNodeId(workflowConfig.nodes[0].id)
      }
    }
  }, [workflowConfig])

  // 更新字段权限
  const updateFieldPermission = (fieldKey: string, nodeId: string, permission: 'read' | 'write' | 'hide') => {
    setLocalFieldPermissions(prev => ({
      ...prev,
      [fieldKey]: {
        ...prev[fieldKey],
        [nodeId]: permission
      }
    }))
  }

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setHasAnalyzed(false)
      setUploadProgress(0)
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 20
        })
      }, 100)
    }
  }

  // 替换文档并重新识别
  const handleReplaceDocument = () => {
    setShowReplaceConfirm(true)
  }

  // 确认替换文档
  const confirmReplaceDocument = () => {
    setShowReplaceUpload(true)
    setUploadedFile(null)
    setUploadProgress(0)
    setHasAnalyzed(false)
    setAnalysisError(null)
    setKnowledgeLibrary(knowledgeLibrary.filter(doc => doc.type !== "source"))
    setFormData({
      ...formData,
      collaborationRules: "",
      sla: "",
    })
    setShowReplaceConfirm(false)
  }

  // 添加参考知识库文档
  const handleAddKnowledgeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const newDoc = {
        id: "ref-doc-" + Date.now(),
        name: file.name,
        type: "reference" as const,
        uploadedAt: new Date().toLocaleString(),
      }
      setKnowledgeLibrary([...knowledgeLibrary, newDoc])
    }
  }

  // 删除知识库文档
  const handleRemoveKnowledge = (id: string) => {
    setKnowledgeLibrary(knowledgeLibrary.filter((item) => item.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.categoryId) {
      setValidationError("请选择所属目录")
      setActiveTab("basic")
      setTimeout(() => setValidationError(null), 3000)
      return
    }
    if (!formData.name.trim()) {
      setValidationError("请输入服务名称")
      setActiveTab("basic")
      setTimeout(() => setValidationError(null), 3000)
      return
    }
    if (!formData.code.trim()) {
      setValidationError("请输入服务编码")
      setActiveTab("basic")
      setTimeout(() => setValidationError(null), 3000)
      return
    }
    
    console.log("Save service:", {
      ...formData,
      workflowConfig,
      localFieldPermissions,
      knowledgeLibrary,
    })
    setValidationError(null)
    onOpenChange(false)
  }

  const handleReset = () => {
    if (mode === "edit" && editingService) {
      setFormData({
        categoryId: editingService.category,
        name: editingService.title,
        code: editingService.code,
        icon: editingService.icon || "",
        description: editingService.description,
        sla: editingService.sla.replace('h', ''),
        collaborationRules: editingService.collaborationRules || "",
        enabled: true,
      })
    } else {
      setFormData({
        categoryId: "",
        name: "",
        code: "",
        icon: "",
        sla: "",
        description: "",
        collaborationRules: "",
        enabled: true,
      })
      setWorkflowConfig(null)
      setActiveNodeId(null)
      setLocalFieldPermissions({})
    }
  }

  const selectedCategory = categories.find((c) => c.id === formData.categoryId)
  const activeNode = workflowConfig?.nodes.find(n => n.id === activeNodeId)

  // 获取节点图标
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'start': return Play
      case 'approval': return CheckSquare
      case 'processing': return Settings
      case 'end': return CheckCircle2
      default: return ClipboardList
    }
  }

  // 获取权限图标和样式
  const getPermissionStyle = (permission: 'read' | 'write' | 'hide') => {
    switch (permission) {
      case 'read':
        return { icon: Eye, label: '只读', color: 'text-blue-600 bg-blue-50 border-blue-200' }
      case 'write':
        return { icon: Edit3, label: '编辑', color: 'text-green-600 bg-green-50 border-green-200' }
      case 'hide':
        return { icon: EyeOff, label: '隐藏', color: 'text-gray-400 bg-gray-50 border-gray-200' }
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showClose={false}
        className="w-full sm:max-w-none sm:w-[75vw] p-0 bg-white shadow-2xl border-l border-gray-200 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <SheetTitle className="text-lg font-semibold text-gray-900">
              {mode === "edit" ? "编辑服务策略" : "添加服务策略"}
            </SheetTitle>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-8 pt-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === "basic"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <FileCode className="w-4 h-4" />
              基本信息
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("process")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === "process"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Settings className="w-4 h-4" />
              流程配置
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Tab 1: 基本信息 */}
          {activeTab === "basic" && (
            <div className="px-8 py-6 space-y-8">
              {/* Section A: 基础信息 */}
              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">基础信息</h3>
                  <span className="text-xs text-gray-400 ml-1">Basic Info</span>
                </div>

                {/* 所属目录 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    所属目录 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      <span className={selectedCategory ? "text-gray-900" : "text-gray-400"}>
                        {selectedCategory?.label || "请选择服务目录"}
                      </span>
                      <ChevronDown className={cn(
                        "w-4 h-4 text-gray-400 transition-transform",
                        categoryDropdownOpen && "rotate-180"
                      )} />
                    </button>
                    {categoryDropdownOpen && (
                      <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, categoryId: category.id })
                              setCategoryDropdownOpen(false)
                            }}
                            className={cn(
                              "w-full px-4 py-2.5 text-sm text-left hover:bg-indigo-50 transition-all",
                              formData.categoryId === category.id
                                ? "bg-indigo-50 text-indigo-600"
                                : "text-gray-700"
                            )}
                          >
                            {category.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 服务名称 & 编码 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      服务名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="例如：员工请假申请"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      服务编码 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="唯一标识，如 srv_leave_request"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono placeholder:text-gray-400 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* 图标 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">图标</label>
                  <input
                    type="text"
                    placeholder="图标类名或 URL"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* 描述 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">服务描述</label>
                  <textarea
                    rows={3}
                    placeholder="请输入服务描述..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </section>

              {/* 高级设置 - 启用开关 */}
              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">高级设置</h3>
                </div>

                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200">
                  <div>
                    <label className="text-sm font-medium text-gray-700">是否启用</label>
                    <p className="text-xs text-gray-500 mt-0.5">启用后该服务将在服务目录中显示</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.enabled}
                    onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
                    className={cn(
                      "relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                      formData.enabled ? "bg-indigo-600" : "bg-gray-300"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out",
                        formData.enabled ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* Tab 2: 流程配置 */}
          {activeTab === "process" && (
            <div className="flex h-full">
              {/* 左侧配置区域 (60%) */}
              <div className="w-[60%] border-r border-gray-100 overflow-y-auto">
                <div className="px-6 py-6 space-y-6">
                  {/* 知识源注入 - 占位保留，功能禁用 */}
                  <section className="space-y-4 opacity-60 pointer-events-none relative">
                    <div className="absolute inset-0 z-10" />
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-violet-400 to-purple-400" />
                      <h3 className="text-base font-semibold text-gray-500">知识源注入</h3>
                      <span className="text-xs text-gray-400 ml-1">Knowledge Injection</span>
                      <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-medium text-gray-400">即将推出</span>
                      </div>
                    </div>

                    {/* 文件上传区域 - 禁用状态 */}
                    <div className="relative">
                      <div className="flex flex-col items-center justify-center py-6 px-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center mb-2">
                          <FileUp className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-400 mb-1">上传业务规范文档（PDF/Word）</p>
                        <p className="text-xs text-gray-300">AI 将自动提取服务逻辑</p>
                      </div>
                    </div>
                  </section>

                  {/* 协作规范 */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-violet-500 to-purple-500" />
                        <h3 className="text-base font-semibold text-gray-900">协作规范</h3>
                        <span className="text-xs text-gray-400 ml-1">Service Script</span>
                      </div>
                      <button
                        type="button"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-medium shadow-md hover:shadow-lg hover:shadow-violet-500/25 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        AI 智能优化
                      </button>
                    </div>

                    <div className="relative rounded-xl border-2 border-gray-200 overflow-hidden bg-white transition-all focus-within:border-violet-400 focus-within:shadow-lg focus-within:shadow-violet-500/10">
                      <textarea
                        rows={6}
                        placeholder="在此定义服务的协作规范..."
                        value={formData.collaborationRules}
                        onChange={(e) => setFormData({ ...formData, collaborationRules: e.target.value })}
                        className="w-full px-4 py-3 text-sm placeholder:text-gray-400 resize-none focus:outline-none bg-white leading-relaxed font-mono"
                      />
                    </div>

                    {/* SLA 响应时限 */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">SLA 小时</label>
                      <input
                        type="text"
                        placeholder="请输入 SLA（可选）"
                        value={formData.sla}
                        onChange={(e) => setFormData({ ...formData, sla: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </section>

                  {/* 流程节点编排 */}
                  {workflowConfig && (
                    <section className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
                        <h3 className="text-base font-semibold text-gray-900">流程节点</h3>
                        <span className="text-xs text-gray-400 ml-1">Workflow Nodes</span>
                      </div>

                      {/* 流程轴 Timeline */}
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200 overflow-x-auto">
                        {workflowConfig.nodes.map((node, index) => {
                          const NodeIcon = getNodeIcon(node.type)
                          const isActive = activeNodeId === node.id
                          return (
                            <div key={node.id} className="flex items-center">
                              <button
                                type="button"
                                onClick={() => setActiveNodeId(node.id)}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap",
                                  isActive
                                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                                    : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                                )}
                              >
                                <NodeIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">{node.label}</span>
                              </button>
                              {index < workflowConfig.nodes.length - 1 && (
                                <ArrowRight className="w-4 h-4 text-gray-300 mx-1 flex-shrink-0" />
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* 字段权限矩阵 */}
                      {activeNode && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-700">
                              「{activeNode.label}」节点字段配置
                            </p>
                            <span className="text-xs text-gray-400">点击切换权限</span>
                          </div>
                          
                          <div className="rounded-xl border border-gray-200 overflow-hidden">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600">字段名称</th>
                                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600">字段 Key</th>
                                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600">类型</th>
                                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-600">权限</th>
                                </tr>
                              </thead>
                              <tbody>
                                {workflowConfig.fields.map((field) => {
                                  const currentPermission = localFieldPermissions[field.key]?.[activeNodeId!] || 'hide'
                                  const permStyle = getPermissionStyle(currentPermission)
                                  const PermIcon = permStyle.icon
                                  
                                  return (
                                    <tr key={field.key} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                                      <td className="px-4 py-3 text-sm text-gray-900">{field.label}</td>
                                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{field.key}</td>
                                      <td className="px-4 py-3">
                                        <span className="px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-600">
                                          {field.type}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                          {(['read', 'write', 'hide'] as const).map((perm) => {
                                            const style = getPermissionStyle(perm)
                                            const Icon = style.icon
                                            const isSelected = currentPermission === perm
                                            return (
                                              <button
                                                key={perm}
                                                type="button"
                                                onClick={() => updateFieldPermission(field.key, activeNodeId!, perm)}
                                                className={cn(
                                                  "flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium transition-all",
                                                  isSelected ? style.color : "border-gray-200 text-gray-400 hover:border-gray-300"
                                                )}
                                              >
                                                <Icon className="w-3 h-3" />
                                                {style.label}
                                              </button>
                                            )
                                          })}
                                        </div>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </section>
                  )}

                  {/* 提示：未导入配置时显示 */}
                  {!workflowConfig && (
                    <section className="space-y-4">
                      <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
                        <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                          <Zap className="w-7 h-7 text-amber-500" />
                        </div>
                        <p className="text-sm text-gray-600 mb-1">暂无流程配置</p>
                        <p className="text-xs text-gray-400">上传业务规范文档后，AI 将自动生成流程节点</p>
                      </div>
                    </section>
                  )}

                  {/* MCP 挂载模块 */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-cyan-500 to-blue-500" />
                        <h3 className="text-base font-semibold text-gray-900">MCP 挂载</h3>
                        <span className="text-xs text-gray-400 ml-1">Model Context Protocol</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddMCPModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-sm font-medium text-cyan-700 hover:bg-cyan-100 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        添加 MCP
                      </button>
                    </div>

                    <div className="space-y-2">
                      {mountedMCPs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                            <Plug2 className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500 mb-1">暂未挂载 MCP</p>
                          <p className="text-xs text-gray-400">点击上方按钮添加服务所需的 MCP 配置</p>
                        </div>
                      ) : (
                        mountedMCPs.map((mcp) => (
                          <div
                            key={mcp.id}
                            className="flex items-center justify-between p-3 rounded-xl border-2 border-cyan-200 bg-cyan-50/50 transition-all duration-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-500 shadow-md shadow-cyan-500/20">
                                <Plug2 className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-cyan-900">{mcp.name}</p>
                                <p className="text-xs text-gray-500">{mcp.description}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setMountedMCPs(mountedMCPs.filter(m => m.id !== mcp.id))}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  {/* 关联知识库 */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
                      <h3 className="text-base font-semibold text-gray-900">关联知识库</h3>
                      <span className="text-xs text-gray-400 ml-1">Reference Knowledge</span>
                      <div className="ml-auto">
                        <input
                          type="file"
                          id="knowledge-file-upload"
                          accept=".pdf,.doc,.docx,.txt,.md"
                          onChange={handleAddKnowledgeFile}
                          className="hidden"
                        />
                        <label
                          htmlFor="knowledge-file-upload"
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          添加
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {knowledgeLibrary.length > 0 ? (
                        knowledgeLibrary.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white hover:border-amber-200 transition-all group"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                item.type === "source" 
                                  ? "bg-gradient-to-br from-blue-500 to-indigo-500" 
                                  : "bg-gradient-to-br from-amber-400 to-orange-400"
                              )}>
                                <FileText className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-400">{item.uploadedAt}</p>
                              </div>
                            </div>
                            {item.type === "reference" && (
                              <button
                                type="button"
                                onClick={() => handleRemoveKnowledge(item.id)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
                          <FileText className="w-8 h-8 text-gray-300 mb-2" />
                          <p className="text-sm text-gray-500">暂无关联知识库</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>

              {/* 右侧预览区域 (40%) */}
              <div className="w-[40%] bg-gradient-to-br from-gray-50 to-slate-100 overflow-y-auto">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                    <h3 className="text-base font-semibold text-gray-900">实时预览</h3>
                    <span className="text-xs text-gray-400 ml-1">Live Preview</span>
                  </div>

                  {workflowConfig && activeNode ? (
                    <div className="space-y-4">
                      {/* 预览卡片 */}
                      <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200 overflow-hidden">
                        {/* 卡片头部 */}
                        <div className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <ClipboardList className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold text-sm">{formData.name || "服务名称"}</p>
                            <p className="text-white/70 text-xs">{formData.code || "service_code"}</p>
                          </div>
                          <span className="px-2 py-1 rounded-lg bg-white/20 text-white text-xs font-medium">
                            {activeNode.label}
                          </span>
                        </div>

                        {/* 卡片内容 */}
                        <div className="p-4 space-y-4">
                          {workflowConfig.fields.map((field) => {
                            const permission = localFieldPermissions[field.key]?.[activeNodeId!] || 'hide'
                            if (permission === 'hide') return null
                            
                            const mockValue = workflowConfig.mock_data?.[field.key] || ''
                            
                            return (
                              <div key={field.key} className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                                  {field.label}
                                  {permission === 'read' && (
                                    <Eye className="w-3 h-3 text-blue-400" />
                                  )}
                                  {permission === 'write' && (
                                    <Edit3 className="w-3 h-3 text-green-400" />
                                  )}
                                </label>
                                
                                {permission === 'read' ? (
                                  <div className="px-3 py-2 rounded-lg bg-gray-50 text-sm text-gray-700">
                                    {mockValue || <span className="text-gray-400 italic">暂无数据</span>}
                                  </div>
                                ) : (
                                  field.type === 'textarea' ? (
                                    <textarea
                                      rows={2}
                                      placeholder={`请输入${field.label}...`}
                                      defaultValue={mockValue}
                                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                    />
                                  ) : field.type === 'select' ? (
                                    <select 
                                      defaultValue={mockValue}
                                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                      <option value="">请选择...</option>
                                      <option value="7">7 天</option>
                                      <option value="14">14 天</option>
                                      <option value="30">30 天</option>
                                    </select>
                                  ) : (
                                    <input
                                      type="text"
                                      placeholder={`请输入${field.label}...`}
                                      defaultValue={mockValue}
                                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                  )
                                )}
                              </div>
                            )
                          })}

                          {/* 操作按钮 */}
                          <div className="flex items-center gap-2 pt-2">
                            {activeNode.type === 'start' && (
                              <button className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all">
                                提交申请
                              </button>
                            )}
                            {activeNode.type === 'approval' && (
                              <>
                                <button className="flex-1 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-all">
                                  同意
                                </button>
                                <button className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all">
                                  驳回
                                </button>
                              </>
                            )}
                            {activeNode.type === 'processing' && (
                              <button className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all">
                                完成处理
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 卡片底部 - MCP 提示 */}
                        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                          <Plug2 className="w-3.5 h-3.5 text-cyan-500" />
                          <span className="text-xs text-gray-500">Auto-linked: DB_Query_Tool</span>
                        </div>
                      </div>

                      {/* 用户信息卡片 */}
                      <div className="bg-white rounded-xl p-3 border border-gray-200 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">张三</p>
                          <p className="text-xs text-gray-500">技术部 · 高级工程师</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
                        <Eye className="w-8 h-8 text-indigo-400" />
                      </div>
                      <p className="text-sm text-gray-600 mb-1">预览区域</p>
                      <p className="text-xs text-gray-400">导入配置并选择节点后，将在此显示卡片预览</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="bg-white border-t border-gray-100">
          {validationError && (
            <div className="px-8 py-3 bg-red-50 border-b border-red-100 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-sm text-red-600">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="font-medium">{validationError}</span>
              </div>
            </div>
          )}
          
          <div className="px-8 py-4 bg-white/80 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>最后保存: 刚刚</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
              >
                重置
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all"
              >
                {mode === "edit" ? "保存修改" : "创建服务"}
              </button>
            </div>
          </div>
        </div>
      </SheetContent>

      {/* 替换文档二次确认对话框 */}
      <AlertDialog open={showReplaceConfirm} onOpenChange={setShowReplaceConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认替换文档？</AlertDialogTitle>
            <AlertDialogDescription>
              替换文档后，下方已编辑过的"协作规范"配置将被新生成的内容覆盖。此操作不可撤销，请确认是否继续。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReplaceDocument}
              className="bg-red-600 hover:bg-red-700"
            >
              确认替换
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 添加 MCP Modal */}
      <Dialog open={showAddMCPModal} onOpenChange={setShowAddMCPModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plug2 className="w-5 h-5 text-cyan-500" />
              添加 MCP 配置
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              选择系统可用的 MCP 或手动配置自定义 MCP。
            </p>

            {/* 系统 MCP 快速选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">系统可用 MCP</label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_SYSTEM_MCPS.filter(
                  sysMcp => !mountedMCPs.some(m => m.id === sysMcp.id)
                ).map((sysMcp) => (
                  <button
                    key={sysMcp.id}
                    type="button"
                    onClick={() => {
                      setMountedMCPs([...mountedMCPs, {
                        id: sysMcp.id,
                        name: sysMcp.name,
                        description: sysMcp.description
                      }])
                      setShowAddMCPModal(false)
                    }}
                    className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-cyan-300 hover:bg-cyan-50 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                      <Plug2 className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{sysMcp.name}</p>
                      <p className="text-xs text-gray-500 truncate">{sysMcp.description}</p>
                    </div>
                  </button>
                ))}
              </div>
              {AVAILABLE_SYSTEM_MCPS.filter(
                sysMcp => !mountedMCPs.some(m => m.id === sysMcp.id)
              ).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">所有系统 MCP 已挂载</p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">或手动配置</span>
              </div>
            </div>

            {/* 手动配置 */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">MCP 名称</label>
                <input
                  type="text"
                  value={newMCPForm.name}
                  onChange={(e) => setNewMCPForm({ ...newMCPForm, name: e.target.value })}
                  placeholder="例如：自定义API接口"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">描述</label>
                <input
                  type="text"
                  value={newMCPForm.description}
                  onChange={(e) => setNewMCPForm({ ...newMCPForm, description: e.target.value })}
                  placeholder="简要描述 MCP 功能"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">配置参数（JSON，可选）</label>
                <textarea
                  rows={3}
                  value={newMCPForm.config}
                  onChange={(e) => setNewMCPForm({ ...newMCPForm, config: e.target.value })}
                  placeholder='{"endpoint": "https://...", "apiKey": "..."}'
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-mono resize-none"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setShowAddMCPModal(false)
                setNewMCPForm({ name: "", description: "", config: "" })
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => {
                if (newMCPForm.name.trim()) {
                  setMountedMCPs([...mountedMCPs, {
                    id: "custom-" + Date.now(),
                    name: newMCPForm.name,
                    description: newMCPForm.description || "自定义 MCP",
                    config: newMCPForm.config
                  }])
                  setShowAddMCPModal(false)
                  setNewMCPForm({ name: "", description: "", config: "" })
                }
              }}
              disabled={!newMCPForm.name.trim()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-sm font-medium text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              添加配置
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  )
}
