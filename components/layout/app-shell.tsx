"use client"

import { useMemo, type ReactNode } from "react"
import Link from "next/link"
import {
  Boxes,
  ChevronDown,
  ChevronRight,
  Layers3,
  MoreVertical,
  Pin,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Sparkles,
} from "lucide-react"
import type { Project } from "@/types/prompt"
import { cn } from "@/lib/utils"
import { useProjectsContext } from "@/lib/projects-provider"
import { getProjectIcon, getProjectIconByIndex } from "@/lib/project-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ProjectIconPicker, ProjectPinToggle } from "@/components/projects/project-options"
import { useCommandPalette } from "@/components/command-palette-provider"

interface AppShellProps {
  projects: Project[]
  currentProject?: Project
  activePromptSetId?: string
  title: string
  eyebrow?: string
  topActions?: ReactNode
  hideHeader?: boolean
  children: ReactNode
}

export function AppShell({
  projects,
  currentProject,
  activePromptSetId,
  title,
  topActions,
  hideHeader = false,
  children,
}: AppShellProps) {
  const { updateProject } = useProjectsContext()
  const { open: openCommandPalette } = useCommandPalette()
  const promptSetsSidebarVisible = currentProject?.uiPreferences?.promptSetsSidebarVisible ?? false
  const railProjects = useMemo(
    () =>
      projects
        .map((project, index) => ({ project, index }))
        .sort((a, b) => Number(Boolean(b.project.pinned)) - Number(Boolean(a.project.pinned)) || a.index - b.index),
    [projects],
  )
  const setPromptSetsSidebarVisible = (visible: boolean) => {
    if (!currentProject) return
    updateProject(currentProject.id, (project) => ({
      ...project,
      uiPreferences: {
        ...project.uiPreferences,
        promptSetsSidebarVisible: visible,
      },
    }))
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-obsidian-ground text-pure-white">
      <aside className="relative z-10 flex w-13 shrink-0 flex-col items-center border-r border-iron/60 bg-deep-charcoal">
        <Link
          href="/"
          className="app-focus mt-3 flex h-9 w-9 items-center justify-center rounded-sm border border-iron/70 bg-black/40 text-electric-blue transition hover:border-electric-blue/70 hover:text-white"
        >
          <Sparkles aria-hidden="true" className="h-4 w-4" />
          <span className="sr-only">Inicio</span>
        </Link>
        <TooltipProvider delayDuration={180}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={openCommandPalette}
                aria-label="Abrir paleta de comandos"
                className="app-focus mt-3 flex h-9 w-9 items-center justify-center rounded-sm border border-iron/70 bg-black/40 text-silver transition hover:border-electric-blue/60 hover:text-white"
              >
                <Search aria-hidden="true" className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Buscar (⌘K)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <nav aria-label="Proyectos" className="mt-6 flex min-h-0 flex-1 flex-col items-center gap-3 overflow-y-auto px-2 pb-4 custom-scrollbar">
          {railProjects.map(({ project, index }) => (
            <ProjectRailItem
              key={project.id}
              project={project}
              fallbackIcon={getProjectIconByIndex(index).name}
              active={currentProject?.id === project.id}
              onIconChange={(icon) => updateProject(project.id, (current) => ({ ...current, icon }))}
              onPinnedChange={(pinned) => updateProject(project.id, (current) => ({ ...current, pinned }))}
            />
          ))}
        </nav>
      </aside>

      {currentProject && promptSetsSidebarVisible && (
      <aside className="relative z-10 hidden w-[19rem] shrink-0 border-r border-iron/60 bg-deep-charcoal lg:flex lg:flex-col">
        <div className="flex h-14 items-center gap-3 border-b border-iron/60 px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-iron/70 bg-black/40">
            <Boxes aria-hidden="true" className="h-3.5 w-3.5 text-electric-blue" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">Prompt Manager</p>
            <p className="truncate text-[11px] text-silver">Biblioteca local</p>
          </div>
          <button
            type="button"
            className="app-focus ml-auto flex h-7 w-7 items-center justify-center rounded-sm text-silver hover:bg-graphite hover:text-white"
            onClick={() => setPromptSetsSidebarVisible(false)}
            aria-label="Ocultar sidebar de prompt sets"
          >
            <PanelLeftClose aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          {currentProject && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <SectionLabel>Prompt sets</SectionLabel>
                <Link
                  href={`/projects/${currentProject.id}/prompt-sets`}
                  className="app-focus flex h-6 w-6 items-center justify-center rounded-sm text-silver hover:bg-graphite hover:text-white"
                  aria-label="Abrir editor"
                >
                  <Plus aria-hidden="true" className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-px">
                {currentProject.promptSets.map((set) => (
                  <Link
                    key={set.id}
                    href={`/projects/${currentProject.id}/prompt-sets?set=${set.id}`}
                    className={cn(
                      "app-focus flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm transition",
                      activePromptSetId === set.id
                        ? "bg-graphite text-white"
                        : "text-silver hover:bg-graphite/60 hover:text-white",
                    )}
                  >
                    <Layers3 aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-electric-blue" />
                    <span className="min-w-0 flex-1 truncate">{set.name}</span>
                    <span className="font-mono-tight text-[10px] text-ash">{set.prompts.length}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
      )}

      <main className="relative z-10 flex min-w-0 flex-1 flex-col">
        {!hideHeader && (
          <header className="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-iron/60 bg-deep-charcoal/95 px-4 backdrop-blur">
            <div className="flex min-w-0 items-center gap-2">
              {currentProject && !promptSetsSidebarVisible && (
                <button
                  type="button"
                  className="app-focus flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-silver hover:bg-graphite hover:text-white"
                  onClick={() => setPromptSetsSidebarVisible(true)}
                  aria-label="Mostrar sidebar de prompt sets"
                >
                  <PanelLeftOpen aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              )}
              <Breadcrumbs
                currentProject={currentProject}
                activePromptSetId={activePromptSetId}
                fallbackTitle={title}
              />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={openCommandPalette}
                aria-label="Abrir paleta de comandos"
                className="app-focus hidden h-8 items-center gap-2 rounded-sm border border-iron/70 bg-black/40 px-2.5 text-xs text-silver transition hover:border-electric-blue/60 hover:text-white md:inline-flex"
              >
                <Search aria-hidden="true" className="h-3.5 w-3.5" />
                <span>Buscar…</span>
                <span className="ml-2 rounded-sm border border-iron/70 bg-black/60 px-1.5 py-0.5 font-mono-tight text-[10px] text-silver">
                  ⌘K
                </span>
              </button>
              {topActions}
            </div>
          </header>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">{children}</div>
      </main>
    </div>
  )
}

function Breadcrumbs({
  currentProject,
  activePromptSetId,
  fallbackTitle,
}: {
  currentProject?: Project
  activePromptSetId?: string
  fallbackTitle: string
}) {
  const activePromptSet = currentProject?.promptSets.find((set) => set.id === activePromptSetId)

  if (!currentProject) {
    return (
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
        <Link href="/" className="app-focus truncate font-medium text-white hover:text-electric-blue">
          {fallbackTitle || "Proyectos"}
        </Link>
      </nav>
    )
  }

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
      <Link href="/" className="app-focus hidden shrink-0 text-silver hover:text-white sm:inline">
        Proyectos
      </Link>
      <ChevronRight aria-hidden="true" className="hidden h-3 w-3 shrink-0 text-ash sm:block" />

      <Link
        href={`/projects/${currentProject.id}`}
        className={cn(
          "app-focus min-w-0 truncate rounded-sm px-1.5 py-1 hover:bg-graphite",
          activePromptSet ? "text-silver hover:text-white" : "text-white",
        )}
      >
        {currentProject.name}
      </Link>

      {activePromptSet && (
        <>
          <ChevronRight aria-hidden="true" className="h-3 w-3 shrink-0 text-ash" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="app-focus flex min-w-0 items-center gap-1 rounded-sm px-1.5 py-1 text-white hover:bg-graphite"
              >
                <span className="truncate">{activePromptSet.name}</span>
                <ChevronDown aria-hidden="true" className="h-3 w-3 shrink-0 text-ash" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuItem asChild>
                <Link href={`/projects/${currentProject.id}`}>Dashboard del proyecto</Link>
              </DropdownMenuItem>
              <div className="max-h-72 overflow-y-auto border-t border-iron/60 p-1 custom-scrollbar">
                {currentProject.promptSets.map((set) => (
                  <DropdownMenuItem key={set.id} asChild>
                    <Link href={`/projects/${currentProject.id}/prompt-sets?set=${set.id}`}>
                      {set.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </nav>
  )
}

function ProjectRailItem({
  project,
  fallbackIcon,
  active,
  onIconChange,
  onPinnedChange,
}: {
  project: Project
  fallbackIcon: string
  active: boolean
  onIconChange: (icon: string) => void
  onPinnedChange: (pinned: boolean) => void
}) {
  const iconName = project.icon ?? fallbackIcon
  const Icon = getProjectIcon(iconName)

  return (
    <div className="group relative">
      <TooltipProvider delayDuration={180}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={`/projects/${project.id}`}
              aria-label={project.name}
              className={cn(
                "app-focus flex size-9 items-center justify-center rounded-sm border transition",
                active
                  ? "border-electric-blue/70 bg-[rgba(43,127,255,0.12)] text-white"
                  : "border-iron/70 bg-black/40 text-silver hover:border-electric-blue/50 hover:text-white",
              )}
            >
              <Icon aria-hidden="true" className="size-4" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{project.name}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {project.pinned && (
        <span className="pointer-events-none absolute -left-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-electric-blue text-white">
          <Pin aria-hidden="true" className="h-2 w-2" />
        </span>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="app-focus absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-sm border border-iron bg-deep-charcoal text-silver opacity-100 transition hover:border-electric-blue hover:text-white lg:opacity-0 lg:group-hover:opacity-100"
            aria-label={`Opciones de ${project.name}`}
          >
            <MoreVertical aria-hidden="true" className="size-2.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right" className="w-64">
          <DropdownMenuItem asChild>
            <Link href={`/projects/${project.id}`}>Abrir proyecto</Link>
          </DropdownMenuItem>
          <ProjectPinToggle pinned={project.pinned} onChange={onPinnedChange} />
          <ProjectIconPicker selectedIconName={iconName} onSelect={onIconChange} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="mb-2 px-2.5 font-mono-tight text-[10px] uppercase tracking-wider text-ash">{children}</p>
}
