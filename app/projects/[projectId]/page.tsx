"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProjectDetailContent } from "@/components/projects/project-detail-content"
import { newId } from "@/lib/ids"
import { useProjects } from "@/lib/hooks/use-projects"
import type { PromptSet } from "@/types/prompt"
import { ConfirmationDialog } from "@/components/dialogs/confirmation-dialog"
import { ImportPromptSetDialog } from "@/components/dialogs/import-prompt-set-dialog"
import { copyToClipboard } from "@/lib/toast"

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const { projects, isLoaded, addProject, updateProject, deleteProject, importProject } = useProjects()
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

  return (
    <DashboardLayout
      projects={projects}
      currentProject={ready ? currentProject : undefined}
      isLoaded={isLoaded}
      onAddProject={addProject}
      onDeleteProject={deleteProject}
      onImportProject={importProject}
    >
      {ready && currentProject && (
        <ProjectDetailContent
          project={currentProject}
          isEditMode={isEditMode}
          canDelete={projects.length > 1}
          onToggleEditMode={() => setIsEditMode((v) => !v)}
          onRename={renameProject}
          onExport={handleExportProject}
          onDelete={() => setShowDeleteConfirmation(true)}
          onAddPromptSet={addPromptSet}
          onDeletePromptSet={setPromptSetToDelete}
          onExportPromptSet={handleExportPromptSet}
          onReorderPromptSets={reorderPromptSets}
          onImportClick={() => setIsImportPromptSetDialogOpen(true)}
        />
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDeleteProject}
        title="Eliminar proyecto"
        description="Esta accion eliminara el proyecto y no se puede deshacer."
      />

      <ConfirmationDialog
        isOpen={!!promptSetToDelete}
        onClose={() => setPromptSetToDelete(null)}
        onConfirm={() => promptSetToDelete && removePromptSet(promptSetToDelete)}
        title="Eliminar conjunto de prompts"
        description="Esta accion eliminara el conjunto de prompts y no se puede deshacer."
      />

      <ImportPromptSetDialog
        isOpen={isImportPromptSetDialogOpen}
        onClose={() => setIsImportPromptSetDialogOpen(false)}
        onImport={handleImportPromptSet}
      />
    </DashboardLayout>
  )
}
