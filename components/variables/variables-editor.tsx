"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { PlusIcon, Eraser } from "lucide-react"
import type { PromptVariable } from "@/types/prompt"
import { ConfirmationDialog } from "@/components/dialogs/confirmation-dialog"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { VariableItem } from "./variable-item"

interface VariablesEditorProps {
  variables: PromptVariable[]
  onUpdateVariable: (id: string, value: string) => void
  onUpdateVariableName: (id: string, name: string) => void
  onAddVariable: () => void
  onDeleteVariable: (id: string) => void
  onClearAllValues: () => void
  isEditMode?: boolean
}

export function VariablesEditor({
  variables,
  onUpdateVariable,
  onUpdateVariableName,
  onAddVariable,
  onDeleteVariable,
  onClearAllValues,
  isEditMode = false,
}: VariablesEditorProps) {
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
            <VariableItem
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
              textareaRef={(el) => {
                textareaRefs.current[variable.id] = el
              }}
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
