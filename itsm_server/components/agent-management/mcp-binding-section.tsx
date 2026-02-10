"use client"

import { useState } from "react"
import {
  Plug,
  Plus,
  X,
  Trash2,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

// MCP 绑定配置类型
export interface McpBinding {
  mcpServiceId: string
  mcpServiceName: string
  mcpServiceUrl: string
  enabledTools: string[]
  priority: number
  config?: Record<string, any>
}

// 可用的 MCP 服务（从 MCP 管理模块获取）
const AVAILABLE_MCP_SERVICES = [
  {
    id: "mcp_database",
    name: "数据库连接器",
    url: "https://api.example.com/mcp/database",
    description: "提供 MySQL 数据库的查询、管理和监控能力",
    availableTools: ["query", "insert", "update", "delete", "execute"],
  },
  {
    id: "mcp_ldap",
    name: "LDAP 目录服务",
    url: "ldap://ldap.company.com",
    description: "企业用户目录查询和群组管理",
    availableTools: ["query_user", "create_group", "add_member", "remove_member", "search"],
  },
  {
    id: "mcp_exchange",
    name: "Exchange 邮件服务",
    url: "https://exchange.company.com/api",
    description: "邮箱创建和分发列表管理",
    availableTools: ["create_mailbox", "create_distribution_list", "add_to_list", "get_mailbox_info"],
  },
  {
    id: "mcp_file_system",
    name: "文件系统访问",
    url: "file://local",
    description: "本地文件系统读写操作",
    availableTools: ["read_file", "write_file", "list_directory", "create_directory", "delete_file"],
  },
  {
    id: "mcp_slack",
    name: "Slack 集成",
    url: "https://slack.com/api",
    description: "Slack 消息发送和频道管理",
    availableTools: ["send_message", "create_channel", "invite_user", "get_channel_info"],
  },
]

interface McpBindingSectionProps {
  bindings: McpBinding[]
  onChange: (bindings: McpBinding[]) => void
}

export function McpBindingSection({ bindings, onChange }: McpBindingSectionProps) {
  const [isAddingMcp, setIsAddingMcp] = useState(false)
  const [selectedMcpId, setSelectedMcpId] = useState<string>("")
  const [expandedBindingId, setExpandedBindingId] = useState<string | null>(null)

  // 获取可添加的 MCP 列表（排除已添加的）
  const availableToAdd = AVAILABLE_MCP_SERVICES.filter(
    mcp => !bindings.some(b => b.mcpServiceId === mcp.id)
  )

  const handleAddMcp = () => {
    if (!selectedMcpId) return

    const selectedMcp = AVAILABLE_MCP_SERVICES.find(m => m.id === selectedMcpId)
    if (!selectedMcp) return

    const newBinding: McpBinding = {
      mcpServiceId: selectedMcp.id,
      mcpServiceName: selectedMcp.name,
      mcpServiceUrl: selectedMcp.url,
      enabledTools: [], // 默认不启用任何工具，需要用户手动选择
      priority: bindings.length + 1,
      config: {},
    }

    onChange([...bindings, newBinding])
    setIsAddingMcp(false)
    setSelectedMcpId("")
  }

  const handleRemoveMcp = (mcpServiceId: string) => {
    onChange(bindings.filter(b => b.mcpServiceId !== mcpServiceId))
  }

  const getMcpService = (mcpServiceId: string) => {
    return AVAILABLE_MCP_SERVICES.find(m => m.id === mcpServiceId)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
          <h3 className="text-sm font-semibold text-gray-900">MCP 服务挂载</h3>
          <Plug className="w-4 h-4 text-emerald-500" />
        </div>
        <span className="text-xs text-gray-500">
          已挂载 {bindings.length} 个服务
        </span>
      </div>

      <div className="space-y-3">
        {/* MCP 绑定列表 */}
        {bindings.length === 0 ? (
          <div className="p-6 rounded-xl border-2 border-dashed border-gray-200 text-center">
            <Plug className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-1">暂无 MCP 服务</p>
            <p className="text-xs text-gray-400">点击下方按钮添加 MCP 服务连接</p>
          </div>
        ) : (
          bindings.map((binding, index) => {
            const mcpService = getMcpService(binding.mcpServiceId)
            const isExpanded = expandedBindingId === binding.mcpServiceId

            return (
              <div
                key={binding.mcpServiceId}
                className="rounded-xl border border-gray-200 bg-gradient-to-r from-emerald-50/30 to-teal-50/30 overflow-hidden"
              >
                {/* Header */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                      <Plug className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {binding.mcpServiceName}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {mcpService?.description || "MCP 服务连接"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedBindingId(isExpanded ? null : binding.mcpServiceId)}
                      className="p-1 hover:bg-white/60 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveMcp(binding.mcpServiceId)}
                      className="p-1 hover:bg-red-50 rounded-lg transition-colors group"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && mcpService && (
                  <div className="px-4 pb-4 pt-2 border-t border-emerald-100 space-y-3">
                    {/* URL 信息 */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">服务地址</label>
                      <div className="px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200">
                        <p className="text-sm text-gray-700 font-mono break-all">
                          {binding.mcpServiceUrl}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}

        {/* 添加 MCP 面板 */}
        {isAddingMcp ? (
          <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">选择 MCP 服务</p>
              <button
                type="button"
                onClick={() => {
                  setIsAddingMcp(false)
                  setSelectedMcpId("")
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {availableToAdd.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-2">
                所有可用的 MCP 服务已添加
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  {availableToAdd.map(mcp => (
                    <button
                      key={mcp.id}
                      type="button"
                      onClick={() => setSelectedMcpId(mcp.id)}
                      className={cn(
                        "w-full p-3 rounded-lg border text-left transition-all",
                        selectedMcpId === mcp.id
                          ? "border-emerald-500 bg-emerald-50 shadow-sm"
                          : "border-gray-200 hover:border-emerald-300 hover:bg-white"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <Plug className={cn(
                          "w-4 h-4 mt-0.5",
                          selectedMcpId === mcp.id ? "text-emerald-600" : "text-gray-400"
                        )} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{mcp.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{mcp.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {mcp.availableTools.length} 个可用工具
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddMcp}
                  disabled={!selectedMcpId}
                  className={cn(
                    "w-full py-2 rounded-lg text-sm font-medium transition-all",
                    selectedMcpId
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  确认添加
                </button>
              </>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingMcp(true)}
            disabled={availableToAdd.length === 0}
            className={cn(
              "w-full py-2.5 rounded-xl border-2 border-dashed text-sm font-medium transition-all flex items-center justify-center gap-2",
              availableToAdd.length > 0
                ? "border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400"
                : "border-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            <Plus className="w-4 h-4" />
            添加 MCP 服务
          </button>
        )}
      </div>

      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-xs text-blue-700">
          <strong>提示：</strong>MCP 服务为智能体提供外部能力扩展，每个服务独立运行。
        </p>
      </div>
    </section>
  )
}