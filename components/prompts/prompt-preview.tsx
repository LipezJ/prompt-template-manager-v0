"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea"
import type { Prompt, PromptVariable } from "@/types/prompt"
import { CopyIcon, EyeIcon, MoreVertical, Pencil, Trash2, GripVertical, FileText, X, Check } from "lucide-react"
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
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card border border-border rounded-lg p-4",
        isDragging && "shadow-lg"
      )}
    >
      {isEditing ? (
        <div className="space-y-2">
          <AutoResizeTextarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-secondary border-border custom-scrollbar"
            minRows={3}
            maxRows={20}
            onFocus={handleTextareaFocus}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleCancel}
            >
              <span className="sr-only">Cancelar</span>
              <X className="h-4 w-4" />
            </Button>
            <Button size="icon" onClick={handleSave}>
              <span className="sr-only">Guardar</span>
              <Check className="h-4 w-4" />
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
                className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing z-10 bg-transparent border-0"
                {...attributes}
                {...listeners}
              >
                <GripVertical aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
            <pre
              className={cn(
                "whitespace-pre-wrap text-sm p-3 bg-secondary rounded-md min-h-25 max-h-75 overflow-y-auto cursor-pointer custom-scrollbar text-foreground",
                isEditMode && "pl-10"
              )}
              onClick={!isEditMode ? handleEdit : undefined}
            >
              {isPreviewMode ? replaceVariables(prompt.content, variables) : prompt.content}
            </pre>
            <div className="absolute top-1 right-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-50">
                  <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDescriptionDialog(true)} className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    {prompt.description ? "Editar descripcion" : "Agregar descripcion"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="text-destructive focus:text-destructive cursor-pointer"
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
                <p className="text-xs text-muted-foreground italic whitespace-pre-wrap flex-1 min-w-0">
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
                    className={cn(isPreviewMode && "ring-2 ring-primary")}
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span className="sr-only">Preview</span>
                  </Button>
                  <TooltipProvider>
                    <Tooltip open={copied}>
                      <TooltipTrigger asChild>
                        <Button size="icon" onClick={handleCopy}>
                          <CopyIcon className="h-4 w-4" />
                          <span className="sr-only">Copy</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Copiado</TooltipContent>
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
        description="Esta accion eliminara el prompt y no se puede deshacer."
      />

      <DescriptionDialog
        isOpen={showDescriptionDialog}
        onClose={() => setShowDescriptionDialog(false)}
        onSave={onUpdateDescription}
        title="Descripcion del prompt"
        initialValue={prompt.description ?? ""}
      />
    </div>
  )
}
