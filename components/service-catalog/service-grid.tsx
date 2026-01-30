"use client"

import { useState, useRef, useEffect } from "react"
import {
  Search,
  Plus,
  KeyRound,
  Mail,
  Laptop,
  Wifi,
  HardDrive,
  Shield,
  FileKey,
  Printer,
  UserPlus,
  UserMinus,
  FolderPlus,
  Cog,
  BookOpen,
  ChevronDown,
} from "lucide-react"
import { ServiceCard } from "./service-card"
import { CreateCategoryModal } from "./create-category-modal"
import { CreateServiceDrawer } from "./create-service-drawer"
import { CreateKnowledgeModal } from "./create-knowledge-modal"

const services = [
  {
    id: "1",
    title: "Email Password Reset",
    code: "srv_pwd_reset",
    description: "Automated password reset workflow with multi-factor authentication verification and secure token generation.",
    icon: KeyRound,
    status: "active" as const,
    sla: "2h",
    avgTime: "45s",
    successRate: "98%",
    category: "access",
  },
  {
    id: "2",
    title: "Email Account Provision",
    code: "srv_email_prov",
    description: "Complete email account setup including distribution list membership and signature templates.",
    icon: Mail,
    status: "active" as const,
    sla: "4h",
    avgTime: "2m",
    successRate: "99%",
    category: "access",
  },
  {
    id: "3",
    title: "Laptop Request",
    code: "srv_laptop_req",
    description: "Hardware procurement workflow with approval chain and asset tracking integration.",
    icon: Laptop,
    status: "active" as const,
    sla: "3d",
    avgTime: "1.5d",
    successRate: "95%",
    category: "assets",
  },
  {
    id: "4",
    title: "VPN Access",
    code: "srv_vpn_access",
    description: "Secure VPN client deployment with certificate-based authentication setup.",
    icon: Wifi,
    status: "draft" as const,
    sla: "1h",
    avgTime: "30s",
    successRate: "97%",
    category: "access",
  },
  {
    id: "5",
    title: "Storage Quota Increase",
    code: "srv_storage_inc",
    description: "Cloud storage expansion with usage analytics and cost allocation reporting.",
    icon: HardDrive,
    status: "active" as const,
    sla: "1d",
    avgTime: "4h",
    successRate: "100%",
    category: "infra",
  },
  {
    id: "6",
    title: "Security Access Review",
    code: "srv_sec_review",
    description: "Quarterly access certification workflow with compliance reporting and audit trail.",
    icon: Shield,
    status: "active" as const,
    sla: "5d",
    avgTime: "2d",
    successRate: "92%",
    category: "access",
  },
  {
    id: "7",
    title: "SSH Key Management",
    code: "srv_ssh_keys",
    description: "Secure key pair generation and rotation with automated expiry notifications.",
    icon: FileKey,
    status: "draft" as const,
    sla: "30m",
    avgTime: "15s",
    successRate: "99%",
    category: "access",
  },
  {
    id: "8",
    title: "Printer Setup",
    code: "srv_printer_setup",
    description: "Network printer configuration with driver deployment and print quota assignment.",
    icon: Printer,
    status: "active" as const,
    sla: "2h",
    avgTime: "10m",
    successRate: "96%",
    category: "office",
  },
  {
    id: "9",
    title: "New Employee Onboarding",
    code: "srv_onboard",
    description: "Complete provisioning workflow including AD account, email, hardware, and access rights.",
    icon: UserPlus,
    status: "active" as const,
    sla: "1d",
    avgTime: "6h",
    successRate: "94%",
    category: "hr",
  },
  {
    id: "10",
    title: "Employee Offboarding",
    code: "srv_offboard",
    description: "Secure deprovisioning with access revocation, data retention, and asset recovery.",
    icon: UserMinus,
    status: "active" as const,
    sla: "4h",
    avgTime: "2h",
    successRate: "99%",
    category: "hr",
  },
  {
    id: "svc-006",
    title: "权限申请 (验证版)",
    code: "G001",
    description: "申请各系统的访问权限（如GitLab, CMDB等）- 包含Agent空跑验证",
    icon: Shield,
    status: "draft" as const,
    sla: "2h",
    avgTime: "-",
    successRate: "-",
    category: "access",
  },
]

interface ServiceGridProps {
  selectedCategory: string
}

export function ServiceGrid({ selectedCategory }: ServiceGridProps) {
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showServiceDrawer, setShowServiceDrawer] = useState(false)
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const filteredServices = services.filter(
    (service) => selectedCategory === "all" || service.category === selectedCategory
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCreateMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const createMenuItems = [
    {
      icon: FolderPlus,
      label: "新建目录",
      description: "创建服务目录分类",
      onClick: () => {
        setShowCategoryModal(true)
        setShowCreateMenu(false)
      },
    },
    {
      icon: Cog,
      label: "新建服务",
      description: "配置 AI 服务策略",
      onClick: () => {
        setShowServiceDrawer(true)
        setShowCreateMenu(false)
      },
    },
    {
      icon: BookOpen,
      label: "新建知识",
      description: "添加服务知识库",
      onClick: () => {
        setShowKnowledgeModal(true)
        setShowCreateMenu(false)
      },
    },
  ]

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">
              Service Automation Strategies
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure and manage AI-powered service workflows
            </p>
          </div>
          
          {/* Create Button with Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-violet-500 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create
              <ChevronDown className={`w-4 h-4 transition-transform ${showCreateMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showCreateMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2">
                  {createMenuItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      className="w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left hover:bg-gray-50 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                        <item.icon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search services..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/80 backdrop-blur-md border border-gray-200 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No services found</h3>
          <p className="text-sm text-muted-foreground">
            Try selecting a different category or create a new strategy
          </p>
        </div>
      )}

      {/* Modals */}
      <CreateCategoryModal 
        open={showCategoryModal} 
        onOpenChange={setShowCategoryModal} 
      />
      <CreateServiceDrawer 
        open={showServiceDrawer} 
        onOpenChange={setShowServiceDrawer} 
      />
      <CreateKnowledgeModal 
        open={showKnowledgeModal} 
        onOpenChange={setShowKnowledgeModal} 
      />
    </div>
  )
}
