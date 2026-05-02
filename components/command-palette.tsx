"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowRight,
  FolderKanban,
  Layers3,
  Plus,
  Sparkles,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useProjectsContext } from "@/lib/projects-provider"
import { getProjectIcon, getProjectIconByIndex } from "@/lib/project-icons"
import { newId } from "@/lib/ids"
import type { Project, PromptSet } from "@/types/prompt"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const pathname = usePathname() ?? "/"
  const { projects, addProject, updateProject } = useProjectsContext()
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!open) setSearch("")
  }, [open])

  const currentProjectId = useMemo(() => {
    const match = pathname.match(/^\/projects\/([^/]+)/)
    return match?.[1]
  }, [pathname])

  const currentProject = useMemo(
    () => projects.find((p) => p.id === currentProjectId),
    [projects, currentProjectId],
  )

  const sortedProjects = useMemo(
    () =>
      projects
        .map((project, index) => ({ project, index }))
        .sort(
          (a, b) =>
            Number(Boolean(b.project.pinned)) - Number(Boolean(a.project.pinned)) || a.index - b.index,
        ),
    [projects],
  )

  const runCommand = useCallback(
    (action: () => void) => {
      action()
      onOpenChange(false)
    },
    [onOpenChange],
  )

  const handleCreateProject = useCallback(() => {
    const created = addProject()
    router.push(`/projects/${created.id}`)
  }, [addProject, router])

  const handleCreatePromptSet = useCallback(
    (project: Project) => {
      const newSet: PromptSet = {
        id: newId("set"),
        name: `Nuevo Set ${project.promptSets.length + 1}`,
        variables: [],
        prompts: [{ id: newId("prompt"), content: "Nuevo prompt" }],
        uiPreferences: { splitPosition: 50, variablesPanelVisible: true, cardView: false },
      }
      updateProject(project.id, (p) => ({ ...p, promptSets: [...p.promptSets, newSet] }))
      router.push(`/projects/${project.id}/prompt-sets?set=${newSet.id}`)
    },
    [router, updateProject],
  )

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        value={search}
        onValueChange={setSearch}
        placeholder="Buscar proyectos, prompt sets o acciones…"
      />
      <CommandList>
        <CommandEmpty>Sin resultados.</CommandEmpty>

        <CommandGroup heading="Navegar">
          <CommandItem
            value="ir a proyectos inicio"
            onSelect={() => runCommand(() => router.push("/"))}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-iron/70 bg-black/40 text-electric-blue">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
            </span>
            <span className="text-white">Todos los proyectos</span>
            <CommandShortcut>↵</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        {sortedProjects.length > 0 && (
          <CommandGroup heading="Proyectos">
            {sortedProjects.map(({ project, index }) => {
              const Icon = getProjectIcon(project.icon ?? getProjectIconByIndex(index).name)
              return (
                <CommandItem
                  key={project.id}
                  value={`proyecto ${project.name} ${project.id}`}
                  onSelect={() => runCommand(() => router.push(`/projects/${project.id}`))}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-iron/70 bg-black/40 text-amethyst">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-white">{project.name}</span>
                    <span className="text-xs text-silver">
                      {project.promptSets.length} set{project.promptSets.length !== 1 ? "s" : ""}
                    </span>
                  </span>
                  {project.pinned && (
                    <span className="rounded-sm border border-iron/70 bg-black/40 px-1.5 py-0.5 font-mono-tight text-[10px] text-electric-blue">
                      Fijado
                    </span>
                  )}
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-silver" />
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}

        {currentProject && currentProject.promptSets.length > 0 && (
          <CommandGroup heading={`Prompt sets de ${currentProject.name}`}>
            {currentProject.promptSets.map((set) => (
              <CommandItem
                key={set.id}
                value={`set ${set.name} ${set.id} ${currentProject.name}`}
                onSelect={() =>
                  runCommand(() =>
                    router.push(`/projects/${currentProject.id}/prompt-sets?set=${set.id}`),
                  )
                }
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-iron/70 bg-black/40 text-electric-blue">
                  <Layers3 aria-hidden="true" className="h-4 w-4" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-white">{set.name}</span>
                  <span className="text-xs text-silver">
                    {set.prompts.length} prompt{set.prompts.length !== 1 ? "s" : ""} · {set.variables.length} variable{set.variables.length !== 1 ? "s" : ""}
                  </span>
                </span>
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-silver" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!currentProject && projects.length > 0 && (
          <CommandGroup heading="Prompt sets recientes">
            {projects.slice(0, 4).flatMap((project) =>
              project.promptSets.slice(0, 3).map((set) => (
                <CommandItem
                  key={`${project.id}-${set.id}`}
                  value={`recent-set-${project.id}-${set.id} ${set.name} ${project.name}`}
                  onSelect={() =>
                    runCommand(() => router.push(`/projects/${project.id}/prompt-sets?set=${set.id}`))
                  }
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-iron/70 bg-black/40 text-electric-blue">
                    <Layers3 aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-white">{set.name}</span>
                    <span className="flex items-center gap-1 text-xs text-silver">
                      <FolderKanban aria-hidden="true" className="h-3 w-3" />
                      <span className="truncate">{project.name}</span>
                    </span>
                  </span>
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-silver" />
                </CommandItem>
              )),
            )}
          </CommandGroup>
        )}

        <CommandSeparator />

        <CommandGroup heading="Crear">
          <CommandItem
            value="crear nuevo proyecto"
            onSelect={() => runCommand(handleCreateProject)}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-iron/70 bg-black/40 text-electric-blue">
              <Plus aria-hidden="true" className="h-4 w-4" />
            </span>
            <span className="flex flex-col">
              <span className="text-white">Nuevo proyecto</span>
              <span className="text-xs text-silver">Crear un espacio de prompts</span>
            </span>
          </CommandItem>
          {currentProject && (
            <CommandItem
              value={`crear nuevo prompt set ${currentProject.name}`}
              onSelect={() => runCommand(() => handleCreatePromptSet(currentProject))}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-iron/70 bg-black/40 text-violet-pulse">
                <Plus aria-hidden="true" className="h-4 w-4" />
              </span>
              <span className="flex flex-col">
                <span className="text-white">Nuevo prompt set</span>
                <span className="text-xs text-silver">En {currentProject.name}</span>
              </span>
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
