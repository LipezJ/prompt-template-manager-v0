"use client"

import type React from "react"
import Link from "next/link"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Download, FolderIcon, GripVertical, MoreVertical, Trash2 } from "lucide-react"
import type { Project } from "@/types/prompt"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProjectItemProps {
  project: Project
  isEditMode: boolean
  onDeleteClick: (e: React.MouseEvent, id: string) => void
  onExportProject: (e: React.MouseEvent, project: Project) => void
  handleProjectOptions: (e: React.MouseEvent) => void
}

export function ProjectItem({
  project,
  isEditMode,
  onDeleteClick,
  onExportProject,
  handleProjectOptions,
}: ProjectItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
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
      className={`bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 hover:border-zinc-600 transition-colors relative ${
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
      <Link href={`/projects/${project.id}`} className={`block p-4 ${isEditMode ? "pointer-events-none pl-12" : ""}`}>
        <div className="flex items-center mb-2">
          <FolderIcon className="h-5 w-5 text-zinc-400 mr-2" />
          <h2 className="text-base font-medium truncate">{project.name}</h2>
        </div>
        <div className="text-xs text-zinc-400">
          {project.promptSets.length} conjunto{project.promptSets.length !== 1 ? "s" : ""} de prompts
        </div>
      </Link>
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-zinc-700" onClick={handleProjectOptions}>
              <MoreVertical className="h-3.5 w-3.5 text-zinc-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white z-50">
            <DropdownMenuItem onClick={(e) => onExportProject(e, project)} className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => onDeleteClick(e, project.id)}
              className="text-red-400 focus:text-red-400 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar proyecto
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
