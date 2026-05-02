"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea"
import type { Prompt, PromptVariable } from "@/types/prompt"

interface EditPromptModalProps {
  isOpen: boolean
  onClose: () => void
  prompt: Prompt
  variables: PromptVariable[]
  onSave: (updatedPrompt: Prompt) => void
}

export function EditPromptModal({ isOpen, onClose, prompt, variables, onSave }: EditPromptModalProps) {
  const [content, setContent] = useState(prompt.content)
  const [description, setDescription] = useState(prompt.description ?? "")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      setContent(prompt.content)
      setDescription(prompt.description ?? "")
    }
  }, [isOpen, prompt])

  const handleSave = () => {
    onSave({
      ...prompt,
      content,
      description: description.trim() === "" ? undefined : description,
    })
    onClose()
  }

  const handleTextareaFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.target.select()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar Prompt</DialogTitle>
          <DialogDescription>Edita el contenido del prompt</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="prompt-content" className="mb-1 block text-sm font-medium text-white">
              Contenido
            </label>
            <AutoResizeTextarea
              ref={textareaRef}
              id="prompt-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="custom-scrollbar"
              minRows={10}
              maxRows={20}
              onFocus={handleTextareaFocus}
            />
          </div>

          <div>
            <label htmlFor="prompt-description" className="mb-1 block text-sm font-medium text-white">
              Descripcion <span className="text-xs font-normal text-silver">(opcional)</span>
            </label>
            <AutoResizeTextarea
              id="prompt-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="custom-scrollbar"
              minRows={2}
              maxRows={6}
              placeholder="Describe el proposito o contexto de este prompt"
            />
          </div>

          <div className="rounded-2xl border border-iron/70 bg-black/40 p-3">
            <h4 className="mb-2 text-sm font-medium text-white">Variables disponibles:</h4>
            <div className="flex flex-wrap gap-2">
              {variables.map((variable) => (
                <span
                  key={variable.id}
                  className="cursor-pointer rounded-md bg-[rgba(107,87,255,0.4)] px-2 py-1 text-xs text-white hover:bg-[rgba(107,87,255,0.55)]"
                  onClick={() => {
                    if (textareaRef.current) {
                      const textarea = textareaRef.current
                      const start = textarea.selectionStart
                      const end = textarea.selectionEnd
                      const newContent = content.substring(0, start) + `{${variable.name}}` + content.substring(end)
                      setContent(newContent)
                      setTimeout(() => {
                        textarea.focus()
                        textarea.setSelectionRange(start + variable.name.length + 2, start + variable.name.length + 2)
                      }, 0)
                    }
                  }}
                >
                  {`{${variable.name}}`}
                </span>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
