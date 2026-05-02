"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea"
import type { Prompt, PromptVariable } from "@/types/prompt"
import { Check, CopyIcon, EyeIcon, MoreVertical, Pencil, Trash2, GripVertical, FileText, X } from "lucide-react"
import { ConfirmationDialog } from "@/components/dialogs/confirmation-dialog"
import { DescriptionDialog } from "@/components/dialogs/description-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { replaceVariables } from "@/lib/prompt-utils"
import { cn } from "@/lib/utils"

interface PromptPreviewProps {
  prompt: Prompt
  variables: PromptVariable[]
  onUpdatePrompt: (content: string) => void
  onUpdateDescription: (description: string) => void
  onDeletePrompt: () => void
  isEditMode?: boolean
}

export function PromptPreview({
  prompt,
  variables,
  onUpdatePrompt,
  onUpdateDescription,
  onDeletePrompt,
  isEditMode = false,
}: PromptPreviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(prompt.content)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  const handleCopy = () => {
    const processedText = replaceVariables(prompt.content, variables)
    void navigator.clipboard.writeText(processedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 600)
  }

  const handleEdit = () => {
    setIsEditing(true)
    setIsPreviewMode(false)
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.select()
      }
    }, 0)
  }

  const handleSave = () => {
    setIsEditing(false)
    onUpdatePrompt(content)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setContent(prompt.content)
  }

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode)
    if (isEditing) {
      setIsEditing(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true)
  }

  const handleConfirmDelete = () => {
    onDeletePrompt()
  }

  const handleTextareaFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.target.select()
  }

  return (
    <div ref={setNodeRef} style={style} className="border-b border-iron/60 py-4 last:border-b-0">
      {isEditing ? (
        <div className="space-y-2">
          <AutoResizeTextarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="font-mono-tight custom-scrollbar"
            minRows={3}
            maxRows={20}
            onFocus={handleTextareaFocus}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="icon" onClick={handleCancel} className="h-8 w-8">
              <span className="sr-only">Cancelar</span>
              <X className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" onClick={handleSave} className="h-8 w-8">
              <span className="sr-only">Guardar</span>
              <Check className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative group">
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
            <pre
              className={`font-mono-tight min-h-24 max-h-75 cursor-pointer overflow-y-auto whitespace-pre-wrap rounded-sm border border-iron bg-graphite p-2.5 pr-9 text-xs text-fog transition hover:border-electric-blue/50 custom-scrollbar ${
                isEditMode ? "pl-9" : ""
              }`}
              onClick={!isEditMode ? handleEdit : undefined}
            >
              {isPreviewMode ? replaceVariables(prompt.content, variables) : prompt.content}
            </pre>
            <div className="absolute top-1 right-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm text-silver hover:bg-graphite hover:text-white">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-50 border-iron bg-deep-charcoal text-white">
                  <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDescriptionDialog(true)} className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    {prompt.description ? "Editar descripción" : "Añadir descripción"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="cursor-pointer text-danger-red focus:text-danger-red"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {(prompt.description || !isEditMode) && (
            <div className="flex items-start justify-between gap-2">
              {prompt.description ? (
                <p className="min-w-0 flex-1 whitespace-pre-wrap text-xs text-ash">
                  {prompt.description}
                </p>
              ) : (
                <div className="flex-1" />
              )}
              {!isEditMode && (
                <div className="flex space-x-2 shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePreview}
                    className={cn("h-8 w-8", isPreviewMode && "border-electric-blue text-white")}
                  >
                    <EyeIcon className="h-3.5 w-3.5" />
                    <span className="sr-only">Preview</span>
                  </Button>
                  <TooltipProvider>
                    <Tooltip open={copied}>
                      <TooltipTrigger asChild>
                        <Button size="icon" onClick={handleCopy} className="h-8 w-8">
                          <CopyIcon className="h-3.5 w-3.5" />
                          <span className="sr-only">Copy</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">¡Copiado!</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar prompt"
        description="¿Estás seguro de que deseas eliminar este prompt? Esta acción no se puede deshacer."
      />

      <DescriptionDialog
        isOpen={showDescriptionDialog}
        onClose={() => setShowDescriptionDialog(false)}
        onSave={onUpdateDescription}
        title="Descripción del prompt"
        initialValue={prompt.description ?? ""}
      />
    </div>
  )
}
