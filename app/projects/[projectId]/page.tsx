"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { NavigationBar } from "@/components/layout/navigation-bar"
import { newId } from "@/lib/ids"
import { useProjects } from "@/lib/hooks/use-projects"
import type { PromptSet } from "@/types/prompt"
import { ConfirmationDialog } from "@/components/dialogs/confirmation-dialog"
import { ImportPromptSetDialog } from "@/components/dialogs/import-prompt-set-dialog"
import { ProjectInfoCard } from "@/components/projects/project-info-card"
import { ProjectHeader } from "@/components/projects/project-header"
import { PromptSetGrid } from "@/components/prompt-sets/prompt-set-grid"
import { ErrorBoundary } from "@/components/layout/error-boundary"
import { copyToClipboard } from "@/lib/toast"

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const { projects, updateProject, deleteProject } = useProjects()
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

  if (!currentProject) return null

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white">
      <NavigationBar projects={projects} currentProject={currentProject} />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <ProjectHeader
            project={currentProject}
            isEditMode={isEditMode}
            canDelete={projects.length > 1}
            onToggleEditMode={() => setIsEditMode((v) => !v)}
            onRename={renameProject}
            onExport={handleExportProject}
            onDelete={() => setShowDeleteConfirmation(true)}
          />

          <ProjectInfoCard name={currentProject.name} promptSetsCount={currentProject.promptSets.length} />

          <ErrorBoundary fallbackLabel="No se pudo renderizar la lista de conjuntos de prompts">
            <PromptSetGrid
              project={currentProject}
              isEditMode={isEditMode}
              onAddPromptSet={addPromptSet}
              onDeletePromptSet={setPromptSetToDelete}
              onExportPromptSet={handleExportPromptSet}
              onReorderPromptSets={reorderPromptSets}
              onImportClick={() => setIsImportPromptSetDialogOpen(true)}
            />
          </ErrorBoundary>
        </div>
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
    </div>
  )
}
