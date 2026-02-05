"use client"

import { useState } from "react"
import {
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock categories data - 中文化
const categoriesData = [
  { id: "email", name: "邮箱服务", code: "email-services", count: 1, description: "企业邮箱相关服务", icon: "", enabled: true },
  { id: "server", name: "服务器服务", code: "server-services", count: 1, description: "服务器资源相关服务", icon: "", enabled: true },
]

interface CategorySidebarProps {
  selectedCategory: string
  onSelectCategory: (id: string) => void
  onAddCategory: () => void
  onEditCategory: (category: any) => void
  onDeleteCategory: (id: string) => void
}

export function CategorySidebar({ 
  selectedCategory, 
  onSelectCategory, 
  onAddCategory,
  onEditCategory,
  onDeleteCategory
}: CategorySidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleEdit = (e: React.MouseEvent, category: any) => {
    e.stopPropagation()
    onEditCategory(category)
  }

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setDeleteConfirmId(id)
  }

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      onDeleteCategory(deleteConfirmId)
      setDeleteConfirmId(null)
    }
  }

  return (
    <aside className="w-full h-full bg-white border-r border-gray-100 flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">服务目录</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{categoriesData.length} 个目录</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onAddCategory}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category List */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-1">
          {categoriesData.map((category) => {
            const isActive = selectedCategory === category.id
            const isHovered = hoveredId === category.id
            
            return (
              <div 
                key={category.id} 
                className="relative"
                onMouseEnter={() => setHoveredId(category.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => onSelectCategory(category.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200"
                        : "hover:bg-gray-50 border border-transparent"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        "text-sm font-medium block truncate",
                        isActive ? "text-indigo-700" : "text-gray-700"
                      )}>
                        {category.name}
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5 block truncate">
                        {category.code}
                      </span>
                    </div>
                  </button>

                  {/* 编辑和删除按钮 - 悬停时显示 */}
                  {isHovered && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                      <button
                        type="button"
                        onClick={(e) => handleEdit(e, category)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(e, category.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </nav>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 fade-in duration-200">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                确定要删除该目录吗？
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                删除后将无法恢复，该目录下的服务将被移除
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-sm font-medium text-white hover:bg-red-700 transition-all"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  )
}
