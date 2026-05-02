"use client"

import type React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Check,
  FileText,
  GripVertical,
  ListChecks,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react"
import type { PromptVariable, VariableType } from "@/types/prompt"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface VariableItemProps {
  variable: PromptVariable
  isEditMode: boolean
  isEditing: boolean
  editingName: string
  isMissing?: boolean
  onStartEditingName: (variable: PromptVariable) => void
  onSaveVariableName: (variable: PromptVariable) => void
  onEditDescription: (variable: PromptVariable) => void
  onEditOptions: (variable: PromptVariable) => void
  onDeleteClick: (id: string) => void
  onUpdateVariable: (id: string, value: string) => void
  onUpdateVariableType: (id: string, type: VariableType) => void
  onUpdateVariableOptional: (id: string, optional: boolean) => void
  onEditingNameChange: (value: string) => void
  onTextareaFocus: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  textareaRef: React.Ref<HTMLTextAreaElement>
}

const TYPE_LABELS: Record<VariableType, string> = {
  string: "Texto",
  multiline: "Texto largo",
  boolean: "Booleano",
  select: "Selección",
}

const TYPE_ORDER: VariableType[] = ["string", "multiline", "boolean", "select"]

export function VariableItem({
  variable,
  isEditMode,
  isEditing,
  editingName,
  isMissing = false,
  onStartEditingName,
  onSaveVariableName,
  onEditDescription,
  onEditOptions,
  onDeleteClick,
  onUpdateVariable,
  onUpdateVariableType,
  onUpdateVariableOptional,
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

  const type: VariableType = variable.type ?? "string"
  const isOptional = variable.optional === true
  const options = variable.options ?? []

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("border-b border-iron/60 py-3 last:border-b-0", isDragging && "opacity-70")}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-1.5">
          {isEditMode && (
            <button
              type="button"
              aria-label={`Reordenar variable: ${variable.name}`}
              className="app-focus mr-1 cursor-grab border-0 bg-transparent p-0 active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical aria-hidden="true" className="h-3.5 w-3.5 text-ash" />
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
              className="font-mono-tight h-7 min-h-0 py-1 text-xs"
              onFocus={onTextareaFocus}
            />
          ) : (
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                className={cn(
                  "font-mono-tight truncate text-xs",
                  isMissing ? "text-danger-red" : "text-electric-blue",
                )}
              >
                {variable.name}
                {isMissing && <span aria-hidden="true"> *</span>}
              </span>
              {isOptional && (
                <span className="rounded-sm border border-iron/70 bg-black/30 px-1 py-px text-[9px] uppercase tracking-wide text-ash">
                  opc
                </span>
              )}
            </span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-sm text-silver hover:bg-graphite hover:text-white"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 border-iron bg-deep-charcoal text-white">
            <DropdownMenuLabel className="text-eyebrow">Tipo</DropdownMenuLabel>
            {TYPE_ORDER.map((t) => (
              <DropdownMenuItem
                key={t}
                onClick={() => onUpdateVariableType(variable.id, t)}
                className="cursor-pointer"
              >
                <Check
                  className={cn("mr-2 h-4 w-4", type === t ? "text-electric-blue" : "opacity-0")}
                />
                {TYPE_LABELS[t]}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onUpdateVariableOptional(variable.id, !isOptional)}
              className="cursor-pointer"
            >
              <Check className={cn("mr-2 h-4 w-4", isOptional ? "text-electric-blue" : "opacity-0")} />
              Opcional
            </DropdownMenuItem>
            {type === "select" && (
              <DropdownMenuItem onClick={() => onEditOptions(variable)} className="cursor-pointer">
                <ListChecks className="mr-2 h-4 w-4" />
                Editar opciones
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
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
              className="cursor-pointer text-danger-red focus:text-danger-red"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <VariableValueInput
        variable={variable}
        type={type}
        options={options}
        isMissing={isMissing}
        onUpdateVariable={onUpdateVariable}
        onTextareaFocus={onTextareaFocus}
        textareaRef={textareaRef}
      />

      {variable.description && (
        <p className="mt-2 whitespace-pre-wrap text-xs text-ash">{variable.description}</p>
      )}
    </div>
  )
}

interface VariableValueInputProps {
  variable: PromptVariable
  type: VariableType
  options: NonNullable<PromptVariable["options"]>
  isMissing: boolean
  onUpdateVariable: (id: string, value: string) => void
  onTextareaFocus: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  textareaRef: React.Ref<HTMLTextAreaElement>
}

function VariableValueInput({
  variable,
  type,
  options,
  isMissing,
  onUpdateVariable,
  onTextareaFocus,
  textareaRef,
}: VariableValueInputProps) {
  const errorBorder = isMissing ? "border-danger-red focus-visible:border-danger-red" : ""

  if (type === "boolean") {
    const value = variable.value === "true" ? "true" : "false"
    return (
      <div className="mt-2 flex w-full overflow-hidden rounded-sm border border-iron">
        <BooleanSegment
          active={value === "true"}
          label="Sí"
          onClick={() => onUpdateVariable(variable.id, "true")}
        />
        <BooleanSegment
          active={value === "false"}
          label="No"
          onClick={() => onUpdateVariable(variable.id, "false")}
        />
      </div>
    )
  }

  if (type === "select") {
    if (options.length === 0) {
      return (
        <p className="mt-2 rounded-sm border border-dashed border-iron/60 bg-black/20 px-2.5 py-2 text-xs text-ash">
          Sin opciones definidas. Usa el menú para añadirlas.
        </p>
      )
    }
    return (
      <select
        value={variable.value}
        onChange={(e) => onUpdateVariable(variable.id, e.target.value)}
        className={cn(
          "mt-2 flex h-9 w-full appearance-none rounded-sm border border-iron bg-graphite px-2.5 py-2 text-sm text-white focus-visible:outline-none focus-visible:border-electric-blue/70 focus-visible:ring-1 focus-visible:ring-electric-blue/40",
          errorBorder,
        )}
      >
        {options.map((option) => (
          <option key={option.id} value={option.value}>
            {option.label.trim() === "" ? option.value : option.label}
          </option>
        ))}
      </select>
    )
  }

  if (type === "string") {
    return (
      <Input
        value={variable.value}
        onChange={(e) => onUpdateVariable(variable.id, e.target.value)}
        className={cn("font-mono-tight mt-2 h-9 text-sm", errorBorder)}
        onFocus={(e) => e.currentTarget.select()}
      />
    )
  }

  return (
    <AutoResizeTextarea
      ref={textareaRef}
      value={variable.value}
      onChange={(e) => onUpdateVariable(variable.id, e.target.value)}
      className={cn("font-mono-tight mt-2 custom-scrollbar", errorBorder)}
      minRows={2}
      maxRows={10}
      onFocus={onTextareaFocus}
    />
  )
}

interface BooleanSegmentProps {
  active: boolean
  label: string
  onClick: () => void
}

function BooleanSegment({ active, label, onClick }: BooleanSegmentProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "app-focus flex-1 px-3 py-2 text-sm transition",
        active
          ? "bg-electric-blue/15 text-white"
          : "bg-graphite text-silver hover:bg-iron/60 hover:text-white",
      )}
    >
      {label}
    </button>
  )
}
