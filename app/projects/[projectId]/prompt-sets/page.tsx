"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { NavigationBar } from "@/components/layout/navigation-bar"
import { PromptSetTabs } from "@/components/prompt-sets/prompt-set-tabs"
import { VariablesEditor } from "@/components/variables/variables-editor"
import { PromptsArea } from "@/components/prompts/prompts-area"
import { Button } from "@/components/ui/button"
import { PlusIcon, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { useProjects } from "@/lib/hooks/use-projects"
import { useActivePromptSet } from "@/lib/hooks/use-active-prompt-set"
import { EditModeToggle } from "@/components/layout/edit-mode-toggle"
import { ViewToggle } from "@/components/layout/view-toggle"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function PromptSetsPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const projectsState = useProjects()
  const { projects } = projectsState
  const activeState = useActivePromptSet(projectId, projectsState)
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
  } = activeState

  const [isEditMode, setIsEditMode] = useState(false)
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false)

  const splitPosition = activePromptSet?.uiPreferences?.splitPosition ?? 50
  const variablesPanelVisible = activePromptSet?.uiPreferences?.variablesPanelVisible ?? true
  const cardView = activePromptSet?.uiPreferences?.cardView ?? false

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const exportActivePromptSet = () => {
    if (!activePromptSet) return
    try {
      navigator.clipboard
        .writeText(JSON.stringify(activePromptSet, null, 2))
        .then(() => alert("Conjunto de prompts exportado al portapapeles"))
        .catch((err) => {
          console.error("Error al copiar al portapapeles:", err)
          alert("Error al exportar. Consulta la consola para más detalles.")
        })
    } catch (error) {
      console.error("Error al exportar el conjunto de prompts:", error)
      alert("Error al exportar. Consulta la consola para más detalles.")
    }
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

  const handleMouseDown = () => {
    setIsDraggingSplitter(true)
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }

  const handleMouseUp = () => {
    if (isDraggingSplitter) {
      setIsDraggingSplitter(false)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingSplitter) return
    const container = e.currentTarget as HTMLElement
    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const newSplitPosition = Math.min(Math.max((x / rect.width) * 100, 20), 80)
    updateUiPreferences({ splitPosition: newSplitPosition })
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDraggingSplitter) {
        setIsDraggingSplitter(false)
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
      }
    }
    document.addEventListener("mouseup", handleGlobalMouseUp)
    return () => document.removeEventListener("mouseup", handleGlobalMouseUp)
  }, [isDraggingSplitter])

  if (!currentProject) return null

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white overflow-hidden">
      <NavigationBar projects={projects} currentProject={currentProject} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="py-2 px-4 border-b border-zinc-700">
          <div className="flex items-center">
            <div className="flex-1 overflow-x-auto custom-scrollbar">
              <PromptSetTabs
                promptSets={currentProject.promptSets}
                activePromptSetId={activePromptSetId}
                onSelectPromptSet={selectPromptSet}
                onUpdateName={renameActivePromptSet}
                onDeletePromptSet={deletePromptSet}
              />
            </div>
            <div className="flex space-x-2 ml-2">
              <Button
                variant="outline"
                size="icon"
                onClick={addPromptSet}
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

        {activePromptSet && (
          <div
            className="flex-1 flex overflow-hidden h-0 min-h-0 p-4"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {variablesPanelVisible && (
              <div className="flex flex-col min-h-0 h-full overflow-hidden" style={{ width: `${splitPosition}%` }}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Variables</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateUiPreferences({ variablesPanelVisible: false })}
                    className="h-6 w-6 hover:bg-zinc-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
                <DndContext
                  sensors={isEditMode ? sensors : []}
                  collisionDetection={closestCenter}
                  onDragEnd={handleVariableDragEnd}
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
              </div>
            )}

            {variablesPanelVisible && (
              <div
                className="w-2 h-full flex items-center justify-center cursor-col-resize mx-2 group"
                onMouseDown={handleMouseDown}
              >
                <div className="w-0.5 h-full bg-zinc-700 group-hover:bg-zinc-500 group-active:bg-zinc-400"></div>
              </div>
            )}

            {!variablesPanelVisible && (
              <div className="mb-2 ml-1 mr-3 flex items-start">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateUiPreferences({ variablesPanelVisible: true })}
                  className="h-6 w-6 hover:bg-zinc-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div
              className="flex flex-col min-h-0 h-full overflow-hidden"
              style={{ width: variablesPanelVisible ? `${100 - splitPosition}%` : "100%" }}
            >
              <DndContext
                sensors={isEditMode ? sensors : []}
                collisionDetection={closestCenter}
                onDragEnd={handlePromptDragEnd}
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
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
