"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { PromptSetTabs } from "@/components/prompt-sets/prompt-set-tabs"
import { VariablesEditor } from "@/components/variables/variables-editor"
import { PromptsArea } from "@/components/prompts/prompts-area"
import { Button } from "@/components/ui/button"
import { PlusIcon, Download } from "lucide-react"
import { useProjectsContext } from "@/lib/projects-provider"
import { useActivePromptSet } from "@/lib/hooks/use-active-prompt-set"
import { EditModeToggle } from "@/components/layout/edit-mode-toggle"
import { ViewToggle } from "@/components/layout/view-toggle"
import { SplitPane } from "@/components/layout/split-pane"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { copyToClipboard } from "@/lib/toast"
import { ErrorBoundary } from "@/components/layout/error-boundary"
import { dndAnnouncements } from "@/lib/dnd-announcements"
import { restrictToParentElement, restrictToVerticalAxis } from "@/lib/dnd-modifiers"
import { AppShell } from "@/components/layout/app-shell"

export default function PromptSetsPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const projectsState = useProjectsContext()
  const { projects, isLoaded } = projectsState
  const {
    currentProject,
    activePromptSet,
    activePromptSetId,
    selectPromptSet,
    addPromptSet,
    deletePromptSet,
    renamePromptSet,
    reorderPromptSets,
    updateUiPreferences,
    addVariable,
    updateVariable,
    updateVariableName,
    updateVariableDescription,
    deleteVariable,
    clearAllVariableValues,
    reorderVariables,
    addPrompt,
    updatePrompt,
    updatePromptDescription,
    deletePrompt,
    reorderPrompts,
  } = useActivePromptSet(projectId, projectsState)

  const [isEditMode, setIsEditMode] = useState(false)

  const splitPosition = activePromptSet?.uiPreferences?.splitPosition ?? 50
  const variablesPanelVisible = activePromptSet?.uiPreferences?.variablesPanelVisible ?? true
  const cardView = activePromptSet?.uiPreferences?.cardView ?? false

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const exportActivePromptSet = () => {
    if (!activePromptSet) return
    void copyToClipboard(JSON.stringify(activePromptSet, null, 2), "Conjunto de prompts exportado al portapapeles")
  }

  const handleVariableDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id || !activePromptSet) return
    const oldIndex = activePromptSet.variables.findIndex((v) => v.id === active.id)
    const newIndex = activePromptSet.variables.findIndex((v) => v.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) reorderVariables(oldIndex, newIndex)
  }

  const handlePromptDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id || !activePromptSet) return
    const oldIndex = activePromptSet.prompts.findIndex((p) => p.id === active.id)
    const newIndex = activePromptSet.prompts.findIndex((p) => p.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) reorderPrompts(oldIndex, newIndex)
  }

  const ready = isLoaded && Boolean(currentProject)

  return (
    <AppShell
      projects={ready ? projects : []}
      currentProject={ready ? currentProject : undefined}
      activePromptSetId={activePromptSetId}
      title={activePromptSet?.name ?? "Prompt sets"}
      eyebrow={currentProject?.name ?? "Editor"}
      topActions={
        <>
          <ViewToggle isCardView={cardView} onToggle={() => updateUiPreferences({ cardView: !cardView })} />
          <EditModeToggle isEditMode={isEditMode} onToggle={() => setIsEditMode((v) => !v)} />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={exportActivePromptSet} disabled={!ready} className="h-8 w-8 shrink-0">
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Exportar Conjunto</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      }
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="shrink-0 bg-deep-charcoal/95 px-4">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
            {ready && currentProject && (
              <PromptSetTabs
                promptSets={currentProject.promptSets}
                activePromptSetId={activePromptSetId}
                isEditMode={isEditMode}
                onSelectPromptSet={selectPromptSet}
                onUpdateName={renamePromptSet}
                onDeletePromptSet={deletePromptSet}
                onReorderPromptSets={reorderPromptSets}
              />
            )}
            <Button variant="ghost" size="icon" onClick={addPromptSet} disabled={!ready} className="h-8 w-8 shrink-0">
              <PlusIcon className="h-3.5 w-3.5" />
              <span className="sr-only">Nuevo Conjunto</span>
            </Button>
          </div>
        </div>

        {ready && activePromptSet && (
          <SplitPane
            splitPosition={splitPosition}
            leftVisible={variablesPanelVisible}
            onChangeSplitPosition={(next) => updateUiPreferences({ splitPosition: next })}
            onSetLeftVisible={(visible) => updateUiPreferences({ variablesPanelVisible: visible })}
            left={
              <ErrorBoundary fallbackLabel="No se pudo renderizar el panel de variables">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                  onDragEnd={handleVariableDragEnd}
                  accessibility={{ announcements: dndAnnouncements }}
                >
                  <VariablesEditor
                    variables={activePromptSet.variables}
                    onUpdateVariable={updateVariable}
                    onUpdateVariableName={updateVariableName}
                    onUpdateVariableDescription={updateVariableDescription}
                    onAddVariable={addVariable}
                    onDeleteVariable={deleteVariable}
                    onClearAllValues={clearAllVariableValues}
                    onHidePanel={() => updateUiPreferences({ variablesPanelVisible: false })}
                    isEditMode={isEditMode}
                  />
                </DndContext>
              </ErrorBoundary>
            }
            right={
              <ErrorBoundary fallbackLabel="No se pudo renderizar el panel de prompts">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  modifiers={cardView ? [restrictToParentElement] : [restrictToVerticalAxis, restrictToParentElement]}
                  onDragEnd={handlePromptDragEnd}
                  accessibility={{ announcements: dndAnnouncements }}
                >
                  <PromptsArea
                    prompts={activePromptSet.prompts}
                    variables={activePromptSet.variables}
                    isCardView={cardView}
                    isEditMode={isEditMode}
                    onUpdatePrompt={updatePrompt}
                    onUpdatePromptDescription={updatePromptDescription}
                    onDeletePrompt={deletePrompt}
                    onAddPrompt={addPrompt}
                  />
                </DndContext>
              </ErrorBoundary>
            }
          />
        )}
      </div>
    </AppShell>
  )
}
