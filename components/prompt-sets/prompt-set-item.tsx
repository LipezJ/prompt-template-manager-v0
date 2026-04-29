"use client"

import type React from "react"
import Link from "next/link"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Download, FileTextIcon, GripVertical, MoreVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PromptSetItemProps {
  promptSetId: string
  projectId: string
  name: string
  promptsCount: number
  variablesCount: number
  isEditMode: boolean
  onDeleteClick: (id: string) => void
  onExportPromptSet: (id: string) => void
  onOptionsClick: (e: React.MouseEvent) => void
}

export function PromptSetItem({
  promptSetId,
  projectId,
  name,
  promptsCount,
  variablesCount,
  isEditMode,
  onDeleteClick,
  onExportPromptSet,
  onOptionsClick,
}: PromptSetItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: promptSetId,
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
      className={`bg-zinc-800 rounded-lg p-3 border border-zinc-700 hover:border-zinc-600 transition-colors relative ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      {isEditMode && (
        <div
          className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-zinc-500" />
        </div>
      )}
      <Link
        href={`/projects/${projectId}/prompt-sets?set=${promptSetId}`}
        className={`block ${isEditMode ? "pointer-events-none pl-8" : ""}`}
      >
        <div className="flex items-start">
          <FileTextIcon className="h-4 w-4 text-zinc-400 mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium text-sm">{name}</h3>
            <p className="text-xs text-zinc-400">
              {promptsCount} prompt{promptsCount !== 1 ? "s" : ""}, {variablesCount} variable
              {variablesCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </Link>
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-zinc-700" onClick={onOptionsClick}>
              <MoreVertical className="h-3.5 w-3.5 text-zinc-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white z-50">
            <DropdownMenuItem onClick={() => onExportPromptSet(promptSetId)} className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteClick(promptSetId)}
              className="text-red-400 focus:text-red-400 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
