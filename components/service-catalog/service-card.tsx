"use client"

import React, { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Service {
  id: string
  title: string
  code: string
  description: string
  icon: React.ElementType
  status: "active" | "draft"
  sla: string
  category: string
  categoryName?: string
}

interface ServiceCardProps {
  service: Service
  onEdit?: () => void
  onDelete?: () => void
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  const Icon = service.icon
  const [showDisableAlert, setShowDisableAlert] = useState(false)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (service.status === "active") {
      // 启用状态的服务需要先停用
      setShowDisableAlert(true)
    } else {
      onDelete?.()
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.()
  }

  return (
    <>
      <div
        className={cn(
          "group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer",
          service.status === "active"
            ? "border border-indigo-200 shadow-indigo-500/10 hover:border-indigo-300 hover:shadow-indigo-500/20"
            : "border border-gray-100 hover:border-indigo-100"
        )}
      >
        {/* 悬停遮罩层 */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 flex items-center justify-center gap-4">
          <button
            onClick={handleEdit}
            className="w-11 h-11 rounded-xl bg-white border border-gray-200 shadow-lg flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all duration-200 transform hover:scale-105"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="w-11 h-11 rounded-xl bg-white border border-gray-200 shadow-lg flex items-center justify-center text-gray-600 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all duration-200 transform hover:scale-105"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className={cn(
                  "text-sm font-semibold transition-colors",
                  service.status === "active"
                    ? "text-indigo-600 group-hover:text-indigo-700"
                    : "text-foreground group-hover:text-primary"
                )}>
                  {service.title}
                </h3>
                <span
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium flex-shrink-0",
                    service.status === "active"
                      ? "text-emerald-600"
                      : "text-gray-500"
                  )}
                >
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    service.status === "active" ? "bg-emerald-500" : "bg-gray-400"
                  )} />
                  {service.status === "active" ? "启用" : "停用"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                {service.code}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
            {service.description}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
            <span className="text-xs text-muted-foreground">
              {service.categoryName || "人事服务"}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">
              SLA {service.sla}
            </span>
          </div>
        </div>
      </div>

      {/* 删除启用服务的提示弹窗 */}
      <AlertDialog open={showDisableAlert} onOpenChange={setShowDisableAlert}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>无法删除启用中的服务</AlertDialogTitle>
            <AlertDialogDescription>
              该服务当前处于启用状态，请先停用该服务后再进行删除操作。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">知道了</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowDisableAlert(false)
                onEdit?.()
              }}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
            >
              去停用
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
