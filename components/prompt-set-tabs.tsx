"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { PromptSet } from "@/types/prompt"
import { cn } from "@/lib/utils"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { ConfirmationDialog } from "./confirmation-dialog"
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
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {promptSets.map((set) => (
        <div key={set.id} className="flex-shrink-0">
          {editingId === set.id ? (
            <Input
              ref={inputRef}
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={handleSaveEditing}
              onKeyDown={handleKeyDown}
              className="h-7 w-40 bg-zinc-800 border-zinc-700 text-white"
            />
          ) : (
            <div className="flex items-center">
              <div className="flex items-center">
                <Button
                  variant={activePromptSetId === set.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSelectPromptSet(set.id)}
                  className={cn(
                    "h-7 pr-1",
                    activePromptSetId === set.id
                      ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700",
                  )}
                >
                  <span className="mr-1">{set.name}</span>
                  <div className="ml-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-zinc-600 hover:text-zinc-300">
                          <MoreVertical className="h-3 w-3 text-zinc-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white">
                        <DropdownMenuItem onClick={() => handleStartEditing(set)} className="cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar nombre
                        </DropdownMenuItem>
                        {promptSets.length > 1 && (
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(set.id)}
                            className="text-red-400 focus:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Button>
              </div>
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
