"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { NavigationBar } from "@/components/layout/navigation-bar"
import { PromptSetTabs } from "@/components/prompt-sets/prompt-set-tabs"
import { VariablesEditor } from "@/components/variables/variables-editor"
import { PromptsArea } from "@/components/prompts/prompts-area"
import { Button } from "@/components/ui/button"
import { PlusIcon, Download } from "lucide-react"
import { useProjects } from "@/lib/hooks/use-projects"
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

export default function PromptSetsPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const projectsState = useProjects()
  const { projects, isLoaded } = projectsState
  const {
    currentProject,
    activePromptSet,
    activePromptSetId,
    selectPromptSet,
    addPromptSet,
    deletePromptSet,
    renameActivePromptSet,
    updateUiPreferences,
    addVariable,
    updateVariable,
    updateVariableName,
    deleteVariable,
    clearAllVariableValues,
    reorderVariables,
    addPrompt,
    updatePrompt,
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
    <div className="flex flex-col h-screen bg-zinc-900 text-white overflow-hidden">
      <NavigationBar projects={ready ? projects : []} currentProject={ready ? currentProject : undefined} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="py-2 px-4 border-b border-zinc-700">
          <div className="flex items-center">
            <div className="flex-1 overflow-x-auto custom-scrollbar">
              {ready && currentProject && (
                <PromptSetTabs
                  promptSets={currentProject.promptSets}
                  activePromptSetId={activePromptSetId}
                  onSelectPromptSet={selectPromptSet}
                  onUpdateName={renameActivePromptSet}
                  onDeletePromptSet={deletePromptSet}
                />
              )}
            </div>
            <div className="flex space-x-2 ml-2">
              <Button
                variant="outline"
                size="icon"
                onClick={addPromptSet}
                disabled={!ready}
                className="h-7 w-7 shrink-0 bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
              >
                <PlusIcon className="h-3.5 w-3.5 text-zinc-300" />
              </Button>
              <ViewToggle isCardView={cardView} onToggle={() => updateUiPreferences({ cardView: !cardView })} />
              <EditModeToggle isEditMode={isEditMode} onToggle={() => setIsEditMode((v) => !v)} />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={exportActivePromptSet}
                      disabled={!ready}
                      className="h-7 w-7 shrink-0 bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
                    >
                      <Download className="h-3.5 w-3.5 text-zinc-300" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Exportar Conjunto</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {ready && activePromptSet && (
          <SplitPane
            splitPosition={splitPosition}
            leftVisible={variablesPanelVisible}
            onChangeSplitPosition={(next) => updateUiPreferences({ splitPosition: next })}
            onSetLeftVisible={(visible) => updateUiPreferences({ variablesPanelVisible: visible })}
            leftHeader={<h3 className="text-sm font-medium">Variables</h3>}
            left={
              <ErrorBoundary fallbackLabel="No se pudo renderizar el panel de variables">
                <DndContext
                  sensors={isEditMode ? sensors : []}
                  collisionDetection={closestCenter}
                  onDragEnd={handleVariableDragEnd}
                  accessibility={{ announcements: dndAnnouncements }}
                >
                  <VariablesEditor
                    variables={activePromptSet.variables}
                    onUpdateVariable={updateVariable}
                    onUpdateVariableName={updateVariableName}
                    onAddVariable={addVariable}
                    onDeleteVariable={deleteVariable}
                    onClearAllValues={clearAllVariableValues}
                    isEditMode={isEditMode}
                  />
                </DndContext>
              </ErrorBoundary>
            }
            right={
              <ErrorBoundary fallbackLabel="No se pudo renderizar el panel de prompts">
                <DndContext
                  sensors={isEditMode ? sensors : []}
                  collisionDetection={closestCenter}
                  onDragEnd={handlePromptDragEnd}
                  accessibility={{ announcements: dndAnnouncements }}
                >
                  <PromptsArea
                    prompts={activePromptSet.prompts}
                    variables={activePromptSet.variables}
                    isCardView={cardView}
                    isEditMode={isEditMode}
                    onUpdatePrompt={updatePrompt}
                    onDeletePrompt={deletePrompt}
                    onAddPrompt={addPrompt}
                  />
                </DndContext>
              </ErrorBoundary>
            }
          />
        )}
      </div>
    </div>
  )
}
