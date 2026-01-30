"use client"

import React from "react"
import { ShieldCheck } from "lucide-react"
import { ServiceCard } from "@/components/service-catalog/service-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface PermissionRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PermissionRequestModal({
  open,
  onOpenChange,
}: PermissionRequestModalProps) {
  const [result, setResult] = React.useState<string>("")
  const [loading, setLoading] = React.useState(false)

  // 模拟 Agent 响应
  const handleTestRun = async () => {
    setLoading(true)
    setResult("")
    
    // 模拟后端调用过程
    setTimeout(() => {
      setResult(JSON.stringify({
        status: "success",
        message: "【验证模式】Agent 已响应",
        called_skill: "create_event_skill",
        payload: {
          is_dry_run: true,
          reason: "开发需要",
          resource: "GitLab"
        }
      }, null, 2))
      setLoading(false)
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>权限申请 - 验证模式</DialogTitle>
          <DialogDescription>
            此界面用于验证 Agent 是否能正确识别【权限申请】意图并调用正确工具。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Information Collection Prompt (Prompt Injection)</h4>
            <div className="bg-slate-950 text-slate-50 p-4 rounded-md text-xs font-mono whitespace-pre-wrap">
{`# Workflow
1. 开场白：明确告知用户：“我是权限助手，已命中【权限申请】路由。”
2. 数据采集：
    - 询问需要申请访问的系统/资源名称。
    - 询问申请该权限的具体业务理由。
3. 逻辑汇总：将以上信息连同工号展示给用户确认。
4. 闭环指令：告知用户：“验证流程已闭环，我正在为您创建模拟执行事件，请稍后在事件日志中查看 Payload。”`}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              关闭
            </Button>
            <Button onClick={handleTestRun} disabled={loading}>
              {loading ? "Agent执行中..." : "执行验证 (Mock)"}
            </Button>
          </div>

          {result && (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                执行结果
                <Badge variant="outline" className="text-green-600 border-green-600">Verified</Badge>
              </h4>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
                <pre className="text-xs overflow-auto max-h-[200px]">
                  {result}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
