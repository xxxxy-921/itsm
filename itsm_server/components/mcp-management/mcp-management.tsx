"use client"

import { useState } from "react"
import {
  Plug,
  Plus,
  Search,
  Power,
  PowerOff,
  Settings,
  ExternalLink,
  Shield,
  Database,
  MessageSquare,
  FileText,
  GitBranch,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { McpConfigDrawer } from "./mcp-config-drawer"

// MCP 数据类型
export interface Mcp {
  id: string
  name: string
  description: string
  version: string
  type: "system" | "custom"
  enabled: boolean
  provider: string
  endpoint?: string
  category: "database" | "api" | "messaging" | "file" | "git" | "other"
  createdAt: string
  updatedAt: string
  config?: Record<string, any>
}

// Mock 系统级 MCP 数据
const mockSystemMcps: Mcp[] = [
  {
    id: "1",
    name: "MySQL 数据库连接器",
    description: "提供 MySQL 数据库的查询、管理和监控能力",
    version: "v2.1.0",
    type: "system",
    enabled: true,
    provider: "BKLite",
    category: "database",
    createdAt: "2026-01-10",
    updatedAt: "2026-02-01",
    config: {
      host: "localhost",
      port: 3306,
      database: "itsm_db"
    }
  },
  {
    id: "2",
    name: "PostgreSQL 连接器",
    description: "PostgreSQL 数据库集成，支持高级查询和事务管理",
    version: "v1.8.3",
    type: "system",
    enabled: true,
    provider: "BKLite",
    category: "database",
    createdAt: "2026-01-12",
    updatedAt: "2026-01-30",
  },
  {
    id: "3",
    name: "REST API 调用器",
    description: "通用的 REST API 调用工具，支持多种认证方式",
    version: "v3.0.1",
    type: "system",
    enabled: true,
    provider: "BKLite",
    category: "api",
    createdAt: "2026-01-08",
    updatedAt: "2026-01-28",
  },
  {
    id: "4",
    name: "Slack 消息集成",
    description: "Slack 消息发送和通知集成工具",
    version: "v1.5.2",
    type: "system",
    enabled: false,
    provider: "Slack",
    category: "messaging",
    createdAt: "2026-01-15",
    updatedAt: "2026-01-25",
  },
  {
    id: "5",
    name: "企业微信集成",
    description: "企业微信消息推送和机器人集成",
    version: "v2.3.0",
    type: "system",
    enabled: true,
    provider: "WeChat Work",
    category: "messaging",
    createdAt: "2026-01-18",
    updatedAt: "2026-02-02",
  },
  {
    id: "6",
    name: "文件系统访问",
    description: "安全的文件系统读写和管理工具",
    version: "v1.0.5",
    type: "system",
    enabled: true,
    provider: "BKLite",
    category: "file",
    createdAt: "2026-01-20",
    updatedAt: "2026-01-29",
  },
  {
    id: "7",
    name: "Git 仓库集成",
    description: "Git 仓库操作和代码管理工具",
    version: "v2.0.0",
    type: "system",
    enabled: false,
    provider: "BKLite",
    category: "git",
    createdAt: "2026-01-22",
    updatedAt: "2026-01-31",
  },
]

// 图标映射
const categoryIcons = {
  database: Database,
  api: ExternalLink,
  messaging: MessageSquare,
  file: FileText,
  git: GitBranch,
  other: Settings,
}

export function McpManagement() {
  const [mcps, setMcps] = useState<Mcp[]>(mockSystemMcps)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingMcp, setEditingMcp] = useState<Mcp | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const filteredMcps = mcps.filter(mcp => {
    const matchesSearch = 
      mcp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mcp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mcp.provider.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const handleMcpClick = (mcp: Mcp) => {
    setEditingMcp(mcp)
    setIsCreating(false)
    setDrawerOpen(true)
  }

  const handleCreateNew = () => {
    setEditingMcp(null)
    setIsCreating(true)
    setDrawerOpen(true)
  }

  const handleSave = (updatedMcp: Mcp) => {
    if (isCreating) {
      setMcps([...mcps, { ...updatedMcp, id: String(mcps.length + 1), type: "system" }])
    } else {
      setMcps(mcps.map(m => m.id === updatedMcp.id ? updatedMcp : m))
    }
    setDrawerOpen(false)
  }

  const handleDelete = (mcpId: string) => {
    if (confirm("确定要删除这个 MCP 配置吗？")) {
      setMcps(mcps.filter(m => m.id !== mcpId))
      setDrawerOpen(false)
    }
  }

  const handleToggleStatus = (mcpId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setMcps(mcps.map(m => 
      m.id === mcpId ? { ...m, enabled: !m.enabled } : m
    ))
  }

  const stats = {
    total: mcps.length,
    enabled: mcps.filter(m => m.enabled).length,
  }

  return (
    <div className="flex-1 ml-[200px] h-screen flex flex-col bg-gray-50/50">
      {/* Header */}
      <header className="h-16 px-8 flex items-center justify-between border-b border-gray-100 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Plug className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">MCP 管理</h1>
            <p className="text-xs text-gray-500">管理模型上下文协议 (Model Context Protocol) 连接器</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索 MCP 连接器..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Create Button */}
          <button
            type="button"
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            添加 MCP
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="px-8 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>系统级 MCP: <span className="font-semibold text-gray-900">{stats.total}</span></span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Power className="w-4 h-4 text-green-600" />
            <span>已启用: <span className="font-semibold text-green-600">{stats.enabled}</span></span>
          </div>

          <div className="ml-auto text-xs text-gray-500">
            <span>系统预置的 MCP 连接器，可配置并在服务中使用</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMcps.map((mcp) => {
            const CategoryIcon = categoryIcons[mcp.category]
            
            return (
              <div
                key={mcp.id}
                onClick={() => handleMcpClick(mcp)}
                className={cn(
                  "group relative bg-white rounded-2xl border border-gray-100 p-6 cursor-pointer transition-all duration-300",
                  "hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1",
                  !mcp.enabled && "opacity-75"
                )}
              >
                {/* Status Toggle */}
                <div className="absolute top-4 right-4">
                  <button
                    type="button"
                    onClick={(e) => handleToggleStatus(mcp.id, e)}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      mcp.enabled
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                    )}
                  >
                    {mcp.enabled ? (
                      <Power className="w-4 h-4" />
                    ) : (
                      <PowerOff className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Icon */}
                <div className="mt-4 mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <CategoryIcon className="w-6 h-6 text-blue-600" />
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
                    {mcp.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 min-h-[2.5rem]">
                    {mcp.description}
                  </p>
                </div>

                {/* Meta */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{mcp.provider}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-500">
                    {mcp.version}
                  </span>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredMcps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Plug className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              没有找到 MCP 连接器
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {searchQuery ? "尝试调整搜索条件" : "开始添加您的第一个 MCP 连接器"}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                添加 MCP
              </button>
            )}
          </div>
        )}
      </div>

      {/* Config Drawer */}
      <McpConfigDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mcp={editingMcp}
        isCreating={isCreating}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
