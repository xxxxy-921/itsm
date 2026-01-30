"use client"

import { useState } from "react"
import {
  RefreshCw,
  Plus,
  FileText,
} from "lucide-react"
import { ServiceCard } from "./service-card"
import { CreateServiceDrawer } from "./create-service-drawer"

interface ServiceData {
  id: string
  title: string
  code: string
  description: string
  icon: typeof FileText
  status: "active" | "draft"
  sla: string
  category: string
  categoryName: string
}

// Mock services data - 中文化
const initialServicesData: ServiceData[] = [
  {
    id: "1",
    title: "工作证明开具",
    code: "employment-certificate",
    description: "开具在职证明、收入证明等相关人事文件",
    icon: FileText,
    status: "active" as const,
    sla: "24h",
    category: "hr",
    categoryName: "人事服务",
  },
  {
    id: "2",
    title: "请假申请",
    code: "request-leave",
    description: "各类假期申请处理",
    icon: FileText,
    status: "active" as const,
    sla: "8h",
    category: "hr",
    categoryName: "人事服务",
  },
  {
    id: "3",
    title: "调岗申请",
    code: "transfer-request",
    description: "内部调岗/转岗申请流程",
    icon: FileText,
    status: "active" as const,
    sla: "168h",
    category: "hr",
    categoryName: "人事服务",
  },
  {
    id: "4",
    title: "设备领用",
    code: "equipment-request",
    description: "IT设备申领流程",
    icon: FileText,
    status: "active" as const,
    sla: "48h",
    category: "assets",
    categoryName: "设备与资产",
  },
  {
    id: "5",
    title: "权限申请",
    code: "access-request",
    description: "系统权限申请与审批",
    icon: FileText,
    status: "draft" as const,
    sla: "4h",
    category: "access",
    categoryName: "账号与权限管理",
  },
]

interface ServiceListProps {
  selectedCategory: string
}

export function ServiceList({ selectedCategory }: ServiceListProps) {
  const [services, setServices] = useState<ServiceData[]>(initialServicesData)
  const [showServiceDrawer, setShowServiceDrawer] = useState(false)
  const [editingService, setEditingService] = useState<ServiceData | null>(null)

  const filteredServices = services.filter(
    (service) => selectedCategory === "all" || service.category === selectedCategory
  )

  const handleEditService = (service: ServiceData) => {
    setEditingService(service)
    setShowServiceDrawer(true)
  }

  const handleDeleteService = (serviceId: string) => {
    setServices(services.filter((s) => s.id !== serviceId))
  }

  const handleAddService = () => {
    setEditingService(null)
    setShowServiceDrawer(true)
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">服务列表</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filteredServices.length} 个服务</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white border border-gray-200 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleAddService}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-500/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            添加服务
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <ServiceCard 
            key={service.id} 
            service={service} 
            onEdit={() => handleEditService(service)}
            onDelete={() => handleDeleteService(service.id)}
          />
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">暂无服务</h3>
          <p className="text-sm text-muted-foreground mb-4">
            该目录下还没有服务，点击添加服务按钮创建
          </p>
          <button
            type="button"
            onClick={handleAddService}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            添加服务
          </button>
        </div>
      )}

      {/* Service Drawer */}
      <CreateServiceDrawer 
        open={showServiceDrawer} 
        onOpenChange={setShowServiceDrawer}
        mode={editingService ? "edit" : "create"}
        editingService={editingService}
      />
    </div>
  )
}
