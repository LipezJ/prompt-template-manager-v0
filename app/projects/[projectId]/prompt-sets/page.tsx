"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { NavigationBar } from "@/components/navigation-bar"
import { PromptSetTabs } from "@/components/prompt-set-tabs"
import { PromptEditor } from "@/components/prompt-editor"
import { PromptPreview } from "@/components/prompt-preview"
import { Button } from "@/components/ui/button"
import { PlusIcon, Download } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Project, PromptSet, PromptVariable, Prompt } from "@/types/prompt"
import { EditModeToggle } from "@/components/edit-mode-toggle"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function PromptSetsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const searchParams = useSearchParams()
  const setIdFromUrl = searchParams.get("set")

  const [projects, setProjects] = useLocalStorage<Project[]>("projects", [
    {
      id: "default",
      name: "Mi Primer Proyecto",
      promptSets: [
        {
          id: "set1",
          name: "prompt set",
          variables: [
            { id: "name", name: "name", value: "Juan" },
            { id: "role", name: "role", value: "asistente" },
            { id: "task", name: "task", value: "crear un plan de marketing" },
          ],
          prompts: [
            {
              id: "prompt1",
              content: "Hello {name}\nYou are {role}\nplease help me with {task}",
            },
            {
              id: "prompt2",
              content: "Now, as a {role}, for the {task}",
            },
          ],
        },
        {
          id: "set2",
          name: "prompt set 2",
          variables: [
            { id: "name", name: "name", value: "María" },
            { id: "role", name: "role", value: "experto" },
          ],
          prompts: [
            {
              id: "prompt1",
              content: "Hola {name}, como {role}, ¿podrías ayudarme?",
            },
          ],
        },
      ],
    },
  ])

  const currentProject = projects.find((p) => p.id === projectId) || projects[0]

  // Initialize with a default value to prevent undefined
  const [activePromptSetId, setActivePromptSetId] = useState<string>(currentProject?.promptSets[0]?.id || "")

  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false)
  const [activeVariableId, setActiveVariableId] = useState<string | null>(null)
  const [activePromptId, setActivePromptId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Effect to handle URL parameter and project changes
  useEffect(() => {
    if (!currentProject?.promptSets?.length) return

    // If there's a set ID in the URL and it exists in this project, use it
    if (setIdFromUrl) {
      const setExists = currentProject.promptSets.some((set) => set.id === setIdFromUrl)
      if (setExists) {
        setActivePromptSetId(setIdFromUrl)
        return
      }
    }

    // Otherwise, use the first prompt set
    setActivePromptSetId(currentProject.promptSets[0].id)
  }, [currentProject, setIdFromUrl])

  // Get the active prompt set based on the ID
  const activePromptSet = currentProject?.promptSets.find((set) => set.id === activePromptSetId)

  // Handle selecting a different prompt set
  const handleSelectPromptSet = (id: string) => {
    setActivePromptSetId(id)

    // Update the URL to reflect the selected prompt set
    const url = new URL(window.location.href)
    url.searchParams.set("set", id)
    window.history.pushState({}, "", url.toString())
  }

  const updateVariable = (variableId: string, value: string) => {
    if (!currentProject || !activePromptSet) return

    const updatedProjects = projects.map((project) => {
      if (project.id !== currentProject.id) return project

      const updatedPromptSets = project.promptSets.map((set) => {
        if (set.id !== activePromptSet.id) return set

        const updatedVariables = set.variables.map((variable) => {
          if (variable.id !== variableId) return variable
          return { ...variable, value }
        })

        return { ...set, variables: updatedVariables }
      })

      return { ...project, promptSets: updatedPromptSets }
    })

    setProjects(updatedProjects)
  }

  const updateVariableName = (variableId: string, name: string) => {
    if (!currentProject || !activePromptSet) return

    const updatedProjects = projects.map((project) => {
      if (project.id !== currentProject.id) return project

      const updatedPromptSets = project.promptSets.map((set) => {
        if (set.id !== activePromptSet.id) return set

        const updatedVariables = set.variables.map((variable) => {
          if (variable.id !== variableId) return variable
          return { ...variable, name }
        })

        return { ...set, variables: updatedVariables }
      })

      return { ...project, promptSets: updatedPromptSets }
    })

    setProjects(updatedProjects)
  }

  const addVariable = () => {
    if (!currentProject || !activePromptSet) return

    const newVariable: PromptVariable = {
      id: `var-${Date.now()}`,
      name: "nueva_variable",
      value: "",
    }

    const updatedProjects = projects.map((project) => {
      if (project.id !== currentProject.id) return project

      const updatedPromptSets = project.promptSets.map((set) => {
        if (set.id !== activePromptSet.id) return set
        return { ...set, variables: [...set.variables, newVariable] }
      })

      return { ...project, promptSets: updatedPromptSets }
    })

    setProjects(updatedProjects)
  }

  const deleteVariable = (variableId: string) => {
    if (!currentProject || !activePromptSet) return

    const updatedProjects = projects.map((project) => {
      if (project.id !== currentProject.id) return project

      const updatedPromptSets = project.promptSets.map((set) => {
        if (set.id !== activePromptSet.id) return set

        const updatedVariables = set.variables.filter((variable) => variable.id !== variableId)

        return { ...set, variables: updatedVariables }
      })

      return { ...project, promptSets: updatedPromptSets }
    })

    setProjects(updatedProjects)
  }

  const clearAllVariableValues = () => {
    if (!currentProject || !activePromptSet) return

    const updatedProjects = projects.map((project) => {
      if (project.id !== currentProject.id) return project

      const updatedPromptSets = project.promptSets.map((set) => {
        if (set.id !== activePromptSet.id) return set

        const updatedVariables = set.variables.map((variable) => {
          return { ...variable, value: "" }
        })

        return { ...set, variables: updatedVariables }
      })

      return { ...project, promptSets: updatedPromptSets }
    })

    setProjects(updatedProjects)
  }

  const addPrompt = () => {
    if (!currentProject || !activePromptSet) return

    const newPrompt: Prompt = {
      id: `prompt-${Date.now()}`,
      content: "Nuevo prompt",
    }

    const updatedProjects = projects.map((project) => {
      if (project.id !== currentProject.id) return project

      const updatedPromptSets = project.promptSets.map((set) => {
        if (set.id !== activePromptSet.id) return set
        return { ...set, prompts: [...set.prompts, newPrompt] }
      })

      return { ...project, promptSets: updatedPromptSets }
    })

    setProjects(updatedProjects)
  }

  const deletePrompt = (promptId: string) => {
    if (!currentProject || !activePromptSet) return

    const updatedProjects = projects.map((project) => {
      if (project.id !== currentProject.id) return project

      const updatedPromptSets = project.promptSets.map((set) => {
        if (set.id !== activePromptSet.id) return set

        const updatedPrompts = set.prompts.filter((prompt) => prompt.id !== promptId)

        return { ...set, prompts: updatedPrompts }
      })

      return { ...project, promptSets: updatedPromptSets }
    })

    setProjects(updatedProjects)
  }

  const addPromptSet = () => {
    if (!currentProject) return

    const newPromptSet: PromptSet = {
      id: `set-${Date.now()}`,
      name: `Nuevo Set ${currentProject.promptSets.length + 1}`,
      variables: [],
      prompts: [{ id: `prompt-${Date.now()}`, content: "Nuevo prompt" }],
    }

    const updatedProjects = projects.map((project) => {
      if (project.id !== currentProject.id) return project
      return {
        ...project,
        promptSets: [...project.promptSets, newPromptSet],
      }
    })

    setProjects(updatedProjects)
    handleSelectPromptSet(newPromptSet.id)
  }

  const deletePromptSet = (promptSetId: string) => {
    if (!currentProject) return
    if (currentProject.promptSets.length <= 1) return // Prevent deleting the last prompt set

    const updatedProjects = projects.map((project) => {
      if (project.id !== currentProject.id) return project

      const updatedPromptSets = project.promptSets.filter((set) => set.id !== promptSetId)

      return { ...project, promptSets: updatedPromptSets }
    })

    setProjects(updatedProjects)

    // If the active prompt set is deleted, select another one
    if (promptSetId === activePromptSetId) {
      const updatedProject = updatedProjects.find((p) => p.id === currentProject.id)
      if (updatedProject && updatedProject.promptSets.length > 0) {
        handleSelectPromptSet(updatedProject.promptSets[0].id)
      }
    }
  }

  const updatePrompt = (promptId: string, content: string) => {
    if (!currentProject || !activePromptSet) return

    const updatedProjects = projects.map((project) => {
      if (project.id !== currentProject.id) return project

      const updatedPromptSets = project.promptSets.map((set) => {
        if (set.id !== activePromptSet.id) return set

        const updatedPrompts = set.prompts.map((prompt) => {
          if (prompt.id !== promptId) return prompt
          return { ...prompt, content }
        })

        return { ...set, prompts: updatedPrompts }
      })

      return { ...project, promptSets: updatedPromptSets }
    })

    setProjects(updatedProjects)
  }

  const updatePromptSetName = (name: string) => {
    if (!currentProject || !activePromptSet) return

    const updatedProjects = projects.map((project) => {
      if (project.id !== currentProject.id) return project

      const updatedPromptSets = project.promptSets.map((set) => {
        if (set.id !== activePromptSet.id) return set
        return { ...set, name }
      })

      return { ...project, promptSets: updatedPromptSets }
    })

    setProjects(updatedProjects)
  }

  const exportActivePromptSet = () => {
    if (!activePromptSet) return

    try {
      // Create a copy of the prompt set to export
      const promptSetToExport = { ...activePromptSet }

      // Convert to JSON string with pretty formatting
      const jsonString = JSON.stringify(promptSetToExport, null, 2)

      // Copy to clipboard
      navigator.clipboard
        .writeText(jsonString)
        .then(() => {
          alert("Conjunto de prompts exportado al portapapeles")
        })
        .catch((err) => {
          console.error("Error al copiar al portapapeles:", err)
          alert("Error al exportar. Consulta la consola para más detalles.")
        })
    } catch (error) {
      console.error("Error al exportar el conjunto de prompts:", error)
      alert("Error al exportar. Consulta la consola para más detalles.")
    }
  }

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
  }

  const handleVariableDragStart = (event: any) => {
    setActiveVariableId(event.active.id)
  }

  const handleVariableDragEnd = (event: any) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setProjects((items) => {
        return items.map((project) => {
          if (project.id !== currentProject.id) return project

          const updatedPromptSets = project.promptSets.map((set) => {
            if (set.id !== activePromptSet?.id) return set

            const oldIndex = set.variables.findIndex((variable) => variable.id === active.id)
            const newIndex = set.variables.findIndex((variable) => variable.id === over.id)

            return {
              ...set,
              variables: arrayMove(set.variables, oldIndex, newIndex),
            }
          })

          return {
            ...project,
            promptSets: updatedPromptSets,
          }
        })
      })
    }

    setActiveVariableId(null)
  }

  const handlePromptDragStart = (event: any) => {
    setActivePromptId(event.active.id)
  }

  const handlePromptDragEnd = (event: any) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setProjects((items) => {
        return items.map((project) => {
          if (project.id !== currentProject.id) return project

          const updatedPromptSets = project.promptSets.map((set) => {
            if (set.id !== activePromptSet?.id) return set

            const oldIndex = set.prompts.findIndex((prompt) => prompt.id === active.id)
            const newIndex = set.prompts.findIndex((prompt) => prompt.id === over.id)

            return {
              ...set,
              prompts: arrayMove(set.prompts, oldIndex, newIndex),
            }
          })

          return {
            ...project,
            promptSets: updatedPromptSets,
          }
        })
      })
    }

    setActivePromptId(null)
  }

  if (!currentProject) return null

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white overflow-hidden">
      {/* Navigation Bar with Tabs */}
      <NavigationBar projects={projects} currentProject={currentProject} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Prompt Set Tabs - more compact */}
        <div className="py-2 px-4 border-b border-zinc-700">
          <div className="flex items-center">
            <div className="flex-1 overflow-x-auto custom-scrollbar">
              <PromptSetTabs
                promptSets={currentProject.promptSets}
                activePromptSetId={activePromptSetId}
                onSelectPromptSet={handleSelectPromptSet}
                onUpdateName={updatePromptSetName}
                onDeletePromptSet={deletePromptSet}
              />
            </div>
            <div className="flex space-x-2 ml-2">
              <Button
                variant="outline"
                size="icon"
                onClick={addPromptSet}
                className="h-7 w-7 flex-shrink-0 bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
              >
                <PlusIcon className="h-3.5 w-3.5 text-zinc-300" />
              </Button>
              <EditModeToggle isEditMode={isEditMode} onToggle={toggleEditMode} />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={exportActivePromptSet}
                      className="h-7 w-7 flex-shrink-0 bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
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

        {/* Content Area */}
        {activePromptSet && (
          <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden h-0 min-h-0">
            {/* Variables Column - Fixed height, no scroll */}
            <div className="flex flex-col min-h-0 h-full">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleVariableDragStart}
                onDragEnd={handleVariableDragEnd}
                disabled={!isEditMode}
              >
                <PromptEditor
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

            {/* Prompts Column - With scroll */}
            <div className="flex flex-col min-h-0 h-full">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handlePromptDragStart}
                onDragEnd={handlePromptDragEnd}
                disabled={!isEditMode}
              >
                <SortableContext
                  items={activePromptSet.prompts.map((prompt) => prompt.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-0 custom-scrollbar">
                    {activePromptSet.prompts.map((prompt) => (
                      <PromptPreview
                        key={prompt.id}
                        prompt={prompt}
                        variables={activePromptSet.variables}
                        onUpdatePrompt={(content) => updatePrompt(prompt.id, content)}
                        onDeletePrompt={() => deletePrompt(prompt.id)}
                        isEditMode={isEditMode}
                      />
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activePromptId ? (
                    <div className="bg-zinc-800 rounded-md p-4 shadow-xl opacity-80">
                      <pre className="whitespace-pre-wrap text-sm p-2 bg-zinc-900 rounded min-h-[100px] max-h-[300px] overflow-y-auto">
                        {activePromptSet.prompts.find((p) => p.id === activePromptId)?.content.substring(0, 100)}
                        {activePromptSet.prompts.find((p) => p.id === activePromptId)?.content.length > 100
                          ? "..."
                          : ""}
                      </pre>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>

              {!isEditMode && (
                <div className="pt-4 flex justify-end sticky bottom-0 bg-zinc-900">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={addPrompt}
                    className="h-8 w-8 bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
                  >
                    <PlusIcon className="h-4 w-4 text-zinc-300" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
