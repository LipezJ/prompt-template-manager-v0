"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea"
import { Button } from "@/components/ui/button"
import { PlusIcon, MoreVertical, Pencil, Trash2, Eraser, GripVertical } from "lucide-react"
import type { PromptVariable } from "@/types/prompt"
import { ConfirmationDialog } from "./confirmation-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SortableVariableItemProps {
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
  textareaRef: React.RefObject<HTMLTextAreaElement>
}

function SortableVariableItem({
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
}: SortableVariableItemProps) {
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
            <DropdownMenuTrigger>
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

interface PromptEditorProps {
  variables: PromptVariable[]
  onUpdateVariable: (id: string, value: string) => void
  onUpdateVariableName: (id: string, name: string) => void
  onAddVariable: () => void
  onDeleteVariable: (id: string) => void
  onClearAllValues: () => void
  isEditMode?: boolean
}

export function PromptEditor({
  variables,
  onUpdateVariable,
  onUpdateVariableName,
  onAddVariable,
  onDeleteVariable,
  onClearAllValues,
  isEditMode = false,
}: PromptEditorProps) {
  const [editingVariable, setEditingVariable] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [variableToDelete, setVariableToDelete] = useState<string | null>(null)
  const [showClearConfirmation, setShowClearConfirmation] = useState(false)
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({})

  const handleStartEditingName = (variable: PromptVariable) => {
    setEditingVariable(variable.id)
    setEditingName(variable.name)
  }

  const handleSaveVariableName = (variable: PromptVariable) => {
    if (editingName.trim() !== "") {
      onUpdateVariableName(variable.id, editingName)
    }
    setEditingVariable(null)
  }

  const handleDeleteClick = (id: string) => {
    setVariableToDelete(id)
  }

  const handleConfirmDelete = () => {
    if (variableToDelete) {
      onDeleteVariable(variableToDelete)
      setVariableToDelete(null)
    }
  }

  const handleTextareaFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.target.select()
  }

  const handleClearAllClick = () => {
    setShowClearConfirmation(true)
  }

  const handleConfirmClearAll = () => {
    onClearAllValues()
    setShowClearConfirmation(false)
  }

  return (
    <div className="bg-zinc-800 rounded-md p-4 h-full flex flex-col min-h-0">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Variables</h3>
        {variables.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleClearAllClick}
                  className="h-7 w-7 bg-zinc-700 hover:bg-zinc-600 border-zinc-600"
                >
                  <Eraser className="h-3.5 w-3.5 text-zinc-300" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Vaciar todos los valores</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-0 custom-scrollbar">
        <SortableContext items={variables.map((v) => v.id)} strategy={verticalListSortingStrategy}>
          {variables.map((variable) => (
            <SortableVariableItem
              key={variable.id}
              variable={variable}
              isEditMode={isEditMode}
              isEditing={editingVariable === variable.id}
              editingName={editingName}
              onStartEditingName={handleStartEditingName}
              onSaveVariableName={handleSaveVariableName}
              onDeleteClick={handleDeleteClick}
              onUpdateVariable={onUpdateVariable}
              onEditingNameChange={setEditingName}
              onTextareaFocus={handleTextareaFocus}
              textareaRef={(el) => (textareaRefs.current[variable.id] = el)}
            />
          ))}
        </SortableContext>
      </div>
      {!isEditMode && (
        <div className="pt-4 sticky bottom-0 bg-zinc-800">
          <Button
            variant="outline"
            size="icon"
            onClick={onAddVariable}
            className="w-full h-8 bg-zinc-700 hover:bg-zinc-600 border-zinc-600"
          >
            <PlusIcon className="h-4 w-4 text-zinc-300" />
          </Button>
        </div>
      )}

      <ConfirmationDialog
        isOpen={!!variableToDelete}
        onClose={() => setVariableToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar variable"
        description="¿Estás seguro de que deseas eliminar esta variable? Esta acción no se puede deshacer."
      />

      <ConfirmationDialog
        isOpen={showClearConfirmation}
        onClose={() => setShowClearConfirmation(false)}
        onConfirm={handleConfirmClearAll}
        title="Vaciar valores"
        description="¿Estás seguro de que deseas vaciar todos los valores de las variables? Esta acción no se puede deshacer."
      />
    </div>
  )
}
