"use client"

import { GlobalSidebar } from "@/components/workbench/global-sidebar"
import { AgentManagement } from "@/components/agent-management/agent-management"

export default function AgentManagementPage() {
  return (
    <div className="flex min-h-screen bg-white">
      <GlobalSidebar currentPage="agent-management" />
      <AgentManagement />
    </div>
  )
}
