"use client"

import type React from "react"
import Link from "next/link"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Download, FileTextIcon, GripVertical, MoreVertical, Pin, Trash2 } from "lucide-react"
import type { Project } from "@/types/prompt"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { getProjectIcon, getProjectIconByIndex } from "@/lib/project-icons"
import { useProjectsContext } from "@/lib/projects-provider"
import { ProjectIconPicker, ProjectPinToggle } from "./project-options"

interface ProjectItemProps {
  project: Project
  index: number
  isEditMode: boolean
  onDeleteClick: (e: React.MouseEvent, id: string) => void
  onExportProject: (e: React.MouseEvent, project: Project) => void
  handleProjectOptions: (e: React.MouseEvent) => void
}

export function ProjectItem({
  project,
  index,
  isEditMode,
  onDeleteClick,
  onExportProject,
  handleProjectOptions,
}: ProjectItemProps) {
  const { updateProject } = useProjectsContext()
  const fallbackIconName = getProjectIconByIndex(index).name
  const iconName = project.icon ?? fallbackIconName
  const ProjectIcon = getProjectIcon(iconName)
  const setIcon = (icon: string) => updateProject(project.id, (current) => ({ ...current, icon }))
  const setPinned = (pinned: boolean) => updateProject(project.id, (current) => ({ ...current, pinned }))
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
      className={cn(
        "hover-clone group relative cursor-pointer rounded-sm border border-iron/60 bg-deep-charcoal p-2.5 transition [box-shadow:hsl(218,_13%,_70%,_0.08)_0_-2px_0_0_inset] hover:border-amethyst/50",
        isDragging && "opacity-70",
      )}
    >
      {isEditMode && (
        <button
          type="button"
          aria-label={`Reordenar proyecto: ${project.name}`}
          className="app-focus absolute bottom-0 left-0 top-0 z-10 flex w-6 cursor-grab items-center justify-center border-0 bg-transparent active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" className="h-3.5 w-3.5 text-ash" />
        </button>
      )}
      <Link
        href={`/projects/${project.id}`}
        className={cn("app-focus flex flex-col items-start gap-0.5", isEditMode && "pointer-events-none pl-5")}
      >
        <div className="flex w-full items-center justify-between gap-2 pr-5">
          <p className="truncate text-left text-sm text-white group-hover:text-amethyst">
            {project.name}
          </p>
          <p className="flex shrink-0 items-center gap-1.5 text-xs text-silver mr-2">
            <FileTextIcon aria-hidden="true" className="size-3" />
            {project.promptSets.reduce((sum, set) => sum + set.prompts.length, 0)}
          </p>
        </div>
        <p className="w-[95%] truncate text-left text-[.75rem] text-silver">
          {project.promptSets.length} conjunto{project.promptSets.length !== 1 ? "s" : ""} de prompts
        </p>
        <div className="flex min-h-4.5 max-w-full items-center gap-1 text-[.75rem] text-ash">
          {project.pinned ? (
            <Pin aria-hidden="true" className="size-3 text-electric-blue" />
          ) : (
            <ProjectIcon aria-hidden="true" className="size-3 text-silver" />
          )}
          <p className="truncate">{project.pinned ? "Fijado" : "Local"}</p>
        </div>
      </Link>
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-sm text-silver hover:bg-graphite hover:text-white"
              onClick={handleProjectOptions}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 w-64 border-iron bg-deep-charcoal text-white">
            <ProjectPinToggle pinned={project.pinned} onChange={setPinned} />
            <DropdownMenuItem onClick={(e) => onExportProject(e, project)} className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => onDeleteClick(e, project.id)}
              className="cursor-pointer text-danger-red focus:text-danger-red"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar proyecto
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <ProjectIconPicker selectedIconName={iconName} onSelect={setIcon} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
