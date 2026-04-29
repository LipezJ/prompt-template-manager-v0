"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Download, FileTextIcon, MoreVertical, Pencil, Trash2 } from "lucide-react"
import type { Project } from "@/types/prompt"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditModeToggle } from "@/components/layout/edit-mode-toggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProjectHeaderProps {
  project: Project
  isEditMode: boolean
  canDelete: boolean
  onToggleEditMode: () => void
  onRename: (name: string) => void
  onExport: () => void
  onDelete: () => void
}

export function ProjectHeader({
  project,
  isEditMode,
  canDelete,
  onToggleEditMode,
  onRename,
  onExport,
  onDelete,
}: ProjectHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [draftName, setDraftName] = useState(project.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isEditingName) return
    const id = window.setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
    return () => window.clearTimeout(id)
  }, [isEditingName])

  const startEditing = () => {
    setDraftName(project.name)
    setIsEditingName(true)
  }

  const saveName = () => {
    const trimmed = draftName.trim()
    if (trimmed !== "" && trimmed !== project.name) {
      onRename(draftName)
    }
    setIsEditingName(false)
  }

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center">
        {isEditingName ? (
          <Input
            ref={inputRef}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveName()
              if (e.key === "Escape") setIsEditingName(false)
            }}
            className="h-8 w-64 bg-zinc-800 border-zinc-700 text-white"
          />
        ) : (
          <h1 className="text-xl font-bold group flex items-center">
            <span>{project.name}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={startEditing}
              className="h-6 w-6 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Pencil className="h-3.5 w-3.5 text-zinc-400" />
            </Button>
          </h1>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <EditModeToggle isEditMode={isEditMode} onToggle={onToggleEditMode} />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/projects/${project.id}/prompt-sets`}>
                <Button size="icon" className="h-7 w-7 bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
                  <FileTextIcon className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ver Prompt Sets</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-zinc-800">
              <MoreVertical className="h-4 w-4 text-zinc-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white z-50">
            <DropdownMenuItem onClick={onExport} className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={startEditing} className="cursor-pointer">
              <Pencil className="mr-2 h-4 w-4" />
              Editar nombre
            </DropdownMenuItem>
            {canDelete && (
              <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-400 cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar proyecto
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
