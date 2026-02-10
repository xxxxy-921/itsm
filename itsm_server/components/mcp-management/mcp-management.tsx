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
  Database,
  MessageSquare,
  FileText,
  GitBranch,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { McpConfigDrawer } from "./mcp-config-drawer"

// MCP 数据类型 - 对齐后端字段
export interface Mcp {
  id: string
  name: string                    // 后端: name
  description: string              // 后端需补充
  url: string                      // 后端: url
  beartoken: string               // 后端: beartoken
  enabled: boolean                // 后端需补充
  tenant_id?: string              // 后端: tenant_id
  created_at?: string             // 后端需补充
  updated_at?: string             // 后端需补充
}

// 预置一个MCP卡片示例
const initialMcps: Mcp[] = [
  {
    id: "1",
    name: "数据库连接器",
    description: "提供 MySQL 数据库的查询、管理和监控能力",
    url: "https://api.example.com/mcp/database",
    beartoken: "Bearer_token_example_12345",
    enabled: true,
    created_at: "2026-02-01T10:00:00Z",
    updated_at: "2026-02-05T14:30:00Z",
  }
]

export function McpManagement() {
  const [mcps, setMcps] = useState<Mcp[]>(initialMcps)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingMcp, setEditingMcp] = useState<Mcp | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const filteredMcps = mcps.filter(mcp => {
    const matchesSearch = 
      mcp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mcp.description.toLowerCase().includes(searchQuery.toLowerCase())

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
      const newMcp = {
        ...updatedMcp,
        id: String(Date.now()),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setMcps([...mcps, newMcp])
    } else {
      setMcps(mcps.map(m => 
        m.id === updatedMcp.id 
          ? { ...updatedMcp, updated_at: new Date().toISOString() } 
          : m
      ))
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMcps.map((mcp) => {
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
                  <Plug className="w-6 h-6 text-blue-600" />
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

                {/* Meta - 显示 URL */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500 truncate">{mcp.url}</span>
                  </div>
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
