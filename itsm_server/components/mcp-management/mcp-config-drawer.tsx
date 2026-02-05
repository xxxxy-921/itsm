"use client"

import { useState, useEffect } from "react"
import {
  X,
  Save,
  Trash2,
  AlertCircle,
  Plug,
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
    url: "",
    beartoken: "",
    enabled: true,
  })

  const [showToken, setShowToken] = useState(false)

  useEffect(() => {
    if (open) {
      if (mcp) {
        setFormData({
          name: mcp.name || "",
          description: mcp.description || "",
          url: mcp.url || "",
          beartoken: mcp.beartoken || "",
          enabled: mcp.enabled ?? true,
        })
      } else {
        setFormData({
          name: "",
          description: "",
          url: "",
          beartoken: "",
          enabled: true,
        })
      }
      setShowToken(false)
    }
  }, [open, mcp])

  const handleInputChange = (field: keyof Mcp, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (!formData.name?.trim()) {
      alert("请输入 MCP 名称")
      return
    }

    if (!formData.url?.trim()) {
      alert("请输入端点 URL")
      return
    }

    if (!formData.beartoken?.trim()) {
      alert("请输入认证令牌")
      return
    }

    const mcpToSave: Mcp = {
      ...(mcp || {}),
      ...formData,
      id: mcp?.id || String(Date.now()),
      name: formData.name!,
      description: formData.description!,
      url: formData.url!,
      beartoken: formData.beartoken!,
      enabled: formData.enabled ?? true,
    } as Mcp

    onSave(mcpToSave)
  }

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
              <Plug className="w-5 h-5 text-blue-600" />
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
                  placeholder="例如：数据库连接器"
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
            </div>

            {/* Connection Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">连接配置</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  端点 URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.url || ""}
                  onChange={(e) => handleInputChange("url", e.target.value)}
                  placeholder="https://api.example.com/mcp"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  MCP 服务的 API 端点地址
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  认证令牌 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showToken ? "text" : "password"}
                    value={formData.beartoken || ""}
                    onChange={(e) => handleInputChange("beartoken", e.target.value)}
                    placeholder="输入 Bearer Token"
                    className="w-full px-3 py-2 pr-20 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showToken ? "隐藏" : "显示"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  用于 API 认证的 Bearer Token
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
              disabled={!formData.name?.trim() || !formData.url?.trim() || !formData.beartoken?.trim()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all",
                !formData.name?.trim() || !formData.url?.trim() || !formData.beartoken?.trim()
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
