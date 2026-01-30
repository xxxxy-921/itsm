"use client"

import { useState, useEffect } from "react"
import {
  X,
  Wand2,
  Bold,
  Italic,
  Link,
  List,
  ChevronDown,
  Sparkles,
  Clock,
  Plus,
  FileText,
  Trash2,
  Upload,
  Cloud,
  Paperclip,
  FileUp,
  Loader2,
  CheckCircle2,
  Brain,
  AlertTriangle,
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
import { MermaidViewer } from "./mermaid-viewer"
import { convertCotToMermaid } from "@/lib/cot-to-mermaid"
import { cn } from "@/lib/utils"

// Skills 和 MCP 类型定义
interface Skill {
  id: string
  name: string
  description: string
  category: string
}

interface MCPServer {
  id: string
  name: string
  description: string
  protocol: string
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
]

// Mock 可用的 Skills 列表
const AVAILABLE_SKILLS: Skill[] = [
  { id: "skill-1", name: "check_leave_balance", description: "查询员工的年假余额", category: "hr" },
  { id: "skill-2", name: "submit_leave_request", description: "提交请假申请到审批流程", category: "hr" },
  { id: "skill-3", name: "query_approval_status", description: "查询审批状态", category: "hr" },
  { id: "skill-4", name: "send_notification", description: "发送通知给相关人员", category: "office" },
  { id: "skill-5", name: "create_calendar_event", description: "创建日历事件", category: "office" },
]

// Mock 可用的 MCP Servers 列表
const AVAILABLE_MCP_SERVERS: MCPServer[] = [
  { id: "mcp-1", name: "HR System MCP", description: "连接 HR 系统的 MCP 服务", protocol: "stdio" },
  { id: "mcp-2", name: "Calendar MCP", description: "日历系统集成", protocol: "http" },
  { id: "mcp-3", name: "Notification MCP", description: "通知服务", protocol: "stdio" },
]

// Mock Agent 模型列表
const AGENT_MODELS = [
  { id: "gpt-4", name: "GPT-4", description: "强大的通用模型" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "快速响应模型" },
  { id: "claude-3", name: "Claude 3", description: "Anthropic 的 Claude 模型" },
]

// Mock DSPy AI 分析返回的数据
const MOCK_AI_ANALYSIS_RESULT = {
  sla: "8", // 从文档中提取的 SLA 时间（小时）
  collaboration_norms: `【服务标准定义】
1. SLA承诺：标准响应时间 8小时，解决时间 24小时。
2. 审批流程：
   - 申请人提交 -> 直属经理审批 (Level 1) -> HR 备案 (Level 2)
   - 若请假时长 > 3天，需增加部门总监审批。

【表单字段约束】
1. 必须采集字段：
   - 请假类型 (Select: 事假/病假/年假)
   - 开始时间 & 结束时间 (DateRange)
   - 紧急联系人 (Text)
2. 校验规则：结束时间必须晚于开始时间；病假需上传证明附件。`,
  
  agent_cot_instructions: `你现在是企业HR服务助手，正在处理用户的"请假申请"请求。

【思维链/执行策略】
1. Phase 1 - 意图确认与资格检查：
   - 首先询问用户具体的请假类型。
   - [Check] 如果用户选择"年假"，先在后台调用 \`check_leave_balance\` API 查询其余额。如果余额不足，委婉拒绝并建议调休。

2. Phase 2 - 信息槽位填充 (Slot Filling)：
   - 引导用户提供起止日期。注意：如果用户只说了"明天"，请反问具体的恢复工作日期。
   - 询问是否有工作交接人。

3. Phase 3 - 提交与反馈：
   - 在收集完所有字段后，向用户展示完整的申请摘要。
   - 获得用户确认后，调用 \`submit_leave_request\` 工具。
   - 告知用户审批链接已发送给其直属经理。`
}

// Rich Text Editor Toolbar Component
function RichTextToolbar() {
  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 bg-white rounded-t-xl">
      <button
        type="button"
        className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
      >
        <Link className="w-4 h-4" />
      </button>
      <button
        type="button"
        className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  )
}

