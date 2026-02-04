"use client"

import { useState, useEffect } from "react"
import {
  X,
  Bot,
  Save,
  Power,
  PowerOff,
  Brain,
  Thermometer,
  Sparkles,
  ChevronDown,
  Type,
  Settings2,
  RotateCcw,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Agent } from "./agent-management"

interface AgentEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: Agent | null
  isCreating: boolean
  onSave: (agent: Agent) => void
}

// 可选模型列表
const AVAILABLE_MODELS = [
  { id: "gpt-4", name: "GPT-4", description: "OpenAI 最强大的模型" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "快速版 GPT-4" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "快速响应，成本更低" },
  { id: "claude-3", name: "Claude 3", description: "Anthropic Claude 3" },
  { id: "claude-3-opus", name: "Claude 3 Opus", description: "最强大的 Claude 模型" },
  { id: "deepseek-v3", name: "DeepSeek V3", description: "DeepSeek 最新模型" },
]

const defaultAgent: Omit<Agent, "id"> = {
  name: "",
  description: "",
  version: "v1.0",
  enabled: true,
  prompt: "",
  model: "gpt-4",
  temperature: 0.7,
  skill_selection_model: "gpt-4",
  title_generation_model: "gpt-3.5-turbo",
  createdAt: new Date().toISOString().split("T")[0],
  updatedAt: new Date().toISOString().split("T")[0],
}

export function AgentEditDrawer({ 
  open, 
  onOpenChange, 
  agent, 
  isCreating, 
  onSave 
}: AgentEditDrawerProps) {
  const [formData, setFormData] = useState<Omit<Agent, "id">>({ ...defaultAgent })
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
  const [skillModelDropdownOpen, setSkillModelDropdownOpen] = useState(false)
  const [titleModelDropdownOpen, setTitleModelDropdownOpen] = useState(false)

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        description: agent.description,
        version: agent.version,
        enabled: agent.enabled,
        prompt: agent.prompt,
        model: agent.model,
        temperature: agent.temperature,
        skill_selection_model: agent.skill_selection_model,
        title_generation_model: agent.title_generation_model,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
      })
    } else {
      setFormData({ ...defaultAgent })
    }
  }, [agent, open])

  const handleSubmit = () => {
    const savedAgent: Agent = {
      id: agent?.id || "new",
      ...formData,
      updatedAt: new Date().toISOString().split("T")[0],
    }
    onSave(savedAgent)
  }

  const handleReset = () => {
    if (agent) {
      setFormData({
        name: agent.name,
        description: agent.description,
        version: agent.version,
        enabled: agent.enabled,
        prompt: agent.prompt,
        model: agent.model,
        temperature: agent.temperature,
        skill_selection_model: agent.skill_selection_model,
        title_generation_model: agent.title_generation_model,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
      })
    } else {
      setFormData({ ...defaultAgent })
    }
  }

  const selectedModel = AVAILABLE_MODELS.find(m => m.id === formData.model)
  const selectedSkillModel = AVAILABLE_MODELS.find(m => m.id === formData.skill_selection_model)
  const selectedTitleModel = AVAILABLE_MODELS.find(m => m.id === formData.title_generation_model)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showClose={false}
        className="w-full sm:max-w-none sm:w-[600px] p-0 bg-white shadow-2xl border-l border-gray-200 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-violet-50/50 to-purple-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <SheetTitle className="text-lg font-semibold text-gray-900">
                {isCreating ? "创建智能体" : "编辑智能体"}
              </SheetTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                {isCreating ? "配置新的 AI 智能体" : `上次更新: ${formData.updatedAt}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 space-y-6">
            {/* 启停状态 */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200">
              <div className="flex items-center gap-3">
                {formData.enabled ? (
                  <Power className="w-5 h-5 text-green-600" />
                ) : (
                  <PowerOff className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700">智能体状态</p>
                  <p className="text-xs text-gray-500">
                    {formData.enabled ? "当前处于运行状态" : "当前已停用"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors duration-200",
                  formData.enabled ? "bg-green-500" : "bg-gray-300"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200",
                    formData.enabled ? "translate-x-6" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* 基本信息 */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-violet-500 to-purple-500" />
                <h3 className="text-sm font-semibold text-gray-900">基本信息</h3>
              </div>

              {/* 名称 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  智能体名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="例如：ITSM 智能助手"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>

              {/* 版本 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">版本号</label>
                <input
                  type="text"
                  placeholder="v1.0"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>

              {/* 描述 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">描述</label>
                <textarea
                  rows={2}
                  placeholder="简要描述智能体的功能和用途..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>
            </section>

            {/* 提示词配置 */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
                <h3 className="text-sm font-semibold text-gray-900">提示词配置</h3>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  系统提示词 <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={8}
                  placeholder="定义智能体的角色、能力和行为规范..."
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all leading-relaxed"
                />
                <p className="text-xs text-gray-500">
                  提示词将作为系统消息发送给模型，用于定义智能体的基础行为
                </p>
              </div>
            </section>

            {/* 模型配置 */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500" />
                <h3 className="text-sm font-semibold text-gray-900">模型配置</h3>
                <Brain className="w-4 h-4 text-blue-500" />
              </div>

              {/* 主模型 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  主模型 <span className="text-red-500">*</span>
                </label>
                <div className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 cursor-not-allowed">
                  <Brain className="w-4 h-4 text-violet-500" />
                  <span className="text-gray-600">{selectedModel?.name || "未配置"}</span>
                </div>
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    Temperature
                  </label>
                  <span className="text-sm font-semibold text-violet-600">{formData.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>精确 (0)</span>
                  <span>平衡 (1)</span>
                  <span>创意 (2)</span>
                </div>
              </div>

              {/* Skill Selection Model */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-gray-500" />
                  Skill Selection Model
                </label>
                <div className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 cursor-not-allowed">
                  <span className="text-gray-600">{selectedSkillModel?.name || "未配置"}</span>
                </div>
                <p className="text-xs text-gray-500">用于选择和调用 Skills 的模型</p>
              </div>

              {/* Title Generation Model */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Type className="w-4 h-4 text-gray-500" />
                  Title Generation Model
                </label>
                <div className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 cursor-not-allowed">
                  <span className="text-gray-600">{selectedTitleModel?.name || "未配置"}</span>
                </div>
                <p className="text-xs text-gray-500">用于自动生成对话标题的模型</p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!formData.name.trim()}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white shadow-lg transition-all",
                formData.name.trim()
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-xl hover:shadow-violet-500/30"
                  : "bg-gray-300 cursor-not-allowed"
              )}
            >
              <Save className="w-4 h-4" />
              {isCreating ? "创建" : "保存"}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
