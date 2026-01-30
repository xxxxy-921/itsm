"use client"

import { useState, useEffect } from "react"
import { X, Smile, Image } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface CreateCategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: "create" | "edit"
  initialValues?: {
    id: string
    name: string
    code: string
    description?: string
    icon?: string
    enabled?: boolean
  } | null
}

export function CreateCategoryModal({ 
  open, 
  onOpenChange, 
  mode = "create",
  initialValues = null 
}: CreateCategoryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    icon: "",
    enabled: true,
  })
  const [validationError, setValidationError] = useState<string | null>(null)

  // 当 modal 打开时，如果是编辑模式，填充初始值
  useEffect(() => {
    if (open && mode === "edit" && initialValues) {
      setFormData({
        name: initialValues.name,
        code: initialValues.code,
        description: initialValues.description || "",
        icon: initialValues.icon || "",
        enabled: initialValues.enabled ?? true,
      })
    } else if (open && mode === "create") {
      // 创建模式：重置表单
      setFormData({
        name: "",
        code: "",
        description: "",
        icon: "",
        enabled: true,
      })
    }
  }, [open, mode, initialValues])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证必填字段
    if (!formData.name.trim()) {
      setValidationError("请输入目录名称")
      setTimeout(() => setValidationError(null), 3000)
      return
    }
    if (!formData.code.trim()) {
      setValidationError("请输入目录编码")
      setTimeout(() => setValidationError(null), 3000)
      return
    }
    
    if (mode === "edit" && initialValues) {
      console.log("Update category:", { id: initialValues.id, ...formData })
    } else {
      console.log("Create category:", formData)
    }
    setValidationError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[500px] p-0 bg-white backdrop-blur-sm shadow-2xl rounded-2xl border-0 overflow-hidden"
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {mode === "edit" ? "编辑服务目录" : "新建服务目录"}
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* 目录名称 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              目录名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="例如：办公支持"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* 目录编码 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              目录编码 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="唯一标识，如 office-support"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              disabled={mode === "edit"}
              className={cn(
                "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono placeholder:text-gray-400 placeholder:font-sans focus:outline-none transition-all",
                mode === "edit" 
                  ? "bg-gray-50 text-gray-500 cursor-not-allowed" 
                  : "focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              )}
            />
            {mode === "edit" && (
              <p className="text-xs text-gray-400 flex items-start gap-1">
                <span className="text-amber-500">⚠️</span>
                <span>编码不可修改</span>
              </p>
            )}
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              描述
            </label>
            <textarea
              rows={3}
              placeholder="请输入目录描述..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* 图标选择器 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              图标
            </label>
            <div className="flex items-center gap-3">
              {/* 图标预览 */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                {formData.icon ? (
                  <Image className="w-6 h-6 text-indigo-500" />
                ) : (
                  <Smile className="w-6 h-6 text-gray-300" />
                )}
              </div>
              {/* 输入框 */}
              <input
                type="text"
                placeholder="请输入图标类名或 URL"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* 是否启用 - Toggle Switch */}
          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                是否启用
              </label>
              <p className="text-xs text-gray-400 mt-0.5">启用后该目录将在服务目录中显示</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.enabled}
              onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                formData.enabled ? "bg-indigo-600" : "bg-gray-200"
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
        </form>

        {/* Footer */}
        <div className="bg-gray-50/80 border-t border-gray-100">
          {/* Validation Error Toast */}
          {validationError && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-100 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-sm text-red-600">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="font-medium">{validationError}</span>
              </div>
            </div>
          )}
          
          <div className="px-6 py-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all"
            >
              {mode === "edit" ? "保存修改" : "创建目录"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
