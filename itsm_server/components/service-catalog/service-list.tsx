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
    id: "6",
    title: "邮箱创建申请",
    code: "email_account_creation",
    description: "员工申请创建企业邮箱账号，支持新员工入职、部门调整等场景",
    icon: FileText,
    status: "active" as const,
    sla: "4h",
    category: "email",
    categoryName: "邮箱服务",
  },
  {
    id: "7",
    title: "堡垒机资源申请",
    code: "bastion_host_access_request",
    description: "员工或项目组申请访问企业堡垒机资源，适用于生产环境运维、临时授权等场景",
    icon: FileText,
    status: "active" as const,
    sla: "8h",
    category: "server",
    categoryName: "服务器服务",
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
