"use client"

import { GlobalSidebar } from "@/components/workbench/global-sidebar"
import { McpManagement } from "@/components/mcp-management/mcp-management"

export default function McpManagementPage() {
  return (
    <div className="flex min-h-screen bg-white">
      <GlobalSidebar currentPage="mcp-management" />
      <McpManagement />
    </div>
  )
}
