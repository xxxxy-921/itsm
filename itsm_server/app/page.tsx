import { GlobalSidebar } from "@/components/workbench/global-sidebar"
import { ChatArea } from "@/components/workbench/chat-area"

export default function WorkbenchPage() {
  return (
    <div className="flex min-h-screen bg-white">
      <GlobalSidebar currentPage="workspace" />
      <ChatArea />
    </div>
  )
}
