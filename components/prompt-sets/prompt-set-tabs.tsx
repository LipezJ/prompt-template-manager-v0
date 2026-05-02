"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { PromptSet } from "@/types/prompt"
import { cn } from "@/lib/utils"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { ConfirmationDialog } from "@/components/dialogs/confirmation-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PromptSetTabsProps {
  promptSets: PromptSet[]
  activePromptSetId: string
  onSelectPromptSet: (id: string) => void
  onUpdateName: (name: string) => void
  onDeletePromptSet: (id: string) => void
}

export function PromptSetTabs({
  promptSets,
  activePromptSetId,
  onSelectPromptSet,
  onUpdateName,
  onDeletePromptSet,
}: PromptSetTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [promptSetToDelete, setPromptSetToDelete] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
      onUpdateName(editingName)
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
    // Prevent re-selecting the same set
    if (id !== activePromptSetId) {
      onSelectPromptSet(id)
    }
  }

  return (
    <div className="flex items-center gap-px overflow-x-auto border-b border-iron/60 pb-px">
      {promptSets.map((set) => (
        <div key={set.id} className="shrink-0">
          {editingId === set.id ? (
            <Input
              ref={inputRef}
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={handleSaveEditing}
              onKeyDown={handleKeyDown}
              className="h-8 w-44"
            />
          ) : (
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleSelectPromptSet(set.id)}
                className={cn(
                  "app-focus relative h-9 px-3 text-sm transition",
                  activePromptSetId === set.id
                    ? "text-white"
                    : "text-silver hover:text-white",
                )}
              >
                {set.name}
                {activePromptSetId === set.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-px bg-electric-blue" />
                )}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "app-focus flex h-9 w-6 items-center justify-center transition",
                      activePromptSetId === set.id
                        ? "text-silver hover:text-white"
                        : "text-ash hover:text-white",
                    )}
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-iron bg-deep-charcoal text-white">
                  <DropdownMenuItem onClick={() => handleStartEditing(set)} className="cursor-pointer">
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar nombre
                  </DropdownMenuItem>
                  {promptSets.length > 1 && (
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(set.id)}
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
      ))}

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
