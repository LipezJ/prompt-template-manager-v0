"use client"
import type { Prompt, PromptVariable } from "@/types/prompt"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState, useEffect } from "react"
import { GripVertical } from "lucide-react"

interface PromptCardProps {
  prompt: Prompt
  variables: PromptVariable[]
  isEditMode?: boolean
  onOpenModal?: (prompt: Prompt) => void
}

export function PromptCard({ prompt, variables, isEditMode = false, onOpenModal }: PromptCardProps) {
  const [copied, setCopied] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: prompt.id,
    disabled: !isEditMode,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  }

  const replaceVariables = (text: string): string => {
    let result = text
    variables.forEach((variable) => {
      const regex = new RegExp(`{${variable.name}}`, "g")
      result = result.replace(regex, variable.value)
    })
    return result
  }

  const handleClick = () => {
    if (isEditMode && onOpenModal) {
      onOpenModal(prompt)
      return
    }

    const processedText = replaceVariables(prompt.content)
    navigator.clipboard.writeText(processedText)

    setCopied(true)
    setTimeout(() => setCopied(false), 300)
  }

  useEffect(() => {
    setCopied(false)
  }, [prompt.id])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-zinc-800 rounded-md p-4 cursor-pointer relative w-[200px] h-[200px] ${
        isDragging ? "shadow-lg" : ""
      } hover:bg-zinc-750 transition-colors ${copied ? "bg-zinc-700" : ""}`}
      onClick={handleClick}
    >
      {isEditMode && (
        <div
          className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-zinc-500" />
        </div>
      )}
      <div className={`bg-zinc-900 rounded-md p-2 h-full overflow-auto custom-scrollbar ${isEditMode ? "ml-6" : ""}`}>
        <pre className="whitespace-pre-wrap text-xs text-zinc-300 overflow-hidden">{prompt.content}</pre>
      </div>
    </div>
  )
}
