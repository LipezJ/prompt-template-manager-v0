"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      setContent(prompt.content)
    }
  }, [isOpen, prompt])

  const handleSave = () => {
    onSave({
      ...prompt,
      content,
    })
    onClose()
  }

  const handleTextareaFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.target.select()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-800 border-zinc-700 text-white max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar Prompt</DialogTitle>
          <DialogDescription className="text-zinc-400">Edita el contenido del prompt</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="prompt-content" className="text-sm font-medium mb-1 block">
              Contenido
            </label>
            <AutoResizeTextarea
              ref={textareaRef}
              id="prompt-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-zinc-700 border-zinc-600 text-white custom-scrollbar"
              minRows={10}
              maxRows={20}
              onFocus={handleTextareaFocus}
            />
          </div>

          <div className="bg-zinc-900 p-3 rounded-md">
            <h4 className="text-sm font-medium mb-2">Variables disponibles:</h4>
            <div className="flex flex-wrap gap-2">
              {variables.map((variable) => (
                <span
                  key={variable.id}
                  className="px-2 py-1 bg-zinc-700 rounded-md text-xs cursor-pointer hover:bg-zinc-600"
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

        <DialogFooter className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={onClose} className="bg-zinc-700 hover:bg-zinc-600 border-zinc-600">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-zinc-600 hover:bg-zinc-500 text-white">
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
