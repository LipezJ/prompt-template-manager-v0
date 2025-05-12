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
  onDeletePrompt: (promptId: string) => void
  onAddPrompt: () => void
}

export function PromptsArea({
  prompts,
  variables,
  isCardView,
  isEditMode,
  onUpdatePrompt,
  onDeletePrompt,
  onAddPrompt,
}: PromptsAreaProps) {
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt)
  }

  const handleSaveEdit = (updatedPrompt: Prompt) => {
    onUpdatePrompt(updatedPrompt.id, updatedPrompt.content)
    setEditingPrompt(null)
  }

  return (
    <>
      <SortableContext
        items={prompts.map((prompt) => prompt.id)}
        strategy={isCardView ? rectSortingStrategy : verticalListSortingStrategy}
      >
        <div
          className={`flex-1 overflow-y-auto pr-2 ${
            isCardView ? "flex flex-wrap gap-4 content-start" : "space-y-4"
          } min-h-0 custom-scrollbar`}
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
                onDeletePrompt={() => onDeletePrompt(prompt.id)}
                isEditMode={isEditMode}
              />
            ),
          )}
        </div>
      </SortableContext>

      {!isEditMode && (
        <div className="pt-4 flex justify-end sticky bottom-0 bg-zinc-900">
          <Button
            variant="outline"
            size="icon"
            onClick={onAddPrompt}
            className="h-8 w-8 bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
          >
            <PlusIcon className="h-4 w-4 text-zinc-300" />
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
    </>
  )
}
