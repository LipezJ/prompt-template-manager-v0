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
    <div
      ref={setNodeRef}
      style={style}
      className={cn("border-b border-iron/45 py-4 last:border-b-0", isDragging && "opacity-70")}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center">
          {isEditMode && (
            <button
              type="button"
              aria-label={`Reordenar variable: ${variable.name}`}
              className="app-focus mr-2 cursor-grab border-0 bg-transparent p-0 active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical aria-hidden="true" className="h-4 w-4 text-silver" />
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
              className="min-h-0 h-7 rounded-xl border-iron/60 bg-black/20 py-1 text-xs text-white focus-visible:ring-violet-pulse"
              onFocus={onTextareaFocus}
            />
          ) : (
            <div className="flex items-center text-xs font-medium text-fog">
              <span>{variable.name}</span>
            </div>
          )}
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-xl text-silver hover:bg-graphite/70 hover:text-white">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50 border-iron bg-deep-charcoal text-white">
              <DropdownMenuItem onClick={() => onStartEditingName(variable)} className="cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" />
                Editar nombre
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditDescription(variable)} className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                {variable.description ? "Editar descripción" : "Añadir descripción"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteClick(variable.id)}
                className="text-red-400 focus:text-red-400 cursor-pointer"
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
        className="mt-2 rounded-xl border-iron/55 bg-black/20 text-white custom-scrollbar focus-visible:ring-violet-pulse"
        minRows={2}
        maxRows={10}
        onFocus={onTextareaFocus}
      />
      {variable.description && (
        <p className="mt-2 whitespace-pre-wrap text-xs italic text-silver">{variable.description}</p>
      )}
    </div>
  )
}
