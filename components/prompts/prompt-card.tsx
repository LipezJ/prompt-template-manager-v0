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
              "bg-card border border-border rounded-lg p-4 cursor-pointer relative w-50 h-50 hover:border-primary/50 transition-colors",
              isDragging && "shadow-lg",
              copied && "border-primary"
            )}
            onClick={handleClick}
          >
            {isEditMode && (
              <button
                type="button"
                aria-label="Reordenar prompt"
                className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing z-10 bg-transparent border-0"
                {...attributes}
                {...listeners}
              >
                <GripVertical aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
            <div className={cn(
              "bg-secondary rounded-md p-2 h-full overflow-auto custom-scrollbar flex flex-col",
              isEditMode && "ml-6"
            )}>
              <pre className="whitespace-pre-wrap text-xs text-foreground overflow-hidden flex-1">{prompt.content}</pre>
              {prompt.description && (
                <p className="mt-1 pt-1 border-t border-border text-[10px] text-muted-foreground italic line-clamp-2">
                  {prompt.description}
                </p>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">Copiado</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
