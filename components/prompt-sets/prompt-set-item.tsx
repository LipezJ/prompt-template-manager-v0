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
import { cn } from "@/lib/utils"

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
      className={cn(
        "app-card-subtle group relative min-h-40 p-5 transition hover:border-violet-pulse/80 hover:bg-[rgba(90,31,208,0.16)]",
        isDragging && "opacity-70",
      )}
    >
      {isEditMode && (
        <button
          type="button"
          aria-label={`Reordenar conjunto: ${name}`}
          className="app-focus absolute bottom-0 left-0 top-0 z-10 flex w-10 cursor-grab items-center justify-center border-0 bg-transparent active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" className="h-5 w-5 text-silver" />
        </button>
      )}
      <Link
        href={`/projects/${projectId}/prompt-sets?set=${promptSetId}`}
        className={`app-focus block ${isEditMode ? "pointer-events-none pl-8" : ""}`}
      >
        <div className="mb-8 flex items-start gap-3 pr-8">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(24,163,250,0.14)]">
            <FileTextIcon className="h-4 w-4 text-electric-blue" />
          </div>
        </div>
        <h3 className="truncate text-base font-semibold text-white">{name}</h3>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-fog">
          <span className="rounded-md bg-[rgba(107,87,255,0.48)] px-2 py-1 text-white">
            {promptsCount} prompt{promptsCount !== 1 ? "s" : ""}
          </span>
          <span>
            {variablesCount} variable{variablesCount !== 1 ? "s" : ""}
          </span>
        </div>
      </Link>
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-2xl text-silver hover:bg-graphite/70 hover:text-white"
              onClick={onOptionsClick}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 border-iron bg-deep-charcoal text-white">
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
