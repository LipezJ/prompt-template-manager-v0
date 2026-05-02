"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, PlusIcon, Eraser } from "lucide-react"
import type { PromptVariable } from "@/types/prompt"
import { ConfirmationDialog } from "@/components/dialogs/confirmation-dialog"
import { DescriptionDialog } from "@/components/dialogs/description-dialog"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { VariableItem } from "./variable-item"

interface VariablesEditorProps {
  variables: PromptVariable[]
  onUpdateVariable: (id: string, value: string) => void
  onUpdateVariableName: (id: string, name: string) => void
  onUpdateVariableDescription: (id: string, description: string) => void
  onAddVariable: () => void
  onDeleteVariable: (id: string) => void
  onClearAllValues: () => void
  onHidePanel?: () => void
  isEditMode?: boolean
}

export function VariablesEditor({
  variables,
  onUpdateVariable,
  onUpdateVariableName,
  onUpdateVariableDescription,
  onAddVariable,
  onDeleteVariable,
  onClearAllValues,
  onHidePanel,
  isEditMode = false,
}: VariablesEditorProps) {
  const [editingVariable, setEditingVariable] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [variableToDelete, setVariableToDelete] = useState<string | null>(null)
  const [showClearConfirmation, setShowClearConfirmation] = useState(false)
  const [descriptionTarget, setDescriptionTarget] = useState<PromptVariable | null>(null)
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
    <div className="app-card-subtle flex h-full min-h-0 flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">Variables</h3>
          <p className="text-xs text-fog">{variables.length} en este set</p>
        </div>
        <div className="flex items-center gap-2">
          {onHidePanel && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onHidePanel}
                    className="h-8 w-8 rounded-2xl text-silver hover:bg-graphite/70 hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Ocultar panel de variables</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ocultar variables</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {variables.length > 0 && (
            <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleClearAllClick}
                  className="h-8 w-8 rounded-2xl border-iron bg-deep-charcoal text-fog hover:bg-graphite hover:text-white"
                >
                  <Eraser className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Vaciar todos los valores</p>
              </TooltipContent>
            </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar">
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
              onEditDescription={setDescriptionTarget}
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
        <div className="sticky bottom-0 pt-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onAddVariable}
            className="h-9 w-full rounded-2xl border-iron/70 bg-transparent text-fog hover:bg-graphite/40 hover:text-white"
          >
            <PlusIcon className="h-4 w-4" />
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

      <DescriptionDialog
        isOpen={!!descriptionTarget}
        onClose={() => setDescriptionTarget(null)}
        onSave={(description) => {
          if (descriptionTarget) onUpdateVariableDescription(descriptionTarget.id, description)
        }}
        title={`Descripción de ${descriptionTarget?.name ?? "variable"}`}
        initialValue={descriptionTarget?.description ?? ""}
      />
    </div>
  )
}
