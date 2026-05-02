"use client"
import type { Prompt, PromptVariable } from "@/types/prompt"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState, useEffect } from "react"
import { GripVertical } from "lucide-react"
import { replaceVariables } from "@/lib/prompt-utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

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

  const handleClick = () => {
    if (isEditMode && onOpenModal) {
      onOpenModal(prompt)
      return
    }

    const processedText = replaceVariables(prompt.content, variables)
    void navigator.clipboard.writeText(processedText)

    setCopied(true)
    setTimeout(() => setCopied(false), 600)
  }

  useEffect(() => {
    setCopied(false)
  }, [prompt.id])

  return (
    <TooltipProvider>
      <Tooltip open={copied && !isEditMode}>
        <TooltipTrigger asChild>
          <div
            ref={setNodeRef}
            style={style}
            className={cn(
              "relative h-52 cursor-pointer rounded-2xl border border-iron/60 bg-black/20 p-4 transition hover:border-violet-pulse/80 hover:bg-[rgba(90,31,208,0.14)]",
              isDragging && "opacity-70",
              copied && "border-electric-blue bg-[rgba(24,163,250,0.12)]",
            )}
            onClick={handleClick}
          >
            {isEditMode && (
              <button
                type="button"
                aria-label="Reordenar prompt"
                className="app-focus absolute bottom-0 left-0 top-0 z-10 flex w-8 cursor-grab items-center justify-center border-0 bg-transparent active:cursor-grabbing"
                {...attributes}
                {...listeners}
              >
                <GripVertical aria-hidden="true" className="h-5 w-5 text-silver" />
              </button>
            )}
            <div className={`flex h-full flex-col overflow-auto p-1 custom-scrollbar ${isEditMode ? "ml-6" : ""}`}>
              <pre className="flex-1 overflow-hidden whitespace-pre-wrap text-xs text-fog">{prompt.content}</pre>
              {prompt.description && (
                <p className="mt-2 line-clamp-2 border-t border-iron/50 pt-2 text-[10px] italic text-silver">
                  {prompt.description}
                </p>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">¡Copiado!</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
