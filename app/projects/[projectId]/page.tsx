"use client"

import { useState, type ReactNode } from "react"
import { useParams, useRouter } from "next/navigation"
import { newId } from "@/lib/ids"
import { useProjectsContext } from "@/lib/projects-provider"
import type { PromptSet } from "@/types/prompt"
import { ConfirmationDialog } from "@/components/dialogs/confirmation-dialog"
import { ImportPromptSetDialog } from "@/components/dialogs/import-prompt-set-dialog"
import { ProjectHeader } from "@/components/projects/project-header"
import { PromptSetGrid } from "@/components/prompt-sets/prompt-set-grid"
import { ErrorBoundary } from "@/components/layout/error-boundary"
import { copyToClipboard } from "@/lib/toast"
import { AppShell } from "@/components/layout/app-shell"
import { getProjectIconByIndex } from "@/lib/project-icons"

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const { projects, isLoaded, updateProject, deleteProject } = useProjectsContext()
  const currentProject = projects.find((p) => p.id === projectId) ?? projects[0]

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [promptSetToDelete, setPromptSetToDelete] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isImportPromptSetDialogOpen, setIsImportPromptSetDialogOpen] = useState(false)

  const addPromptSet = () => {
    if (!currentProject) return
    const newPromptSet: PromptSet = {
      id: newId("set"),
      name: `Nuevo Set ${currentProject.promptSets.length + 1}`,
      variables: [],
      prompts: [{ id: newId("prompt"), content: "Nuevo prompt" }],
    }
    updateProject(currentProject.id, (project) => ({
      ...project,
      promptSets: [...project.promptSets, newPromptSet],
    }))
  }

  const renameProject = (name: string) => {
    if (!currentProject) return
    updateProject(currentProject.id, (project) => ({ ...project, name }))
  }

  const confirmDeleteProject = () => {
    if (!currentProject || projects.length <= 1) return
    deleteProject(currentProject.id)
    const remaining = projects.filter((p) => p.id !== currentProject.id)
    router.push(remaining.length > 0 ? `/projects/${remaining[0].id}` : "/")
  }

  const removePromptSet = (promptSetId: string) => {
    if (!currentProject) return
    if (currentProject.promptSets.length <= 1) return
    updateProject(currentProject.id, (project) => ({
      ...project,
      promptSets: project.promptSets.filter((s) => s.id !== promptSetId),
    }))
    setPromptSetToDelete(null)
  }

  const reorderPromptSets = (oldIndex: number, newIndex: number) => {
    if (!currentProject) return
    updateProject(currentProject.id, (project) => {
      const next = [...project.promptSets]
      const [moved] = next.splice(oldIndex, 1)
      next.splice(newIndex, 0, moved)
      return { ...project, promptSets: next }
    })
  }

  const handleExportProject = () => {
    if (!currentProject) return
    void copyToClipboard(JSON.stringify(currentProject, null, 2), "Proyecto exportado al portapapeles")
  }

  const handleExportPromptSet = (promptSetId: string) => {
    const promptSet = currentProject?.promptSets.find((s) => s.id === promptSetId)
    if (!promptSet) return
    void copyToClipboard(JSON.stringify(promptSet, null, 2), "Conjunto de prompts exportado al portapapeles")
  }

  const handleImportPromptSet = (promptSet: PromptSet) => {
    if (!currentProject) return
    updateProject(currentProject.id, (project) => ({
      ...project,
      promptSets: [...project.promptSets, promptSet],
    }))
  }

  const ready = isLoaded && Boolean(currentProject)
  const projectIndex = currentProject ? Math.max(0, projects.findIndex((p) => p.id === currentProject.id)) : 0
  const fallbackIconName = getProjectIconByIndex(projectIndex).name

  return (
    <AppShell
      projects={ready ? projects : []}
      currentProject={ready ? currentProject : undefined}
      title={ready && currentProject ? currentProject.name : "Proyecto"}
      eyebrow="Dashboard"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6 lg:px-8">
        {ready && currentProject && (
          <>
            <section className="relative overflow-hidden rounded-3xl border border-magenta-glow/70 bg-[linear-gradient(130deg,rgba(90,31,208,0.34)_10%,rgba(46,16,106,0)_70%)] p-4 md:p-6">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <ProjectHeader
                  project={currentProject}
                  canDelete={projects.length > 1}
                  fallbackIconName={fallbackIconName}
                  onRename={renameProject}
                  onExport={handleExportProject}
                  onDelete={() => setShowDeleteConfirmation(true)}
                />
              </div>
            </section>

            <ErrorBoundary fallbackLabel="No se pudo renderizar la lista de conjuntos de prompts">
              <PromptSetGrid
                project={currentProject}
                isEditMode={isEditMode}
                onAddPromptSet={addPromptSet}
                onDeletePromptSet={setPromptSetToDelete}
                onExportPromptSet={handleExportPromptSet}
                onReorderPromptSets={reorderPromptSets}
                onImportClick={() => setIsImportPromptSetDialogOpen(true)}
                onToggleEditMode={() => setIsEditMode((v) => !v)}
              />
            </ErrorBoundary>
          </>
        )}
      </div>

      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDeleteProject}
        title="Eliminar proyecto"
        description="¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer."
      />

      <ConfirmationDialog
        isOpen={!!promptSetToDelete}
        onClose={() => setPromptSetToDelete(null)}
        onConfirm={() => promptSetToDelete && removePromptSet(promptSetToDelete)}
        title="Eliminar conjunto de prompts"
        description="¿Estás seguro de que deseas eliminar este conjunto de prompts? Esta acción no se puede deshacer."
      />

      <ImportPromptSetDialog
        isOpen={isImportPromptSetDialogOpen}
        onClose={() => setIsImportPromptSetDialogOpen(false)}
        onImport={handleImportPromptSet}
      />
    </AppShell>
  )
}

function SummaryTile({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="app-card-subtle flex items-center gap-4 p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(107,87,255,0.24)] text-electric-blue">
        {icon}
      </div>
      <div>
        <p className="text-sm text-fog">{label}</p>
        <p className="text-2xl font-semibold leading-tight text-white">{value}</p>
      </div>
    </div>
  )
}
