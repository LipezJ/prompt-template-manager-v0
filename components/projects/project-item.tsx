"use client"

import type React from "react"
import Link from "next/link"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Download, GripVertical, MoreVertical, Pin, Trash2 } from "lucide-react"
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
        "app-card-subtle group relative min-h-44 overflow-hidden p-5 transition hover:border-violet-pulse/80 hover:bg-[rgba(90,31,208,0.16)]",
        isDragging && "opacity-70",
      )}
    >
      {isEditMode && (
        <button
          type="button"
          aria-label={`Reordenar proyecto: ${project.name}`}
          className="app-focus absolute bottom-0 left-0 top-0 z-10 flex w-10 cursor-grab items-center justify-center border-0 bg-transparent active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" className="h-5 w-5 text-silver" />
        </button>
      )}
      {project.pinned && (
        <span className="pointer-events-none absolute left-3 top-3 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-violet-pulse text-white">
          <Pin aria-hidden="true" className="h-3 w-3" />
        </span>
      )}
      <Link href={`/projects/${project.id}`} className={`app-focus block ${isEditMode ? "pointer-events-none pl-8" : ""}`}>
        <div className="mb-8 flex items-start gap-3 pr-8">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(107,87,255,0.22)]">
            <ProjectIcon aria-hidden="true" className="h-5 w-5 text-amethyst" />
          </div>
        </div>
        <h2 className="truncate text-lg font-semibold text-white">{project.name}</h2>
        <div className="mt-3 flex items-center gap-2 text-xs text-fog">
          <span className="rounded-md bg-[rgba(107,87,255,0.48)] px-2 py-1 text-white">
            {project.promptSets.length} set{project.promptSets.length !== 1 ? "s" : ""}
          </span>
          <span>
            {project.promptSets.reduce((sum, set) => sum + set.prompts.length, 0)} prompts
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
              onClick={handleProjectOptions}
            >
              <MoreVertical className="h-4 w-4" />
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
              className="text-red-400 focus:text-red-400 cursor-pointer"
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
