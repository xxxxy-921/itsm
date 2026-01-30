/**
 * 将 Agent CoT 指令文本转换为 Mermaid 流程图
 */
export function convertCotToMermaid(cotText: string): string {
  if (!cotText || !cotText.trim()) {
    return `graph TD
    A[开始] --> B[暂无流程]
    B --> C[结束]`
  }

  try {
    // 提取 Phase 阶段
    const phaseRegex = /(?:Phase\s+\d+|步骤\s*\d+|阶段\s*\d+)\s*[-–—]\s*([^：:]+)[:：]?\s*([\s\S]*?)(?=(?:Phase\s+\d+|步骤\s*\d+|阶段\s*\d+|$))/gi
    const phases: Array<{ title: string; content: string }> = []
    
    let match
    while ((match = phaseRegex.exec(cotText)) !== null) {
      phases.push({
        title: match[1].trim(),
        content: match[2].trim(),
      })
    }

    if (phases.length === 0) {
      // 如果没有找到明确的 Phase，尝试按段落分割
      const paragraphs = cotText.split(/\n\n+/).filter(p => p.trim())
      if (paragraphs.length > 0) {
        paragraphs.forEach((para, idx) => {
          const lines = para.split('\n').filter(l => l.trim())
          if (lines.length > 0) {
            phases.push({
              title: `步骤 ${idx + 1}`,
              content: lines.join('\n'),
            })
          }
        })
      }
    }

    // 生成 Mermaid 流程图
    let mermaidCode = `graph TD\n`
    mermaidCode += `    Start([开始]) --> Phase1\n`

    phases.forEach((phase, index) => {
      const nodeId = `Phase${index + 1}`
      const nextNodeId = index < phases.length - 1 ? `Phase${index + 2}` : 'End'
      
      // 清理标题，移除特殊字符
      const cleanTitle = phase.title
        .replace(/["\[\]{}()]/g, '')
        .substring(0, 30)
      
      mermaidCode += `    ${nodeId}["${cleanTitle}"]\n`
      
      // 提取子步骤
      const subSteps = extractSubSteps(phase.content)
      if (subSteps.length > 0) {
        subSteps.forEach((step, subIdx) => {
          const subNodeId = `${nodeId}_${subIdx + 1}`
          const cleanStep = step
            .replace(/["\[\]{}()]/g, '')
            .substring(0, 40)
          mermaidCode += `    ${subNodeId}["${cleanStep}"]\n`
          
          if (subIdx === 0) {
            mermaidCode += `    ${nodeId} --> ${subNodeId}\n`
          } else {
            mermaidCode += `    ${nodeId}_${subIdx} --> ${subNodeId}\n`
          }
          
          if (subIdx === subSteps.length - 1) {
            mermaidCode += `    ${subNodeId} --> ${nextNodeId}\n`
          }
        })
      } else {
        mermaidCode += `    ${nodeId} --> ${nextNodeId}\n`
      }
    })

    mermaidCode += `    End([结束])\n`

    return mermaidCode
  } catch (error) {
    console.error('Convert CoT to Mermaid error:', error)
    return `graph TD
    A[开始] --> B[解析失败]
    B --> C[请检查文本格式]
    C --> D[结束]`
  }
}

/**
 * 提取子步骤
 */
function extractSubSteps(content: string): string[] {
  const steps: string[] = []
  
  // 匹配带序号的行，如 "1. ", "- ", "• " 等
  const stepRegex = /(?:^|\n)\s*(?:[-•]\s*|[\d]+\.\s*)(.+)/g
  
  let match
  while ((match = stepRegex.exec(content)) !== null) {
    const step = match[1].trim()
    if (step && step.length > 0) {
      steps.push(step)
    }
  }
  
  return steps.slice(0, 5) // 最多提取5个子步骤
}
