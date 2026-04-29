"use client"

import type React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, MoreVertical, Pencil, Trash2 } from "lucide-react"
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

interface VariableItemProps {
  variable: PromptVariable
  isEditMode: boolean
  isEditing: boolean
  editingName: string
  onStartEditingName: (variable: PromptVariable) => void
  onSaveVariableName: (variable: PromptVariable) => void
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
    <div ref={setNodeRef} style={style} className={`space-y-1 ${isDragging ? "shadow-lg" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center">
          {isEditMode && (
            <div className="mr-2 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
              <GripVertical className="h-4 w-4 text-zinc-500" />
            </div>
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
              className="h-6 py-0 text-xs min-h-0 bg-zinc-700 border-zinc-600"
              onFocus={onTextareaFocus}
            />
          ) : (
            <div className="text-xs text-zinc-400 flex items-center">
              <span>{variable.name}</span>
            </div>
          )}
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-zinc-700 hover:text-zinc-300">
                <MoreVertical className="h-3 w-3 text-zinc-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white z-50">
              <DropdownMenuItem onClick={() => onStartEditingName(variable)} className="cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" />
                Editar nombre
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
        className="bg-zinc-700 border-zinc-600 text-white custom-scrollbar"
        minRows={2}
        maxRows={10}
        onFocus={onTextareaFocus}
      />
    </div>
  )
}
