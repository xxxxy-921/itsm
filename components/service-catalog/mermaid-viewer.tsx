"use client"

import { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"

interface MermaidViewerProps {
  chart: string
  className?: string
}

export function MermaidViewer({ chart, className = "" }: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: "basis",
      },
    })
  }, [])

  useEffect(() => {
    if (!containerRef.current || !chart) return

    const renderChart = async () => {
      try {
        setError(null)
        const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const { svg } = await mermaid.render(uniqueId, chart)
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      } catch (err) {
        console.error("Mermaid render error:", err)
        setError("流程图渲染失败，请检查文本格式")
      }
    }

    renderChart()
  }, [chart])

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 rounded-xl bg-red-50 border border-red-200 ${className}`}>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return <div ref={containerRef} className={className} />
}
