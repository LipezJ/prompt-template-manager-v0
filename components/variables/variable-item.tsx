"use client"

import type React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, MoreVertical, Pencil, Trash2, FileText } from "lucide-react"
import type { PromptVariable } from "@/types/prompt"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface VariableItemProps {
  variable: PromptVariable
  isEditMode: boolean
  isEditing: boolean
  editingName: string
  onStartEditingName: (variable: PromptVariable) => void
  onSaveVariableName: (variable: PromptVariable) => void
  onEditDescription: (variable: PromptVariable) => void
  onDeleteClick: (id: string) => void
  onUpdateVariable: (id: string, value: string) => void
  onEditingNameChange: (value: string) => void
  onTextareaFocus: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  textareaRef: React.Ref<HTMLTextAreaElement>
}

export function VariableItem({
  variable,
  isEditMode,
  isEditing,
  editingName,
  onStartEditingName,
  onSaveVariableName,
  onEditDescription,
  onDeleteClick,
  onUpdateVariable,
  onEditingNameChange,
  onTextareaFocus,
  textareaRef,
}: VariableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: variable.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={cn("space-y-1", isDragging && "shadow-lg")}>
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center">
          {isEditMode && (
            <button
              type="button"
              aria-label={`Reordenar variable: ${variable.name}`}
              className="mr-2 cursor-grab active:cursor-grabbing bg-transparent border-0 p-0"
              {...attributes}
              {...listeners}
            >
              <GripVertical aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          {isEditing ? (
            <Textarea
              value={editingName}
              onChange={(e) => onEditingNameChange(e.target.value)}
              onBlur={() => onSaveVariableName(variable)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  onSaveVariableName(variable)
                }
              }}
              className="h-6 py-0 text-xs min-h-0"
              onFocus={onTextareaFocus}
            />
          ) : (
            <div className="text-xs text-muted-foreground flex items-center">
              <span>{variable.name}</span>
            </div>
          )}
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50">
              <DropdownMenuItem onClick={() => onStartEditingName(variable)} className="cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" />
                Editar nombre
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditDescription(variable)} className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                {variable.description ? "Editar descripcion" : "Agregar descripcion"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteClick(variable.id)}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <AutoResizeTextarea
        ref={textareaRef}
        value={variable.value}
        onChange={(e) => onUpdateVariable(variable.id, e.target.value)}
        className="bg-secondary border-border custom-scrollbar"
        minRows={2}
        maxRows={10}
        onFocus={onTextareaFocus}
      />
      {variable.description && (
        <p className="text-xs text-muted-foreground italic whitespace-pre-wrap">{variable.description}</p>
      )}
    </div>
  )
}
