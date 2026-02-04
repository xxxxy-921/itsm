"use client"

import { useState, useEffect } from "react"
import {
  X,
  Save,
  Trash2,
  AlertCircle,
  Database,
  ExternalLink,
  MessageSquare,
  FileText,
  GitBranch,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Mcp } from "./mcp-management"

interface McpConfigDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mcp: Mcp | null
  isCreating: boolean
  onSave: (mcp: Mcp) => void
  onDelete: (mcpId: string) => void
}

const categoryOptions = [
  { value: "database", label: "数据库", icon: Database },
  { value: "api", label: "API", icon: ExternalLink },
  { value: "messaging", label: "消息通讯", icon: MessageSquare },
  { value: "file", label: "文件系统", icon: FileText },
  { value: "git", label: "Git 仓库", icon: GitBranch },
  { value: "other", label: "其他", icon: Settings },
]

export function McpConfigDrawer({
  open,
  onOpenChange,
  mcp,
  isCreating,
  onSave,
  onDelete,
}: McpConfigDrawerProps) {
  const [formData, setFormData] = useState<Partial<Mcp>>({
    name: "",
    description: "",
    version: "v1.0.0",
    provider: "",
    endpoint: "",
    category: "other",
    enabled: true,
    type: "custom",
    config: {},
  })

  const [configJson, setConfigJson] = useState("")
  const [jsonError, setJsonError] = useState("")

  useEffect(() => {
    if (open) {
      if (mcp) {
        setFormData({
          name: mcp.name || "",
          description: mcp.description || "",
          version: mcp.version || "v1.0.0",
          provider: mcp.provider || "",
          endpoint: mcp.endpoint || "",
          category: mcp.category || "other",
          enabled: mcp.enabled ?? true,
          type: mcp.type || "system",
          config: mcp.config || {},
        })
        setConfigJson(JSON.stringify(mcp.config || {}, null, 2))
      } else {
        setFormData({
          name: "",
          description: "",
          version: "v1.0.0",
          provider: "",
          endpoint: "",
          category: "other",
          enabled: true,
          type: "system",
          config: {},
        })
        setConfigJson("{}")
      }
      setJsonError("")
    }
  }, [open, mcp])

  const handleInputChange = (field: keyof Mcp, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleConfigChange = (value: string) => {
    setConfigJson(value)
    setJsonError("")
    
    try {
      const parsed = JSON.parse(value)
      setFormData(prev => ({ ...prev, config: parsed }))
    } catch (e) {
      setJsonError("JSON 格式错误")
    }
  }

  const handleSave = () => {
    if (!formData.name?.trim()) {
      alert("请输入 MCP 名称")
      return
    }

    if (jsonError) {
      alert("请修复配置 JSON 错误")
      return
    }

    const now = new Date().toISOString().split('T')[0]
    const mcpToSave: Mcp = {
      ...(mcp || {}),
      ...formData,
      id: mcp?.id || String(Date.now()),
      type: mcp?.type || "system",
      createdAt: mcp?.createdAt || now,
      updatedAt: now,
    } as Mcp

    onSave(mcpToSave)
  }

  const selectedCategory = categoryOptions.find(opt => opt.value === formData.category)
  const CategoryIcon = selectedCategory?.icon || Settings

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[600px] bg-white shadow-2xl z-50 animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
              <CategoryIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isCreating ? "添加 MCP 连接器" : "编辑 MCP 配置"}
              </h2>
              <p className="text-xs text-gray-500">
                {isCreating ? "配置新的 MCP 连接器" : `编辑 ${mcp?.name || ""}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">基本信息</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MCP 名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="例如：自定义数据库连接器"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="简要描述这个 MCP 连接器的功能..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    提供商
                  </label>
                  <input
                    type="text"
                    value={formData.provider || ""}
                    onChange={(e) => handleInputChange("provider", e.target.value)}
                    placeholder="例如：BKLite"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    版本
                  </label>
                  <input
                    type="text"
                    value={formData.version || ""}
                    onChange={(e) => handleInputChange("version", e.target.value)}
                    placeholder="v1.0.0"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  类别
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categoryOptions.map((option) => {
                    const OptionIcon = option.icon
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInputChange("category", option.value)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                          formData.category === option.value
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <OptionIcon className="w-5 h-5" />
                        <span className="text-xs font-medium">{option.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Connection Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">连接信息</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  端点 URL (可选)
                </label>
                <input
                  type="text"
                  value={formData.endpoint || ""}
                  onChange={(e) => handleInputChange("endpoint", e.target.value)}
                  placeholder="https://api.example.com/mcp"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  配置参数 (JSON)
                </label>
                <textarea
                  value={configJson}
                  onChange={(e) => handleConfigChange(e.target.value)}
                  placeholder='{\n  "key": "value"\n}'
                  rows={8}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2 focus:border-transparent resize-none",
                    jsonError
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200 focus:ring-blue-500"
                  )}
                />
                {jsonError && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{jsonError}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  配置参数将以 JSON 格式存储，用于 MCP 连接时的认证和设置
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">状态设置</h3>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">启用此 MCP</p>
                  <p className="text-xs text-gray-500 mt-1">
                    启用后，智能体可以使用此 MCP 连接器
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange("enabled", !formData.enabled)}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors",
                    formData.enabled ? "bg-blue-600" : "bg-gray-300"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                      formData.enabled ? "right-0.5" : "left-0.5"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div>
            {!isCreating && mcp && (
              <button
                type="button"
                onClick={() => onDelete(mcp.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                删除
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all text-sm font-medium"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!formData.name?.trim() || !!jsonError}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all",
                !formData.name?.trim() || jsonError
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/30"
              )}
            >
              <Save className="w-4 h-4" />
              {isCreating ? "添加" : "保存"}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
