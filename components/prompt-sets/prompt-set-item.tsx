"use client"

import type React from "react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { BracesIcon, Download, FileTextIcon, GripVertical, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  onRenamePromptSet: (id: string, name: string) => void
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
  onRenamePromptSet,
  onOptionsClick,
}: PromptSetItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: promptSetId,
  })
  const [isEditingName, setIsEditingName] = useState(false)
  const [draftName, setDraftName] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditingName) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditingName])

  const startEditing = () => {
    setDraftName(name)
    setIsEditingName(true)
  }

  const commitEditing = () => {
    if (draftName.trim() !== "" && draftName !== name) {
      onRenamePromptSet(promptSetId, draftName.trim())
    }
    setIsEditingName(false)
  }

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      commitEditing()
    } else if (e.key === "Escape") {
      e.preventDefault()
      setIsEditingName(false)
    }
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  }

  const linkDisabled = isEditMode || isEditingName

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "hover-clone group relative cursor-pointer rounded-sm border border-iron/60 bg-deep-charcoal p-2.5 transition [box-shadow:hsl(218,_13%,_70%,_0.08)_0_-2px_0_0_inset] hover:border-amethyst/50",
        isDragging && "opacity-70",
      )}
    >
      {isEditMode && (
        <button
          type="button"
          aria-label={`Reordenar conjunto: ${name}`}
          className="app-focus absolute bottom-0 left-0 top-0 z-10 flex w-6 cursor-grab items-center justify-center border-0 bg-transparent active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" className="h-3.5 w-3.5 text-ash" />
        </button>
      )}
      <Link
        href={`/projects/${projectId}/prompt-sets?set=${promptSetId}`}
        className={cn(
          "app-focus flex flex-col items-start gap-0.5",
          linkDisabled && "pointer-events-none",
          isEditMode && "pl-5",
        )}
        tabIndex={linkDisabled ? -1 : undefined}
      >
        <div className="flex w-full items-center justify-between gap-2 pr-5">
          {isEditingName ? (
            <Input
              ref={inputRef}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={commitEditing}
              onKeyDown={handleNameKeyDown}
              onClick={(e) => e.preventDefault()}
              className="pointer-events-auto h-7 px-1.5 py-1 text-sm"
            />
          ) : (
            <p className="truncate text-left text-sm text-white group-hover:text-amethyst">{name}</p>
          )}
          <p className="flex shrink-0 items-center gap-1.5 text-xs text-silver">
            <FileTextIcon aria-hidden="true" className="size-3" />
            {promptsCount}
          </p>
        </div>
        <p className="w-[95%] truncate text-left text-[.75rem] text-silver">
          {promptsCount} prompt{promptsCount !== 1 ? "s" : ""} usando {variablesCount} variable
          {variablesCount !== 1 ? "s" : ""}
        </p>
        <div className="flex min-h-4.5 max-w-full items-center gap-1 text-[.75rem] text-ash">
          <BracesIcon aria-hidden="true" className="size-3 text-silver" />
          <p className="truncate">
            {variablesCount} variable{variablesCount !== 1 ? "s" : ""}
          </p>
        </div>
      </Link>
      <div className="absolute top-2 right-2 opacity-0 transition group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-sm text-silver hover:bg-graphite hover:text-white"
              onClick={onOptionsClick}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 border-iron bg-deep-charcoal text-white">
            <DropdownMenuItem onClick={startEditing} className="cursor-pointer">
              <Pencil className="mr-2 h-4 w-4" />
              Editar nombre
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExportPromptSet(promptSetId)} className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteClick(promptSetId)}
              className="cursor-pointer text-danger-red focus:text-danger-red"
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
