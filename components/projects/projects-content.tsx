"use client"

import { Plus, FolderOpen, FileText, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Project } from "@/types/prompt"
import Link from "next/link"

interface ProjectsContentProps {
  projects: Project[]
  isLoaded: boolean
  onAddProject: () => Project
}

export function ProjectsContent({ projects, isLoaded, onAddProject }: ProjectsContentProps) {
  const totalPromptSets = projects.reduce((acc, p) => acc + p.promptSets.length, 0)
  const totalPrompts = projects.reduce(
    (acc, p) => acc + p.promptSets.reduce((a, s) => a + s.prompts.length, 0),
    0
  )

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{projects.length}</p>
              <p className="text-sm text-muted-foreground">Proyectos</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{totalPromptSets}</p>
              <p className="text-sm text-muted-foreground">Conjuntos</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{totalPrompts}</p>
              <p className="text-sm text-muted-foreground">Prompts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Proyectos recientes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Selecciona un proyecto para gestionar sus prompts
          </p>
        </div>
        <Button
          onClick={() => onAddProject()}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Nuevo proyecto
        </Button>
      </div>

      {/* Projects Grid */}
      {isLoaded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:bg-accent/50 transition-all"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {project.name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {project.promptSets.length} conjunto{project.promptSets.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              
              {/* Prompt sets preview */}
              <div className="space-y-1.5">
                {project.promptSets.slice(0, 3).map((promptSet) => (
                  <div
                    key={promptSet.id}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <FileText className="h-3 w-3 shrink-0" />
                    <span className="truncate">{promptSet.name}</span>
                    <span className="ml-auto shrink-0 px-1.5 py-0.5 rounded bg-secondary text-[10px]">
                      {promptSet.prompts.length}
                    </span>
                  </div>
                ))}
                {project.promptSets.length > 3 && (
                  <div className="text-xs text-muted-foreground pl-5">
                    +{project.promptSets.length - 3} mas
                  </div>
                )}
              </div>
            </Link>
          ))}

          {/* Add Project Card */}
          <button
            onClick={() => onAddProject()}
            className="group bg-card border border-dashed border-border rounded-xl p-5 hover:border-primary/50 hover:bg-accent/30 transition-all flex flex-col items-center justify-center min-h-[160px]"
          >
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
              <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Crear nuevo proyecto
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
