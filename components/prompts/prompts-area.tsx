"use client"
import { PromptPreview } from "./prompt-preview"
import { PromptCard } from "./prompt-card"
import { EditPromptModal } from "./edit-prompt-modal"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import type { Prompt, PromptVariable } from "@/types/prompt"
import { useState } from "react"
import { SortableContext, verticalListSortingStrategy, rectSortingStrategy } from "@dnd-kit/sortable"

interface PromptsAreaProps {
  prompts: Prompt[]
  variables: PromptVariable[]
  isCardView: boolean
  isEditMode: boolean
  onUpdatePrompt: (promptId: string, content: string) => void
  onUpdatePromptDescription: (promptId: string, description: string) => void
  onDeletePrompt: (promptId: string) => void
  onAddPrompt: () => void
}

export function PromptsArea({
  prompts,
  variables,
  isCardView,
  isEditMode,
  onUpdatePrompt,
  onUpdatePromptDescription,
  onDeletePrompt,
  onAddPrompt,
}: PromptsAreaProps) {
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt)
  }

  const handleSaveEdit = (updatedPrompt: Prompt) => {
    onUpdatePrompt(updatedPrompt.id, updatedPrompt.content)
    onUpdatePromptDescription(updatedPrompt.id, updatedPrompt.description ?? "")
    setEditingPrompt(null)
  }

  return (
    <div className="app-card-subtle flex h-full min-h-0 flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">Prompts</h3>
          <p className="text-xs text-fog">{prompts.length} en este set</p>
        </div>
      </div>
      <SortableContext
        items={prompts.map((prompt) => prompt.id)}
        strategy={isCardView ? rectSortingStrategy : verticalListSortingStrategy}
      >
        <div
          className={`min-h-0 flex-1 overflow-y-auto pr-2 custom-scrollbar ${
            isCardView ? "grid grid-cols-1 content-start gap-4 sm:grid-cols-2 xl:grid-cols-3" : ""
          }`}
        >
          {prompts.map((prompt) =>
            isCardView ? (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                variables={variables}
                isEditMode={isEditMode}
                onOpenModal={handleEdit}
              />
            ) : (
              <PromptPreview
                key={prompt.id}
                prompt={prompt}
                variables={variables}
                onUpdatePrompt={(content) => onUpdatePrompt(prompt.id, content)}
                onUpdateDescription={(description) => onUpdatePromptDescription(prompt.id, description)}
                onDeletePrompt={() => onDeletePrompt(prompt.id)}
                isEditMode={isEditMode}
              />
            ),
          )}
        </div>
      </SortableContext>

      {!isEditMode && (
        <div className="sticky bottom-0 flex justify-end pt-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onAddPrompt}
            className="h-9 w-9 rounded-2xl border-iron/70 bg-transparent text-fog hover:bg-graphite/40 hover:text-white"
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      )}

      {editingPrompt && (
        <EditPromptModal
          isOpen={!!editingPrompt}
          onClose={() => setEditingPrompt(null)}
          prompt={editingPrompt}
          variables={variables}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  )
}
