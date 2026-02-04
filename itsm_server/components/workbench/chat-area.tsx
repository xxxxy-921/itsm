"use client"

import { useState } from "react"
import {
  Bot,
  Send,
  Sparkles,
  Eye,
  EyeOff,
  Paperclip,
  Plus,
  MessageCircle,
  ChevronLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"

const agents = [
  { id: 1, name: "BKLite ITSM 助手", version: "v1.2.4", active: true, description: "专注于 IT 服务管理的智能助手，可处理工单、服务请求等场景" },
  { id: 2, name: "运维专家", version: "v1.0", active: true, description: "专业的运维技术支持助手，擅长监控告警、故障排查" },
  { id: 3, name: "知识库助手", version: "v2.1", active: false, description: "智能知识检索与文档管理助手，支持多格式文档处理" },
]

type Message = {
  id: number
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

type ChatHistory = {
  id: number
  title: string
  agentName: string
  timestamp: Date
  messages: Message[]
}

const mockHistories: ChatHistory[] = [
  {
    id: 1,
    title: "如何配置服务目录权限？",
    agentName: "BKLite ITSM 助手",
    timestamp: new Date(2026, 0, 28, 14, 30),
    messages: [
      { id: 1, role: "user", content: "如何配置服务目录权限？", timestamp: new Date(2026, 0, 28, 14, 30) },
      { id: 2, role: "assistant", content: "配置服务目录权限需要以下几个步骤：\n\n1. 进入系统管理 > 权限管理\n2. 选择服务目录模块\n3. 设置相应的角色和权限\n4. 保存配置即可生效\n\n您需要具体配置哪个方面的权限呢？", timestamp: new Date(2026, 0, 28, 14, 30) },
      { id: 3, role: "user", content: "我想限制某些用户组只能查看特定的服务", timestamp: new Date(2026, 0, 28, 14, 31) },
      { id: 4, role: "assistant", content: "明白了，您可以通过以下方式实现：\n\n1. 在权限管理中创建自定义用户组\n2. 为该用户组设置服务可见性规则\n3. 在服务目录中为每个服务指定可访问的用户组\n4. 这样用户登录后只能看到被授权的服务\n\n需要我提供更详细的操作步骤吗？", timestamp: new Date(2026, 0, 28, 14, 31) },
    ],
  },
  {
    id: 2,
    title: "服务器监控告警规则设置",
    agentName: "运维专家",
    timestamp: new Date(2026, 0, 27, 16, 20),
    messages: [
      { id: 1, role: "user", content: "如何设置服务器CPU使用率告警？", timestamp: new Date(2026, 0, 27, 16, 20) },
      { id: 2, role: "assistant", content: "设置CPU使用率告警的步骤如下：\n\n1. 进入监控平台 > 告警配置\n2. 创建新的告警规则\n3. 选择指标类型：CPU使用率\n4. 设置阈值（建议：警告80%，严重90%）\n5. 配置通知方式（邮件、短信、企业微信等）\n6. 设置告警接收人\n\n您想设置什么级别的告警阈值？", timestamp: new Date(2026, 0, 27, 16, 21) },
    ],
  },
  {
    id: 3,
    title: "知识库文档管理",
    agentName: "知识库助手",
    timestamp: new Date(2026, 0, 26, 10, 15),
    messages: [
      { id: 1, role: "user", content: "如何批量导入知识库文档？", timestamp: new Date(2026, 0, 26, 10, 15) },
      { id: 2, role: "assistant", content: "批量导入知识库文档有以下几种方式：\n\n1. Excel批量导入：准备标准模板，填写文档信息后上传\n2. 文件夹导入：支持直接上传整个文件夹，系统自动识别文档类型\n3. API接口导入：适合需要定期同步的场景\n\n您有多少文档需要导入？是什么类型的文档？", timestamp: new Date(2026, 0, 26, 10, 16) },
    ],
  },
]

export function ChatArea() {
  const [selectedAgent, setSelectedAgent] = useState(agents[0])
  const [message, setMessage] = useState("")
  const [showReasoning, setShowReasoning] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentMessages, setCurrentMessages] = useState<Message[]>([])
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null)

  const handleHistoryClick = (history: ChatHistory) => {
    setSelectedHistoryId(history.id)
    setCurrentMessages(history.messages)
    setSelectedAgent(agents.find(a => a.name === history.agentName) || agents[0])
  }

  return (
    <div className="flex-1 ml-[200px] h-screen flex">
      {/* Left Panel - History Only */}
      <div className={cn(
        "h-full bg-white border-r border-gray-100 flex flex-col transition-all duration-300",
        sidebarCollapsed ? "w-0 overflow-hidden" : "w-[280px]"
      )}>
        {/* New Chat Button */}
        <div className="p-4 border-b border-gray-100">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-5 h-5" />
            开启新对话
          </button>
        </div>

        {/* History Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2">
            <p className="text-xs font-medium text-muted-foreground">历史对话</p>
          </div>
          
          {/* History List */}
          <div className="px-3 space-y-3 pb-4">
            {mockHistories.map((history) => (
              <button
                key={history.id}
                type="button"
                onClick={() => handleHistoryClick(history)}
                className={cn(
                  "w-full p-3 rounded-xl text-left transition-all duration-200",
                  selectedHistoryId === history.id
                    ? "bg-white shadow-lg shadow-indigo-500/10 border border-indigo-100 scale-[1.02]"
                    : "bg-white hover:bg-gray-50 shadow-sm hover:shadow-md border border-gray-100"
                )}
              >
                <div className="flex flex-col gap-2">
                  <p className={cn(
                    "text-sm font-medium line-clamp-1",
                    selectedHistoryId === history.id ? "text-primary" : "text-foreground"
                  )}>
                    {history.title}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-xs text-muted-foreground truncate font-medium">
                        {history.agentName}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(history.timestamp, "MM-dd HH:mm")}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Collapse Toggle Button */}
      <button
        type="button"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute left-[480px] top-1/2 -translate-y-1/2 w-6 h-12 bg-white border border-gray-200 rounded-r-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all z-10"
        style={{ left: sidebarCollapsed ? '200px' : '480px' }}
      >
        <ChevronLeft className={cn(
          "w-4 h-4 transition-transform",
          sidebarCollapsed && "rotate-180"
        )} />
      </button>

      {/* Main Chat Area */}
      <div className="flex-1 h-screen flex flex-col bg-white">
        {/* Header with Agent Selector */}
        <header className="h-14 px-6 flex items-center justify-between border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            {/* Horizontal Agent Selector - 横向排布的智能体切换 */}
            {agents.filter(a => a.active).map((agent) => (
              <Tooltip key={agent.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setSelectedAgent(agent)}
                    className={cn(
                      "relative flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-300 ease-out",
                      selectedAgent.id === agent.id
                        ? "bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25 scale-[1.02]"
                        : "bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {/* Avatar with glow effect */}
                    <div className={cn(
                      "relative w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300",
                      selectedAgent.id === agent.id 
                        ? "bg-white/25 shadow-inner" 
                        : "bg-gray-200"
                    )}>
                      {/* Glow ring for selected */}
                      {selectedAgent.id === agent.id && (
                        <div className="absolute inset-0 rounded-lg bg-white/20 animate-pulse" />
                      )}
                      <Bot className={cn(
                        "w-4 h-4 transition-all duration-300",
                        selectedAgent.id === agent.id 
                          ? "text-white drop-shadow-sm" 
                          : "text-gray-400"
                      )} />
                    </div>
                    <span className={cn(
                      "text-sm font-medium transition-all duration-300",
                      selectedAgent.id === agent.id 
                        ? "text-white" 
                        : "text-gray-500"
                    )}>
                      {agent.name}
                    </span>
                    {/* Active indicator dot */}
                    {selectedAgent.id === agent.id && (
                      <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white shadow-sm animate-in zoom-in duration-200" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent 
                  side="bottom" 
                  className="max-w-[280px] p-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 shadow-2xl shadow-black/30 overflow-hidden"
                  sideOffset={8}
                >
                  <div className="p-4 space-y-3">
                    {/* Header with gradient */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <p className="font-semibold text-white">{agent.name}</p>
                      </div>
                      <span className="text-xs font-medium text-indigo-300 bg-indigo-500/20 px-2 py-1 rounded-md border border-indigo-400/30">
                        {agent.version}
                      </span>
                    </div>
                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {agent.description}
                    </p>
                  </div>
                  {/* Bottom accent line */}
                  <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          
        </header>

        {/* Main Chat Area with Grid Pattern */}
        <div className="flex-1 grid-pattern overflow-y-auto">
          {currentMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-6 py-12">
              {/* Empty State */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-6">
                  <MessageCircle className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-base text-muted-foreground">选择一个历史对话或开始新对话</p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-4",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-3",
                      msg.role === "user"
                        ? "bg-primary text-white"
                        : "bg-gray-50 text-foreground"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={cn(
                      "text-xs mt-2",
                      msg.role === "user" ? "text-white/70" : "text-muted-foreground"
                    )}>
                      {format(msg.timestamp, "HH:mm")}
                    </p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-gray-600">我</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-6 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-2xl border border-gray-200">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>支持 txt、docx、jpg、png、markdown 等格式</p>
                </TooltipContent>
              </Tooltip>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="输入消息..."
                className="flex-1 px-2 py-2 text-sm bg-transparent border-0 outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                disabled={!message.trim()}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
                  message.trim()
                    ? "bg-gradient-to-r from-primary to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl"
                    : "bg-indigo-600 text-white"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
