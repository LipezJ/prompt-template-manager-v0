"use client"

import type React from "react"
import { useState } from "react"
import { FileTextIcon, PlusIcon, Upload } from "lucide-react"
import {
  DndContext,
  closestCenter,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import type { Project } from "@/types/prompt"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { dndAnnouncements } from "@/lib/dnd-announcements"
import { EditModeToggle } from "@/components/layout/edit-mode-toggle"
import { PromptSetItem } from "./prompt-set-item"

interface PromptSetGridProps {
  project: Project
  isEditMode: boolean
  onAddPromptSet: () => void
  onDeletePromptSet: (id: string) => void
  onExportPromptSet: (id: string) => void
  onReorderPromptSets: (oldIndex: number, newIndex: number) => void
  onImportClick: () => void
  onToggleEditMode: () => void
}

export function PromptSetGrid({
  project,
  isEditMode,
  onAddPromptSet,
  onDeletePromptSet,
  onExportPromptSet,
  onReorderPromptSets,
  onImportClick,
  onToggleEditMode,
}: PromptSetGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handlePromptSetOptions = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = project.promptSets.findIndex((s) => s.id === active.id)
      const newIndex = project.promptSets.findIndex((s) => s.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) onReorderPromptSets(oldIndex, newIndex)
    }
    setActiveId(null)
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-neon-pink">Coleccion</p>
          <h2 className="text-2xl font-semibold text-white">Conjuntos de Prompts</h2>
        </div>
        <div className="flex items-center gap-2">
          <EditModeToggle isEditMode={isEditMode} onToggle={onToggleEditMode} />
          {!isEditMode && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onImportClick}
                      className="h-9 w-9 rounded-2xl border-iron bg-deep-charcoal text-fog hover:bg-graphite hover:text-white"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Importar Conjunto</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onAddPromptSet}
                      className="h-9 w-9 rounded-2xl border-iron bg-deep-charcoal text-fog hover:bg-graphite hover:text-white"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Nuevo Conjunto</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        accessibility={{ announcements: dndAnnouncements }}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SortableContext items={project.promptSets.map((s) => s.id)} strategy={rectSortingStrategy}>
            {project.promptSets.map((promptSet) => (
              <PromptSetItem
                key={promptSet.id}
                promptSetId={promptSet.id}
                projectId={project.id}
                name={promptSet.name}
                promptsCount={promptSet.prompts.length}
                variablesCount={promptSet.variables.length}
                isEditMode={isEditMode}
                onDeleteClick={onDeletePromptSet}
                onExportPromptSet={onExportPromptSet}
                onOptionsClick={handlePromptSetOptions}
              />
            ))}
          </SortableContext>

          {!isEditMode && (
            <button
              onClick={onAddPromptSet}
              className="app-focus app-card-subtle flex min-h-40 flex-col items-center justify-center border-dashed p-5 text-center transition hover:border-violet-pulse hover:bg-[rgba(90,31,208,0.18)]"
            >
              <PlusIcon className="mb-2 h-5 w-5 text-electric-blue" />
              <span className="text-sm font-medium text-white">Nuevo Conjunto</span>
            </button>
          )}
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="app-card-subtle p-4 opacity-90">
              <div className="flex items-start gap-3">
                <FileTextIcon className="mt-0.5 h-4 w-4 text-electric-blue" />
                <div>
                  <h3 className="text-sm font-medium text-white">
                    {project.promptSets.find((s) => s.id === activeId)?.name}
                  </h3>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </section>
  )
}
