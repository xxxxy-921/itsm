"use client"

import { useState } from "react"
import { X, FileText, Paperclip, Cloud, Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface CreateKnowledgeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type KnowledgeType = "text" | "file"

export function CreateKnowledgeModal({ open, onOpenChange }: CreateKnowledgeModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "text" as KnowledgeType,
    content: "",
    enabled: true,
  })
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Create knowledge:", formData, uploadedFile)
    onOpenChange(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      setUploadedFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setUploadedFile(files[0])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[600px] p-0 bg-white backdrop-blur-sm shadow-2xl rounded-2xl border-0 overflow-hidden"
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              新建知识
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
          {/* 服务知识标题 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              服务知识标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="请输入知识标题"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              描述
            </label>
            <input
              type="text"
              placeholder="请输入知识描述（选填）"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* 知识类型 - Segmented Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              知识类型
            </label>
            <div className="flex p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "text" })}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
                  formData.type === "text"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <FileText className="w-4 h-4" />
                文本 (Text)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "file" })}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
                  formData.type === "file"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Paperclip className="w-4 h-4" />
                文件 (File)
              </button>
            </div>
          </div>

          {/* 动态内容区 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              知识内容 <span className="text-red-500">*</span>
            </label>
            
            {formData.type === "text" ? (
              /* 文本输入区 */
              <textarea
                rows={8}
                required
                placeholder="请输入知识内容，支持 Markdown 格式..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            ) : (
              /* 文件上传区 - Drag & Drop Zone */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "relative flex flex-col items-center justify-center py-12 px-6 rounded-xl border-2 border-dashed transition-all cursor-pointer",
                  isDragging
                    ? "border-indigo-400 bg-indigo-50"
                    : uploadedFile
                    ? "border-green-300 bg-green-50/50"
                    : "border-indigo-200 bg-indigo-50/50 hover:border-indigo-300 hover:bg-indigo-50"
                )}
              >
                <input
                  type="file"
                  accept=".pdf,.md,.markdown,.txt"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {uploadedFile ? (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                      <FileText className="w-7 h-7 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setUploadedFile(null)
                      }}
                      className="mt-3 text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      移除文件
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
                      <Cloud className="w-7 h-7 text-indigo-500" />
                    </div>
                    <div className="flex items-center gap-1 text-sm mb-1">
                      <Upload className="w-4 h-4 text-indigo-500" />
                      <span className="font-medium text-indigo-600">点击上传</span>
                      <span className="text-gray-500">或拖拽文件至此</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      支持 PDF, Markdown, TXT 格式
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 是否启用 - Toggle Switch */}
          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                是否启用
              </label>
              <p className="text-xs text-gray-400 mt-0.5">启用后该知识将被 AI Agent 使用</p>
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
        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-3">
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
            确认
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
