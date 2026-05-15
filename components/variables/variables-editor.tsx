"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Columns2, PlusIcon, Eraser } from "lucide-react"
import type { PromptVariable, SelectOption, VariableType } from "@/types/prompt"
import { ConfirmationDialog } from "@/components/dialogs/confirmation-dialog"
import { DescriptionDialog } from "@/components/dialogs/description-dialog"
import { SelectOptionsDialog } from "@/components/dialogs/select-options-dialog"
import { SortableContext, rectSortingStrategy, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { VariableItem } from "./variable-item"

interface VariablesEditorProps {
  variables: PromptVariable[]
  globalVariables: PromptVariable[]
  onUpdateVariable: (id: string, value: string) => void
  onUpdateVariableName: (id: string, name: string) => void
  onUpdateVariableDescription: (id: string, description: string) => void
  onUpdateVariableType: (id: string, type: VariableType) => void
  onUpdateVariableOptional: (id: string, optional: boolean) => void
  onUpdateVariableOptions: (id: string, options: SelectOption[]) => void
  onPromoteToGlobal: (id: string) => void
  onDemoteToLocal: (id: string) => void
  onAddVariable: () => void
  onDeleteVariable: (id: string) => void
  onClearAllValues: () => void
  onHidePanel?: () => void
  isEditMode?: boolean
  missingVariableIds?: string[]
  twoColumn?: boolean
  onToggleTwoColumn?: () => void
}

export function VariablesEditor({
  variables,
  globalVariables,
  onUpdateVariable,
  onUpdateVariableName,
  onUpdateVariableDescription,
  onUpdateVariableType,
  onUpdateVariableOptional,
  onUpdateVariableOptions,
  onPromoteToGlobal,
  onDemoteToLocal,
  onAddVariable,
  onDeleteVariable,
  onClearAllValues,
  onHidePanel,
  isEditMode = false,
  missingVariableIds,
  twoColumn = false,
  onToggleTwoColumn,
}: VariablesEditorProps) {
  const missingSet = missingVariableIds ? new Set(missingVariableIds) : undefined
  const [editingVariable, setEditingVariable] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [variableToDelete, setVariableToDelete] = useState<string | null>(null)
  const [showClearConfirmation, setShowClearConfirmation] = useState(false)
  const [descriptionTarget, setDescriptionTarget] = useState<PromptVariable | null>(null)
  const [optionsTarget, setOptionsTarget] = useState<PromptVariable | null>(null)
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({})

  const totalCount = globalVariables.length + variables.length

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

  const renderItem = (variable: PromptVariable, isGlobal: boolean) => (
    <VariableItem
      key={variable.id}
      variable={variable}
      isEditMode={isEditMode}
      isEditing={editingVariable === variable.id}
      editingName={editingName}
      isMissing={missingSet?.has(variable.id) ?? false}
      isGlobal={isGlobal}
      onStartEditingName={handleStartEditingName}
      onSaveVariableName={handleSaveVariableName}
      onEditDescription={setDescriptionTarget}
      onEditOptions={setOptionsTarget}
      onDeleteClick={handleDeleteClick}
      onUpdateVariable={onUpdateVariable}
      onUpdateVariableType={onUpdateVariableType}
      onUpdateVariableOptional={onUpdateVariableOptional}
      onPromoteToGlobal={onPromoteToGlobal}
      onDemoteToLocal={onDemoteToLocal}
      onEditingNameChange={setEditingName}
      onTextareaFocus={handleTextareaFocus}
      textareaRef={(el) => {
        textareaRefs.current[variable.id] = el
      }}
    />
  )

  const allItemIds = [...globalVariables.map((v) => v.id), ...variables.map((v) => v.id)]

  return (
    <div className="flex h-full min-h-0 flex-col rounded-sm border border-iron bg-deep-charcoal px-4 py-4">
      <div className="flex items-center justify-between border-b border-iron/60 pb-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-eyebrow">Variables</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono-tight text-[11px] text-ash">{totalCount}</span>
          {onHidePanel && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onHidePanel} className="h-7 w-7">
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span className="sr-only">Ocultar panel de variables</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ocultar variables</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {totalCount > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleClearAllClick} className="h-7 w-7">
                    <Eraser className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Vaciar todos los valores</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {onToggleTwoColumn && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onToggleTwoColumn}
                    className={cn("h-7 w-7", twoColumn && "border-electric-blue text-white")}
                  >
                    <Columns2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{twoColumn ? "Una columna" : "Dos columnas"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <SortableContext
          items={allItemIds}
          strategy={twoColumn ? rectSortingStrategy : verticalListSortingStrategy}
        >
          {globalVariables.length > 0 && (
            <div
              className={cn(
                "border-b border-iron/40 pb-1",
                twoColumn && "grid grid-cols-2 gap-x-4",
              )}
            >
              {globalVariables.map((variable) => renderItem(variable, true))}
            </div>
          )}
          <div className={cn(twoColumn && "grid grid-cols-2 gap-x-4")}>
            {variables.map((variable) => renderItem(variable, false))}
          </div>
        </SortableContext>
      </div>
      {!isEditMode && (
        <div className="sticky bottom-0 pt-3">
          <Button variant="outline" size="icon" onClick={onAddVariable} className="h-8 w-full">
            <PlusIcon className="h-3.5 w-3.5" />
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

      <SelectOptionsDialog
        isOpen={!!optionsTarget}
        onClose={() => setOptionsTarget(null)}
        onSave={(options) => {
          if (optionsTarget) onUpdateVariableOptions(optionsTarget.id, options)
        }}
        variableName={optionsTarget?.name ?? "variable"}
        initialOptions={optionsTarget?.options ?? []}
      />
    </div>
  )
}
