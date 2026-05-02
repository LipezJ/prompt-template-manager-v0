"use client"

import { useEffect, useRef, useState } from "react"
import { Download, MoreVertical, Pencil, Trash2 } from "lucide-react"
import type { Project } from "@/types/prompt"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getProjectIcon } from "@/lib/project-icons"

interface ProjectHeaderProps {
  project: Project
  canDelete: boolean
  fallbackIconName?: string
  onRename: (name: string) => void
  onExport: () => void
  onDelete: () => void
}

export function ProjectHeader({
  project,
  canDelete,
  fallbackIconName,
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

  const startEditingFromMenu = () => {
    window.setTimeout(startEditing, 120)
  }

  const saveName = () => {
    const trimmed = draftName.trim()
    if (trimmed !== "" && trimmed !== project.name) {
      onRename(draftName)
    }
    setIsEditingName(false)
  }

  const ProjectIcon = getProjectIcon(project.icon ?? fallbackIconName)

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-iron/60 bg-graphite text-electric-blue [box-shadow:hsl(218,_13%,_70%,_0.08)_0_-2px_0_0_inset] md:h-11 md:w-11">
          <ProjectIcon aria-hidden="true" className="h-4 w-4 md:h-5 md:w-5" />
        </div>
        <div className="min-w-0">
          <span className="text-eyebrow">Proyecto</span>
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
              className="h-10 w-full max-w-xl text-base"
            />
          ) : (
            <h1 className="font-serif-display group flex min-w-0 items-center text-2xl leading-tight text-electric-blue md:text-3xl">
              <span className="truncate">{project.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={startEditing}
                className="ml-2 h-7 w-7 shrink-0 text-silver opacity-100 transition md:opacity-0 md:group-hover:opacity-100"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </h1>
          )}
          <p className="max-w-2xl text-sm leading-6 text-silver">
            Revisa y abre los conjuntos de prompts de este proyecto.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 border-iron bg-deep-charcoal text-white">
            <DropdownMenuItem onClick={onExport} className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={startEditingFromMenu} className="cursor-pointer">
              <Pencil className="mr-2 h-4 w-4" />
              Editar nombre
            </DropdownMenuItem>
            {canDelete && (
              <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-danger-red focus:text-danger-red">
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
