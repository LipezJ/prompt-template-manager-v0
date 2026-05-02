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
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-magenta-glow/60 bg-[rgba(123,97,255,0.18)] text-electric-blue md:h-16 md:w-16">
          <ProjectIcon aria-hidden="true" className="h-6 w-6 md:h-7 md:w-7" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-neon-pink">Proyecto</p>
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
              className="h-12 w-full max-w-xl rounded-2xl border-iron bg-deep-charcoal text-lg font-semibold text-white focus-visible:ring-violet-pulse md:text-2xl"
            />
          ) : (
            <h1 className="group flex min-w-0 items-center text-3xl font-semibold leading-tight text-white md:text-5xl">
              <span className="truncate">{project.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={startEditing}
                className="ml-2 h-9 w-9 shrink-0 rounded-2xl text-silver opacity-100 transition hover:bg-graphite/70 hover:text-white md:opacity-0 md:group-hover:opacity-100"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </h1>
          )}
          <p className="max-w-2xl text-sm leading-6 text-fog">
            Dashboard operativo para revisar y abrir los conjuntos de prompts de este proyecto.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-2xl text-silver hover:bg-graphite/70 hover:text-white">
              <MoreVertical className="h-4 w-4" />
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
