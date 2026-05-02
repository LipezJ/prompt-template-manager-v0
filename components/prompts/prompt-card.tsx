"use client"
import type { Prompt, PromptVariable } from "@/types/prompt"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState, useEffect } from "react"
import { GripVertical } from "lucide-react"
import { getMissingRequiredVariables, replaceVariables } from "@/lib/prompt-utils"
import { highlightPromptContent } from "@/lib/highlight-prompt"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface PromptCardProps {
  prompt: Prompt
  variables: PromptVariable[]
  isEditMode?: boolean
  onOpenModal?: (prompt: Prompt) => void
  onMissingVariables?: (ids: string[]) => void
}

const DANGER_SURFACE_STYLE = {
  backgroundColor: "var(--color-graphite)",
  borderColor: "var(--color-iron)",
  color: "#ffffff",
  boxShadow: "var(--color-danger-red) 0 -2px 0 0 inset",
}

export function PromptCard({
  prompt,
  variables,
  isEditMode = false,
  onOpenModal,
  onMissingVariables,
}: PromptCardProps) {
  const [copied, setCopied] = useState(false)
  const [missingNames, setMissingNames] = useState<string[]>([])

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: prompt.id,
    disabled: !isEditMode,
  })

  const showError = missingNames.length > 0 && !isEditMode
  const showCopied = copied && !isEditMode

  const cardStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
    ...(showError ? { borderColor: "var(--color-danger-red)" } : {}),
  }

  const handleClick = () => {
    if (isEditMode && onOpenModal) {
      onOpenModal(prompt)
      return
    }

    const missing = getMissingRequiredVariables(prompt.content, variables)
    if (missing.length > 0) {
      setMissingNames(missing.map((v) => v.name))
      onMissingVariables?.(missing.map((v) => v.id))
      setTimeout(() => setMissingNames([]), 3000)
      return
    }

    const processedText = replaceVariables(prompt.content, variables)
    void navigator.clipboard.writeText(processedText)
    onMissingVariables?.([])

    setCopied(true)
    setTimeout(() => setCopied(false), 600)
  }

  useEffect(() => {
    setCopied(false)
    setMissingNames([])
  }, [prompt.id])

  return (
    <TooltipProvider>
      <Tooltip open={showError || showCopied}>
        <TooltipTrigger asChild>
          <div
            ref={setNodeRef}
            style={cardStyle}
            className={cn(
              "hover-clone group relative h-52 cursor-pointer select-none rounded-sm border border-iron bg-deep-charcoal p-3 transition hover:border-amethyst/50",
              isDragging && "opacity-70",
              copied && "border-electric-blue",
            )}
            onClick={handleClick}
          >
            {isEditMode && (
              <button
                type="button"
                aria-label="Reordenar prompt"
                className="app-focus absolute bottom-0 left-0 top-0 z-10 flex w-7 cursor-grab items-center justify-center border-0 bg-transparent active:cursor-grabbing"
                {...attributes}
                {...listeners}
              >
                <GripVertical aria-hidden="true" className="h-4 w-4 text-ash" />
              </button>
            )}
            <div className={cn("flex h-full flex-col overflow-auto custom-scrollbar", isEditMode && "ml-5")}>
              <pre className="font-mono-tight flex-1 overflow-hidden whitespace-pre-wrap text-xs text-fog">
                {highlightPromptContent(prompt.content)}
              </pre>
              {prompt.description && (
                <p className="mt-2 line-clamp-2 border-t border-iron/60 pt-2 text-[10px] text-ash">
                  {prompt.description}
                </p>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" style={showError ? DANGER_SURFACE_STYLE : undefined}>
          {showError ? `Faltan variables: ${missingNames.join(", ")}` : "¡Copiado!"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
