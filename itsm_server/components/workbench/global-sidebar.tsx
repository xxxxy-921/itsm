"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  Bot,
  ChevronDown,
  ChevronRight,
  Home,
  Wrench,
  BookOpen,
  Database,
  BarChart3,
  FileText,
  Activity,
  Users,
  CreditCard,
  Link2,
  Bell,
  FolderOpen,
  Ticket,
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { icon: Home, label: "工作台", labelEn: "Workspace", href: "/", id: "workspace" },
  { 
    icon: Bot, 
    label: "智能体配置", 
    labelEn: "Agent Config", 
    href: "#", 
    id: "agent-config",
    hasSubmenu: true,
    submenu: [
      { label: "智能体管理", href: "/agent-management", id: "agent-management" },
      { label: "MCP管理", href: "/mcp-management", id: "mcp-management" },
    ]
  },
  { 
    icon: Wrench, 
    label: "ITSM", 
    labelEn: "ITSM", 
    href: "#", 
    id: "itsm",
    hasSubmenu: true,
    submenu: [
      { label: "服务目录", href: "/service-catalog", id: "service-catalog" },
      { label: "工单", href: "/tickets", id: "tickets" },
    ]
  },
  { icon: BookOpen, label: "知识库", labelEn: "Knowledge", href: "#", id: "knowledge" },
  { icon: Database, label: "CMDB", labelEn: "CMDB", href: "#", id: "cmdb" },
  { icon: Bell, label: "事件", labelEn: "Events", href: "#", id: "events" },
]

const analyticsItems = [
  { icon: BarChart3, label: "指标", labelEn: "Metrics", href: "#", id: "metrics" },
  { icon: FileText, label: "日志", labelEn: "Logs", href: "#", id: "logs" },
  { icon: Activity, label: "应用性能", labelEn: "Performance", href: "#", id: "performance" },
]

const settingsItems = [
  { icon: Users, label: "组织管理", labelEn: "Organization", href: "#", id: "org", hasSubmenu: true },
  { icon: CreditCard, label: "成本与账单", labelEn: "Billing", href: "#", id: "billing", hasSubmenu: true },
  { icon: Link2, label: "集成", labelEn: "Integrations", href: "#", id: "integrations", hasSubmenu: true },
]

interface GlobalSidebarProps {
  currentPage?: string
}

export function GlobalSidebar({ currentPage = "workspace" }: GlobalSidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0 })
  const itemRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({})
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 清除隐藏定时器
  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }

  // 显示悬浮菜单
  const showSubmenu = (itemId: string) => {
    clearHideTimeout()
    setHoveredItem(itemId)
  }

  // 延迟隐藏悬浮菜单
  const hideSubmenuWithDelay = () => {
    clearHideTimeout()
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null)
    }, 300) // 300ms 延迟
  }

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => clearHideTimeout()
  }, [])

  useEffect(() => {
    if (hoveredItem && itemRefs.current[hoveredItem]) {
      const rect = itemRefs.current[hoveredItem]!.getBoundingClientRect()
      setSubmenuPosition({ top: rect.top })
    }
  }, [hoveredItem])

  const renderMenuItem = (item: typeof menuItems[0], isActive: boolean) => {
    const hasSubmenu = item.hasSubmenu && item.submenu

    return (
      <div
        key={item.id}
        className="relative"
        onMouseEnter={() => hasSubmenu && showSubmenu(item.id)}
        onMouseLeave={() => hasSubmenu && hideSubmenuWithDelay()}
      >
        <Link
          ref={(el) => { itemRefs.current[item.id] = el }}
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative",
            isActive
              ? "bg-indigo-50 text-primary"
              : "text-gray-500 hover:text-foreground hover:bg-gray-50"
          )}
        >
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
          )}
          <item.icon className="w-5 h-5" />
          <span>{item.label}</span>
          {hasSubmenu && (
            <ChevronRight className="w-4 h-4 ml-auto" />
          )}
        </Link>

        {/* 二级悬浮菜单 */}
        {hasSubmenu && hoveredItem === item.id && (
          <div 
            className="fixed left-[200px] z-50 animate-in fade-in slide-in-from-left-1 duration-100"
            style={{ top: submenuPosition.top }}
            onMouseEnter={() => showSubmenu(item.id)}
            onMouseLeave={() => hideSubmenuWithDelay()}
          >
            <div className="bg-white rounded-r-xl shadow-lg border border-l-0 border-gray-100 py-1 min-w-[140px]">
              {item.submenu?.map((subItem) => (
                <Link
                  key={subItem.id}
                  href={subItem.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 text-sm transition-colors",
                    currentPage === subItem.id
                      ? "bg-indigo-50 text-primary font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-foreground"
                  )}
                >
                  {subItem.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className="w-[200px] h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-40">
      {/* Logo Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-gray-50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-indigo-400 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <span className="font-semibold text-foreground tracking-tight">BKLite Cloud</span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-hide">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = currentPage === item.id || 
              (item.submenu?.some(sub => currentPage === sub.id))
            return renderMenuItem(item, isActive)
          })}
        </div>

        {/* Analytics Section */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="space-y-1">
            {analyticsItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-foreground hover:bg-gray-50 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Settings Section */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="space-y-1">
            {settingsItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-foreground hover:bg-gray-50 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.hasSubmenu && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-semibold text-sm">
            X
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Xiaoyu Liu</p>
            <p className="text-xs text-muted-foreground truncate">umaru 的工作空间</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
