"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import type { PromptSet } from "@/types/prompt"
import { cn } from "@/lib/utils"
import { GripVertical, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { ConfirmationDialog } from "@/components/dialogs/confirmation-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { dndAnnouncements } from "@/lib/dnd-announcements"
import { restrictToHorizontalAxis, restrictToParentElement } from "@/lib/dnd-modifiers"

interface PromptSetTabsProps {
  promptSets: PromptSet[]
  activePromptSetId: string
  isEditMode?: boolean
  onSelectPromptSet: (id: string) => void
  onUpdateName: (id: string, name: string) => void
  onDeletePromptSet: (id: string) => void
  onReorderPromptSets?: (oldIndex: number, newIndex: number) => void
}

export function PromptSetTabs({
  promptSets,
  activePromptSetId,
  isEditMode = false,
  onSelectPromptSet,
  onUpdateName,
  onDeletePromptSet,
  onReorderPromptSets,
}: PromptSetTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [promptSetToDelete, setPromptSetToDelete] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingId])

  const handleStartEditing = (set: PromptSet) => {
    setEditingId(set.id)
    setEditingName(set.name)
  }

  const handleSaveEditing = () => {
    if (editingId && editingName.trim() !== "") {
      onUpdateName(editingId, editingName)
    }
    setEditingId(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEditing()
    } else if (e.key === "Escape") {
      setEditingId(null)
    }
  }

  const handleDeleteClick = (id: string) => {
    setPromptSetToDelete(id)
  }

  const handleConfirmDelete = () => {
    if (promptSetToDelete) {
      onDeletePromptSet(promptSetToDelete)
      setPromptSetToDelete(null)
    }
  }

  const handleSelectPromptSet = (id: string) => {
    if (id !== activePromptSetId) {
      onSelectPromptSet(id)
    }
  }

  const handleDragEnd = (event: any) => {
    if (!onReorderPromptSets) return
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = promptSets.findIndex((s) => s.id === active.id)
    const newIndex = promptSets.findIndex((s) => s.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) onReorderPromptSets(oldIndex, newIndex)
  }

  const reorderEnabled = isEditMode && Boolean(onReorderPromptSets)

  return (
    <div className="flex items-center gap-px border-b border-iron/60 pb-px">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
        onDragEnd={handleDragEnd}
        accessibility={{ announcements: dndAnnouncements }}
      >
        <SortableContext items={promptSets.map((s) => s.id)} strategy={horizontalListSortingStrategy}>
          {promptSets.map((set) => (
            <SortablePromptSetTab
              key={set.id}
              set={set}
              isActive={activePromptSetId === set.id}
              isEditing={editingId === set.id}
              editingName={editingName}
              setEditingName={setEditingName}
              inputRef={inputRef}
              reorderEnabled={reorderEnabled}
              canDelete={promptSets.length > 1}
              onSelect={handleSelectPromptSet}
              onSaveEditing={handleSaveEditing}
              onKeyDown={handleKeyDown}
              onStartEditing={handleStartEditing}
              onDelete={handleDeleteClick}
            />
          ))}
        </SortableContext>
      </DndContext>

      <ConfirmationDialog
        isOpen={!!promptSetToDelete}
        onClose={() => setPromptSetToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar conjunto de prompts"
        description="¿Estás seguro de que deseas eliminar este conjunto de prompts? Esta acción no se puede deshacer."
      />
    </div>
  )
}

interface SortableTabProps {
  set: PromptSet
  isActive: boolean
  isEditing: boolean
  editingName: string
  setEditingName: (value: string) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  reorderEnabled: boolean
  canDelete: boolean
  onSelect: (id: string) => void
  onSaveEditing: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onStartEditing: (set: PromptSet) => void
  onDelete: (id: string) => void
}

function SortablePromptSetTab({
  set,
  isActive,
  isEditing,
  editingName,
  setEditingName,
  inputRef,
  reorderEnabled,
  canDelete,
  onSelect,
  onSaveEditing,
  onKeyDown,
  onStartEditing,
  onDelete,
}: SortableTabProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: set.id,
    disabled: !reorderEnabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="shrink-0">
      {isEditing ? (
        <Input
          ref={inputRef}
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
          onBlur={onSaveEditing}
          onKeyDown={onKeyDown}
          className="h-8 w-44"
        />
      ) : (
        <div className="flex items-center">
          {reorderEnabled && (
            <button
              type="button"
              aria-label={`Reordenar conjunto: ${set.name}`}
              className="app-focus flex h-9 w-5 cursor-grab items-center justify-center text-ash hover:text-white active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onSelect(set.id)}
            className={cn(
              "app-focus relative h-9 px-3 text-sm transition",
              isActive ? "text-white" : "text-silver hover:text-white",
            )}
          >
            {set.name}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-electric-blue" />
            )}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "app-focus flex h-9 w-6 items-center justify-center transition",
                  isActive ? "text-silver hover:text-white" : "text-ash hover:text-white",
                )}
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-iron bg-deep-charcoal text-white">
              <DropdownMenuItem onClick={() => onStartEditing(set)} className="cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" />
                Editar nombre
              </DropdownMenuItem>
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(set.id)}
                  className="cursor-pointer text-danger-red focus:text-danger-red"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