export function CreateServiceDrawer({ open, onOpenChange, mode = "create", editingService }: CreateServiceDrawerProps) {
  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    code: "",
    icon: "",
    sla: "",
    description: "",
    collaborationRules: "",
    infoCollectionPrompt: "",
    enabled: true,
  })
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // 新增状态：文档上传 & AI 分析
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [aiAnalyzedSuccessfully, setAiAnalyzedSuccessfully] = useState(false) // 标记AI是否识别成功
  const [showReplaceUpload, setShowReplaceUpload] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false)
  const [mermaidZoom, setMermaidZoom] = useState(1) // Mermaid 缩放级别

  // Agent 配置相关状态
  const [agentModel, setAgentModel] = useState<string>("gpt-4")
  const [agentConfigExpanded, setAgentConfigExpanded] = useState(false) // 控制 Agent 配置区域展开/收起
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]) // 已选择的 Skills
  const [selectedMCPs, setSelectedMCPs] = useState<string[]>([]) // 已选择的 MCP Servers
  const [aiRecommendedSkills, setAiRecommendedSkills] = useState<string[]>([]) // AI 推荐的 Skills
  const [aiRecommendedMCPs, setAiRecommendedMCPs] = useState<string[]>([]) // AI 推荐的 MCPs
  const [recommendationSource, setRecommendationSource] = useState<'ai' | 'manual' | 'mixed'>('manual') // 推荐来源
  const [showSkillSelector, setShowSkillSelector] = useState(false) // 显示手动选择 Skills 对话框
  const [showMCPSelector, setShowMCPSelector] = useState(false) // 显示手动选择 MCP 对话框

  // 知识库挂载列表
  const [knowledgeLibrary, setKnowledgeLibrary] = useState<Array<{
    id: string
    name: string
    type: "source" | "reference"
    uploadedAt: string
  }>>([])
  const [showAddKnowledge, setShowAddKnowledge] = useState(false)
  const [newKnowledgeFile, setNewKnowledgeFile] = useState<File | null>(null)

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
        infoCollectionPrompt: editingService.infoCollectionPrompt || "",
        enabled: true,
      })
      
      // 如果有已上传的文档，初始化知识库列表
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
      // 创建模式：重置所有状态
      setFormData({
        categoryId: "",
        name: "",
        code: "",
        icon: "",
        sla: "",
        description: "",
        collaborationRules: "",
        infoCollectionPrompt: "",
        enabled: true,
      })
      setUploadedFile(null)
      setUploadProgress(0)
      setHasAnalyzed(false)
      setShowReplaceUpload(false)
      setKnowledgeLibrary([])
    }
  }, [editingService, open])

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setHasAnalyzed(false)
      // 模拟上传进度
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
    // 显示二次确认对话框
    setShowReplaceConfirm(true)
  }

  // 确认替换文档
  const confirmReplaceDocument = () => {
    setShowReplaceUpload(true)
    setUploadedFile(null)
    setUploadProgress(0)
    setHasAnalyzed(false)
    setAnalysisError(null)
    // 只移除源文档，保留参考文档
    setKnowledgeLibrary(knowledgeLibrary.filter(doc => doc.type !== "source"))
    // 清空配置
    setFormData({
      ...formData,
      collaborationRules: "",
      infoCollectionPrompt: "",
      sla: "",
    })
    setShowReplaceConfirm(false)
  }

  // AI 智能识别与生成
  const handleAIAnalyze = async () => {
    if (!uploadedFile) return
    
    setIsAnalyzing(true)
    setAnalysisError(null)
    
    // 模拟 DSPy 编译过程 1.5秒
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    // 模拟 20% 的概率识别失败（用于演示异常处理）
    const shouldFail = Math.random() < 0.2
    
    if (shouldFail) {
      // 识别失败场景
      setAnalysisError("无法解析文档结构，请检查是否为加密 PDF 或图片扫描件。")
      setIsAnalyzing(false)
      return
    }
    
    // 自动填充 SLA 和 Agent 配置
    setFormData({
      ...formData,
      sla: MOCK_AI_ANALYSIS_RESULT.sla, // 从文档中提取的 SLA 回填
      collaborationRules: MOCK_AI_ANALYSIS_RESULT.collaboration_norms,
      infoCollectionPrompt: MOCK_AI_ANALYSIS_RESULT.agent_cot_instructions,
    })
    
    // 将源文档加入知识库列表
    const sourceDoc = {
      id: "source-doc-" + Date.now(),
      name: uploadedFile.name,
      type: "source" as const,
      uploadedAt: new Date().toLocaleString(),
    }
    setKnowledgeLibrary([sourceDoc])
    
    // AI 推荐 Skills 和 MCP（模拟）
    const recommendedSkills = ["skill-1", "skill-2", "skill-3"] // check_leave_balance, submit_leave_request, query_approval_status
    const recommendedMCPs = ["mcp-1"] // HR System MCP
    
    setAiRecommendedSkills(recommendedSkills)
    setAiRecommendedMCPs(recommendedMCPs)
    setSelectedSkills(recommendedSkills) // 自动选中 AI 推荐的
    setSelectedMCPs(recommendedMCPs)
    setRecommendationSource('ai')
    
    // 【关键】路径1：AI 识别成功 -> 自动展开 Agent 配置区域
    setAgentConfigExpanded(true)
    
    setIsAnalyzing(false)
    setHasAnalyzed(true)
    setAiAnalyzedSuccessfully(true) // 标记AI识别成功
    setShowReplaceUpload(false)
  }

  // 跳过 AI 生成，手动填写
  const handleSkipAI = () => {
    setAnalysisError(null)
    setHasAnalyzed(true)
    setAiAnalyzedSuccessfully(false) // 跳过AI，不显示识别成功提示
    // 清空自动填充的内容，让用户手动填写
    setFormData({
      ...formData,
      collaborationRules: "",
      infoCollectionPrompt: "",
    })
    
    // 【关键】路径2：跳过 AI -> 也展开 Agent 配置区域，提示用户手动配置
    setAgentConfigExpanded(true)
    setRecommendationSource('manual')
  }

  // 手动添加 Skill
  const handleAddSkill = (skillId: string) => {
    if (!selectedSkills.includes(skillId)) {
      setSelectedSkills([...selectedSkills, skillId])
      // 如果之前是纯 AI 推荐，现在变成混合模式
      if (recommendationSource === 'ai') {
        setRecommendationSource('mixed')
      }
    }
  }

  // 移除 Skill
  const handleRemoveSkill = (skillId: string) => {
    setSelectedSkills(selectedSkills.filter(id => id !== skillId))
  }

  // 手动添加 MCP
  const handleAddMCP = (mcpId: string) => {
    if (!selectedMCPs.includes(mcpId)) {
      setSelectedMCPs([...selectedMCPs, mcpId])
      // 如果之前是纯 AI 推荐，现在变成混合模式
      if (recommendationSource === 'ai') {
        setRecommendationSource('mixed')
      }
    }
  }

  // 移除 MCP
  const handleRemoveMCP = (mcpId: string) => {
    setSelectedMCPs(selectedMCPs.filter(id => id !== mcpId))
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
      setNewKnowledgeFile(null)
      setShowAddKnowledge(false)
    }
  }

  // 删除知识库文档
  const handleRemoveKnowledge = (id: string) => {
    setKnowledgeLibrary(knowledgeLibrary.filter((item) => item.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证必填字段
    if (!formData.categoryId) {
      setValidationError("请选择所属目录")
      setTimeout(() => setValidationError(null), 3000)
      return
    }
    if (!formData.name.trim()) {
      setValidationError("请输入服务名称")
      setTimeout(() => setValidationError(null), 3000)
      return
    }
    if (!formData.code.trim()) {
      setValidationError("请输入服务编码")
      setTimeout(() => setValidationError(null), 3000)
      return
    }
    
    console.log("Save service:", {
      ...formData,
      knowledgeLibrary, // 包含知识库列表
    })
    setValidationError(null)
    onOpenChange(false)
  }

  const handleReset = () => {
    if (mode === "edit" && editingService) {
      // 编辑模式：恢复到初始值
      setFormData({
        categoryId: editingService.category,
        name: editingService.title,
        code: editingService.code,
        icon: editingService.icon || "",
        description: editingService.description,
        sla: editingService.sla.replace('h', ''),
        collaborationRules: editingService.collaborationRules || "",
        infoCollectionPrompt: editingService.infoCollectionPrompt || "",
        enabled: true,
      })
    } else {
      // 创建模式：清空表单
      setFormData({
        categoryId: "",
        name: "",
        code: "",
        icon: "",
        sla: "",
        description: "",
        collaborationRules: "",
        infoCollectionPrompt: "",
        enabled: true,
      })
    }
  }

  const selectedCategory = categories.find((c) => c.id === formData.categoryId)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showClose={false}
        className="w-full sm:max-w-none sm:w-[65vw] p-0 bg-white shadow-2xl border-l border-gray-200 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <SheetTitle className="text-lg font-semibold text-gray-900">
              {mode === "edit" ? "编辑服务策略" : "添加服务策略"}
            </SheetTitle>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body - 统一的流式长页面 */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 space-y-8">
              {/* Section A: 基础信息 (Basic Info) */}
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

                {/* 服务名称 & 编码 - Grid Layout */}
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
                  <label className="text-sm font-medium text-gray-700">
                    图标
                  </label>
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
                  <label className="text-sm font-medium text-gray-700">
                    服务描述
                  </label>
                  <textarea
                    rows={3}
                    placeholder="请输入服务描述..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </section>

              {/* 高级设置 - 提前到顶部便于快速访问 */}
              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">高级设置</h3>
                </div>

                {/* 是否启用 - Toggle Switch */}
                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      是否启用
                    </label>
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

              {/* Section B: 知识源注入 (Knowledge Injection) - 【新增核心区域】 */}
              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-violet-500 to-purple-500" />
                  <h3 className="text-base font-semibold text-gray-900">知识源注入</h3>
                  <span className="text-xs text-gray-400 ml-1">Knowledge Injection</span>
                  <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                    <span className="text-xs font-medium text-violet-600">AI Powered</span>
                  </div>
                </div>

                {/* 编辑模式下：已上传文件卡片 */}
                {mode === "edit" && editingService?.uploadedDocument && !showReplaceUpload ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20 flex-shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {editingService.uploadedDocument.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          上传于: {editingService.uploadedDocument.uploadedAt}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleReplaceDocument}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex-shrink-0"
                      >
                        <Upload className="w-4 h-4" />
                        替换并重新识别
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 flex items-start gap-1.5">
                      <span className="text-blue-500 font-bold mt-0.5">💡</span>
                      <span>源文档已自动加入知识库，如需重新生成配置，请点击"替换并重新识别"按钮</span>
                    </p>
                  </div>
                ) : (
                  <>
                    {/* 文件上传区域 */}
                    <div className="relative">
                      <input
                        type="file"
                        id="document-upload"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="document-upload"
                        className={cn(
                          "flex flex-col items-center justify-center py-8 px-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer",
                          uploadedFile
                            ? "border-blue-300 bg-blue-50/30"
                            : "border-gray-200 bg-gradient-to-br from-blue-50/30 to-indigo-50/20 hover:border-blue-300 hover:bg-blue-50/50"
                        )}
                      >
                        {!uploadedFile ? (
                          <>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/20">
                              <FileUp className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                上传业务规范文档（PDF/Word）
                              </p>
                              <p className="text-xs text-gray-500">
                                AI 将自动提取服务逻辑
                              </p>
                            </div>
                            <div className="mt-4 px-4 py-2 rounded-lg bg-white border border-gray-200 text-xs text-gray-600">
                              点击上传或拖拽文件至此区域
                            </div>
                          </>
                        ) : (
                          <div className="w-full">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900 mb-1">
                                  {uploadedFile.name}
                                </p>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                                      style={{ width: `${uploadProgress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-green-600">
                                    {uploadProgress}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* AI 智能识别按钮 */}
                    <div className="flex justify-center gap-3">
                      {/* 只在未识别时显示AI识别按钮 */}
                      {!hasAnalyzed && (
                        <button
                          type="button"
                          onClick={handleAIAnalyze}
                          disabled={!uploadedFile || uploadProgress < 100 || isAnalyzing}
                          className={cn(
                            "group relative px-6 py-2.5 rounded-xl font-semibold text-white shadow-lg transition-all duration-300",
                            uploadedFile && uploadProgress === 100 && !isAnalyzing
                              ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {isAnalyzing ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>AI 正在分析文档...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                <span>AI 智能识别与生成</span>
                              </>
                            )}
                          </div>
                          {uploadedFile && uploadProgress === 100 && !isAnalyzing && !hasAnalyzed && (
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
                          )}
                        </button>
                      )}
                      
                      {/* 路径3：跳过知识来源，直接进入手动配置 */}
                      {!hasAnalyzed && !uploadedFile && (
                        <button
                          type="button"
                          onClick={() => {
                            setHasAnalyzed(true)
                            setAgentConfigExpanded(true)
                            setRecommendationSource('manual')
                          }}
                          className="px-6 py-2.5 rounded-xl font-semibold bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-gray-200"
                        >
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            <span>跳过知识来源，手动配置</span>
                          </div>
                        </button>
                      )}
                      
                      {/* 识别完成后显示重新上传按钮 */}
                      {hasAnalyzed && !analysisError && (
                        <button
                          type="button"
                          onClick={handleReplaceDocument}
                          className="px-6 py-2.5 rounded-xl font-semibold bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            <span>重新上传并识别</span>
                          </div>
                        </button>
                      )}
                    </div>

                    {/* 识别提示 - 只在AI识别成功时显示 */}
                    {hasAnalyzed && !analysisError && aiAnalyzedSuccessfully && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-900 mb-1">
                            AI 识别完成
                          </p>
                          <p className="text-xs text-green-700">
                            已自动填充 SLA 时间（{MOCK_AI_ANALYSIS_RESULT.sla}小时）和 Agent 配置内容，您可以根据需要修改
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 识别失败提示 */}
                    {analysisError && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertTriangle className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-red-900 mb-1">
                            文档识别失败
                          </p>
                          <p className="text-xs text-red-700 mb-3">
                            {analysisError}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleAIAnalyze}
                              className="px-3 py-1.5 rounded-lg bg-white border border-red-200 text-xs font-medium text-red-700 hover:bg-red-50 transition-all"
                            >
                              重试识别
                            </button>
                            <button
                              type="button"
                              onClick={handleSkipAI}
                              className="px-3 py-1.5 rounded-lg bg-red-600 text-xs font-medium text-white hover:bg-red-700 transition-all"
                            >
                              跳过 AI，手动填写
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}  
              </section>

              {/* Section B1: Agent 配置 - 动态展开区域 */}
              {agentConfigExpanded && (
                <section className="space-y-5 animate-in slide-in-from-top-2 duration-500">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-violet-500 to-purple-500" />
                    <h3 className="text-base font-semibold text-gray-900">Agent 配置</h3>
                    <span className="text-xs text-gray-400 ml-1">Agent Configuration</span>
                    <Brain className="w-4 h-4 text-violet-500 ml-1" />
                    {recommendationSource === 'ai' && (
                      <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
                        <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                        <span className="text-xs font-medium text-violet-600">AI 推荐</span>
                      </div>
                    )}
                    {recommendationSource === 'mixed' && (
                      <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-medium text-blue-600">AI + 手动</span>
                      </div>
                    )}
                  </div>

                  {/* 协作规范 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        协作规范
                      </label>
                      <span className="text-xs text-gray-400">Collaboration Norms</span>
                    </div>
                    <div className="relative rounded-xl border-2 border-gray-200 overflow-hidden bg-white transition-all focus-within:border-violet-400 focus-within:shadow-lg focus-within:shadow-violet-500/10">
                      <textarea
                        rows={8}
                        placeholder="定义审批流、SLA 细节、必填字段约束...&#10;&#10;提示：点击上方 'AI 智能识别' 按钮自动生成"
                        value={formData.collaborationRules}
                        onChange={(e) => setFormData({ ...formData, collaborationRules: e.target.value })}
                        className="w-full px-4 py-3 text-sm placeholder:text-gray-400 resize-none focus:outline-none bg-white leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* 信息采集提示 (Agent CoT Instructions) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        信息采集提示
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Agent CoT Instructions</span>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-100 border border-violet-200">
                          <Sparkles className="w-3 h-3 text-violet-600" />
                          <span className="text-xs font-medium text-violet-600">思维链</span>
                        </div>
                      </div>
                    </div>

                    {/* 左右并排布局：文本编辑器 + 流程图预览 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* 左侧：文本编辑器 */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600">文本编辑</label>
                        <div className="relative rounded-xl border-2 border-gray-200 overflow-hidden bg-white transition-all focus-within:border-violet-400 focus-within:shadow-lg focus-within:shadow-violet-500/10" style={{ height: '480px' }}>
                          <textarea
                            placeholder="定义 Agent 的思维链和对话策略...&#10;&#10;提示：点击上方 'AI 智能识别' 按钮自动生成"
                            value={formData.infoCollectionPrompt}
                            onChange={(e) => setFormData({ ...formData, infoCollectionPrompt: e.target.value })}
                            className="w-full h-full px-4 py-3 text-sm placeholder:text-gray-400 resize-none focus:outline-none bg-white leading-relaxed"
                          />
                        </div>
                      </div>

                      {/* 右侧：流程图预览 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-gray-600">流程图预览</label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setMermaidZoom(Math.max(0.5, mermaidZoom - 0.1))}
                              disabled={mermaidZoom <= 0.5}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                              title="缩小"
                            >
                              <span className="text-lg font-bold">−</span>
                            </button>
                            <span className="text-xs text-gray-500 min-w-[3rem] text-center">
                              {Math.round(mermaidZoom * 100)}%
                            </span>
                            <button
                              type="button"
                              onClick={() => setMermaidZoom(Math.min(2, mermaidZoom + 0.1))}
                              disabled={mermaidZoom >= 2}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                              title="放大"
                            >
                              <span className="text-lg font-bold">+</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setMermaidZoom(1)}
                              className="px-2 py-1 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-all"
                              title="重置"
                            >
                              重置
                            </button>
                          </div>
                        </div>
                        <div className="rounded-xl border-2 border-gray-200 bg-gray-50 overflow-auto" style={{ height: '480px' }}>
                          {formData.infoCollectionPrompt ? (
                            <div className="p-6 min-h-full flex items-center justify-center">
                              <div style={{ transform: `scale(${mermaidZoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }}>
                                <MermaidViewer 
                                  chart={convertCotToMermaid(formData.infoCollectionPrompt)}
                                  className="mermaid-container"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full py-12">
                              <Brain className="w-12 h-12 text-violet-300 mb-4" />
                              <p className="text-sm text-gray-500">暂无思维链配置</p>
                              <p className="text-xs text-gray-400 mt-1">在左侧文本编辑器中添加内容后即可查看流程图</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 flex items-start gap-1.5 mt-2">
                      <span className="text-indigo-500 font-bold mt-0.5">💡</span>
                      <span>AI 将基于此配置进行推理，引导用户完成信息采集并自动执行对应的服务流程</span>
                    </p>
                  </div>

                  {/* Skills 挂载 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Skills 挂载
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowSkillSelector(!showSkillSelector)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-200 text-sm font-medium text-violet-700 hover:bg-violet-100 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        添加 Skill
                      </button>
                    </div>

                    {/* 已选择的 Skills */}
                    {selectedSkills.length > 0 ? (
                      <div className="space-y-2">
                        {selectedSkills.map((skillId) => {
                          const skill = AVAILABLE_SKILLS.find(s => s.id === skillId)
                          if (!skill) return null
                          const isAIRecommended = aiRecommendedSkills.includes(skillId)
                          
                          return (
                            <div
                              key={skillId}
                              className="flex items-center justify-between p-3 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50/50 to-purple-50/30 hover:border-violet-300 transition-all group"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                  <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-gray-900">
                                      {skill.name}
                                    </p>
                                    {isAIRecommended && (
                                      <span className="px-2 py-0.5 rounded-md bg-violet-100 border border-violet-200 text-xs font-medium text-violet-700 flex-shrink-0">
                                        AI 推荐
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {skill.description}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(skillId)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
                        <Sparkles className="w-10 h-10 text-gray-300 mb-2" />
                        <p className="text-sm text-gray-600">暂未挂载 Skills</p>
                        <p className="text-xs text-gray-400 mt-1">点击"添加 Skill"按钮选择</p>
                      </div>
                    )}

                    {/* Skill 选择器 */}
                    {showSkillSelector && (
                      <div className="p-4 rounded-xl border-2 border-violet-200 bg-violet-50/30 space-y-2 animate-in slide-in-from-top-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">选择要添加的 Skills</span>
                          <button
                            type="button"
                            onClick={() => setShowSkillSelector(false)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            收起
                          </button>
                        </div>
                        {AVAILABLE_SKILLS.map((skill) => (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() => {
                              handleAddSkill(skill.id)
                              setShowSkillSelector(false)
                            }}
                            disabled={selectedSkills.includes(skill.id)}
                            className={cn(
                              "w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all",
                              selectedSkills.includes(skill.id)
                                ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "border-violet-200 bg-white hover:border-violet-300 hover:bg-violet-50"
                            )}
                          >
                            <div>
                              <p className="text-sm font-medium">{skill.name}</p>
                              <p className="text-xs text-gray-500">{skill.description}</p>
                            </div>
                            {selectedSkills.includes(skill.id) && (
                              <CheckCircle2 className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* MCP Servers 挂载 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        MCP Servers 挂载
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowMCPSelector(!showMCPSelector)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-200 text-sm font-medium text-violet-700 hover:bg-violet-100 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        添加 MCP
                      </button>
                    </div>

                    {/* 已选择的 MCPs */}
                    {selectedMCPs.length > 0 ? (
                      <div className="space-y-2">
                        {selectedMCPs.map((mcpId) => {
                          const mcp = AVAILABLE_MCP_SERVERS.find(m => m.id === mcpId)
                          if (!mcp) return null
                          const isAIRecommended = aiRecommendedMCPs.includes(mcpId)
                          
                          return (
                            <div
                              key={mcpId}
                              className="flex items-center justify-between p-3 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50/50 to-purple-50/30 hover:border-violet-300 transition-all group"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                  <Cloud className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-gray-900">
                                      {mcp.name}
                                    </p>
                                    {isAIRecommended && (
                                      <span className="px-2 py-0.5 rounded-md bg-violet-100 border border-violet-200 text-xs font-medium text-violet-700 flex-shrink-0">
                                        AI 推荐
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {mcp.description} · {mcp.protocol}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveMCP(mcpId)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
                        <Cloud className="w-10 h-10 text-gray-300 mb-2" />
                        <p className="text-sm text-gray-600">暂未挂载 MCP Servers</p>
                        <p className="text-xs text-gray-400 mt-1">点击"添加 MCP"按钮选择</p>
                      </div>
                    )}

                    {/* MCP 选择器 */}
                    {showMCPSelector && (
                      <div className="p-4 rounded-xl border-2 border-violet-200 bg-violet-50/30 space-y-2 animate-in slide-in-from-top-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">选择要添加的 MCP Servers</span>
                          <button
                            type="button"
                            onClick={() => setShowMCPSelector(false)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            收起
                          </button>
                        </div>
                        {AVAILABLE_MCP_SERVERS.map((mcp) => (
                          <button
                            key={mcp.id}
                            type="button"
                            onClick={() => {
                              handleAddMCP(mcp.id)
                              setShowMCPSelector(false)
                            }}
                            disabled={selectedMCPs.includes(mcp.id)}
                            className={cn(
                              "w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all",
                              selectedMCPs.includes(mcp.id)
                                ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "border-violet-200 bg-white hover:border-violet-300 hover:bg-violet-50"
                            )}
                          >
                            <div>
                              <p className="text-sm font-medium">{mcp.name}</p>
                              <p className="text-xs text-gray-500">{mcp.description} · {mcp.protocol}</p>
                            </div>
                            {selectedMCPs.includes(mcp.id) && (
                              <CheckCircle2 className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 提示信息 */}
                  {recommendationSource === 'ai' && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200">
                      <Sparkles className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-violet-900 mb-1">
                          AI 已自动挂载推荐的 Skills 和 MCP
                        </p>
                        <p className="text-xs text-violet-700">
                          基于文档内容分析，这些工具可以帮助 Agent 完成服务流程。您可以手动调整。
                        </p>
                      </div>
                    </div>
                  )}
                  {recommendationSource === 'manual' && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
                      <Brain className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          手动配置模式
                        </p>
                        <p className="text-xs text-blue-700">
                          请手动选择需要挂载的 Skills 和 MCP Servers，并配置 Agent 的协作规范和思维链指令。
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* SLA 时间 - 单独区域 */}
              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
                  <h3 className="text-base font-semibold text-gray-900">SLA 时间</h3>
                  <span className="text-xs text-gray-400 ml-1">Service Level Agreement</span>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    响应时限
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="请输入 SLA 响应时限"
                      value={formData.sla}
                      onChange={(e) => setFormData({ ...formData, sla: e.target.value })}
                      className="w-full px-4 py-2.5 pr-14 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      小时
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    AI 识别后会自动填充，您也可以手动修改
                  </p>
                </div>
              </section>

              {/* Section E: 关联知识库 (Reference Knowledge) - 【新增区域】 */}
              <section className="space-y-5">
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
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      添加文档
                    </label>
                  </div>
                </div>

                <p className="text-xs text-gray-500 -mt-2">
                  这些文档将用于 RAG 检索增强，不会触发 DSPy 流程生成。源文档已自动加入列表。
                </p>

                {/* 知识库列表 */}
                <div className="space-y-3">
                  {knowledgeLibrary.length > 0 ? (
                    knowledgeLibrary.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-amber-200 hover:bg-amber-50/30 transition-all group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                            item.type === "source" 
                              ? "bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/20" 
                              : "bg-gradient-to-br from-amber-400 to-orange-400 shadow-lg shadow-amber-500/20"
                          )}>
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.name}
                              </p>
                              {item.type === "source" && (
                                <span className="px-2 py-0.5 rounded-md bg-blue-100 border border-blue-200 text-xs font-medium text-blue-700 flex-shrink-0">
                                  源文档
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              上传于: {item.uploadedAt}
                            </p>
                          </div>
                        </div>
                        {item.type === "reference" && (
                          <button
                            type="button"
                            onClick={() => handleRemoveKnowledge(item.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
                      <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                        <FileText className="w-7 h-7 text-amber-500" />
                      </div>
                      <p className="text-sm text-gray-600 mb-1">暂无关联知识库</p>
                      <p className="text-xs text-gray-400">完成 AI 识别后，源文档将自动加入此列表</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

        {/* Sticky Footer */}
        <div className="bg-white border-t border-gray-100">
          {/* Validation Error Toast */}
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
              替换文档后，下方已编辑过的"协作规范"和"思维链指令"配置将被新生成的内容覆盖。此操作不可撤销，请确认是否继续。
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
    </Sheet>
  )
}
