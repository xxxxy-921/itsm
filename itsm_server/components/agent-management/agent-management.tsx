"use client"

import { useState } from "react"
import {
  Bot,
  Plus,
  Search,
  Settings,
  Power,
  PowerOff,
  Sparkles,
  Brain,
  Thermometer,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AgentEditDrawer } from "./agent-edit-drawer"

// Agent 数据类型
export interface Agent {
  id: string
  name: string
  description: string
  version: string
  enabled: boolean
  prompt: string
  model: string
  temperature: number
  skill_selection_model: string
  title_generation_model: string
  createdAt: string
  updatedAt: string
}

// Mock 数据
const mockAgents: Agent[] = [
  {
    id: "1",
    name: "BKLite ITSM 助手",
    description: "专注于 IT 服务管理的智能助手，可处理工单、服务请求等场景",
    version: "v1.2.4",
    enabled: true,
    prompt: "你是 BKLite ITSM 助手，专注于帮助用户解决 IT 服务管理相关问题...",
    model: "gpt-4",
    temperature: 0.7,
    skill_selection_model: "gpt-4",
    title_generation_model: "gpt-3.5-turbo",
    createdAt: "2026-01-15",
    updatedAt: "2026-02-01",
  },
  {
    id: "2",
    name: "运维专家",
    description: "专业的运维技术支持助手，擅长监控告警、故障排查",
    version: "v1.0",
    enabled: true,
    prompt: "你是运维专家，专注于帮助用户处理运维相关的技术问题...",
    model: "gpt-4",
    temperature: 0.5,
    skill_selection_model: "gpt-3.5-turbo",
    title_generation_model: "gpt-3.5-turbo",
    createdAt: "2026-01-20",
    updatedAt: "2026-01-28",
  },
  {
    id: "3",
    name: "知识库助手",
    description: "智能知识检索与文档管理助手，支持多格式文档处理",
    version: "v2.1",
    enabled: false,
    prompt: "你是知识库助手，帮助用户快速检索和管理知识文档...",
    model: "claude-3",
    temperature: 0.3,
    skill_selection_model: "gpt-4",
    title_generation_model: "gpt-3.5-turbo",
    createdAt: "2026-01-10",
    updatedAt: "2026-01-26",
  },
  {
    id: "4",
    name: "代码审查助手",
    description: "自动化代码审查和优化建议，支持多种编程语言",
    version: "v0.9-beta",
    enabled: false,
    prompt: "你是代码审查助手，帮助用户进行代码审查并提供优化建议...",
    model: "gpt-4",
    temperature: 0.2,
    skill_selection_model: "gpt-4",
    title_generation_model: "gpt-3.5-turbo",
    createdAt: "2026-01-25",
    updatedAt: "2026-01-30",
  },
]

export function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAgentClick = (agent: Agent) => {
    setEditingAgent(agent)
    setIsCreating(false)
    setDrawerOpen(true)
  }

  const handleCreateNew = () => {
    setEditingAgent(null)
    setIsCreating(true)
    setDrawerOpen(true)
  }

  const handleSave = (updatedAgent: Agent) => {
    if (isCreating) {
      setAgents([...agents, { ...updatedAgent, id: String(agents.length + 1) }])
    } else {
      setAgents(agents.map(a => a.id === updatedAgent.id ? updatedAgent : a))
    }
    setDrawerOpen(false)
  }

  const handleToggleStatus = (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setAgents(agents.map(a => 
      a.id === agentId ? { ...a, enabled: !a.enabled } : a
    ))
  }

  return (
    <div className="flex-1 ml-[200px] h-screen flex flex-col bg-gray-50/50">
      {/* Header */}
      <header className="h-16 px-8 flex items-center justify-between border-b border-gray-100 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">智能体配置</h1>
            <p className="text-xs text-gray-500">管理和配置您的 AI 智能体</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索智能体..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Create Button */}
          <button
            type="button"
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            创建智能体
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => handleAgentClick(agent)}
              className={cn(
                "group relative bg-white rounded-2xl border border-gray-100 p-6 cursor-pointer transition-all duration-300",
                "hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1",
                !agent.enabled && "opacity-75"
              )}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <button
                  type="button"
                  onClick={(e) => handleToggleStatus(agent.id, e)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                    agent.enabled
                      ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                      : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
                  )}
                >
                  {agent.enabled ? (
                    <>
                      <Power className="w-3 h-3" />
                      运行中
                    </>
                  ) : (
                    <>
                      <PowerOff className="w-3 h-3" />
                      已停用
                    </>
                  )}
                </button>
              </div>

              {/* Icon */}
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
                agent.enabled
                  ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25"
                  : "bg-gray-200"
              )}>
                <Bot className={cn(
                  "w-7 h-7",
                  agent.enabled ? "text-white" : "text-gray-500"
                )} />
              </div>

              {/* Content */}
              <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-violet-700 transition-colors">
                {agent.name}
              </h3>
              <p className="text-xs text-gray-400 mb-3">{agent.version}</p>
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {agent.description}
              </p>

              {/* Meta Info */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">{agent.model}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">{agent.temperature}</span>
                </div>
              </div>

              {/* Hover Arrow */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-5 h-5 text-violet-500" />
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filteredAgents.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
                <Bot className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 mb-2">未找到匹配的智能体</p>
              <p className="text-sm text-gray-400">尝试调整搜索条件或创建新的智能体</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Drawer */}
      <AgentEditDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        agent={editingAgent}
        isCreating={isCreating}
        onSave={handleSave}
      />
    </div>
  )
}
