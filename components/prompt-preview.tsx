"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea"
import type { Prompt, PromptVariable } from "@/types/prompt"
import { CopyIcon, EyeIcon, MoreVertical, Pencil, Trash2, GripVertical } from "lucide-react"
import { ConfirmationDialog } from "./confirmation-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface PromptPreviewProps {
  prompt: Prompt
  variables: PromptVariable[]
  onUpdatePrompt: (content: string) => void
  onDeletePrompt: () => void
  isEditMode?: boolean
}

export function PromptPreview({
  prompt,
  variables,
  onUpdatePrompt,
  onDeletePrompt,
  isEditMode = false,
}: PromptPreviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(prompt.content)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: prompt.id,
    disabled: !isEditMode,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  }

  const replaceVariables = (text: string): string => {
    let result = text
    variables.forEach((variable) => {
      const regex = new RegExp(`{${variable.name}}`, "g")
      result = result.replace(regex, variable.value)
    })
    return result
  }

  const handleCopy = () => {
    const processedText = replaceVariables(prompt.content)
    navigator.clipboard.writeText(processedText)
  }

  const handleEdit = () => {
    setIsEditing(true)
    setIsPreviewMode(false)
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.select()
      }
    }, 0)
  }

  const handleSave = () => {
    setIsEditing(false)
    onUpdatePrompt(content)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setContent(prompt.content)
  }

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode)
    if (isEditing) {
      setIsEditing(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true)
  }

  const handleConfirmDelete = () => {
    onDeletePrompt()
  }

  const handleTextareaFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.target.select()
  }

  return (
    <div ref={setNodeRef} style={style} className={`bg-zinc-800 rounded-md p-4 ${isDragging ? "shadow-lg" : ""}`}>
      {isEditing ? (
        <div className="space-y-2">
          <AutoResizeTextarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-zinc-700 border-zinc-600 text-white custom-scrollbar"
            minRows={3}
            maxRows={20}
            onFocus={handleTextareaFocus}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleCancel}
              className="bg-zinc-700 hover:bg-zinc-600 border-zinc-600"
            >
              <span className="sr-only">Cancelar</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-zinc-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </Button>
            <Button size="icon" onClick={handleSave} className="bg-zinc-600 hover:bg-zinc-500">
              <span className="sr-only">Guardar</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-zinc-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative group">
            {isEditMode && (
              <div
                className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-5 w-5 text-zinc-500" />
              </div>
            )}
            <pre
              className={`whitespace-pre-wrap text-sm p-2 bg-zinc-900 rounded min-h-[100px] max-h-[300px] overflow-y-auto cursor-pointer custom-scrollbar ${
                isEditMode ? "pl-10" : ""
              }`}
              onClick={!isEditMode ? handleEdit : undefined}
            >
              {isPreviewMode ? replaceVariables(prompt.content) : prompt.content}
            </pre>
            <div className="absolute top-1 right-1">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-zinc-800 hover:text-zinc-300">
                    <MoreVertical className="h-3 w-3 text-zinc-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white z-50">
                  <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="text-red-400 focus:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {!isEditMode && (
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={togglePreview}
                className={`bg-zinc-700 hover:bg-zinc-600 border-zinc-600 ${isPreviewMode ? "ring-2 ring-zinc-500" : ""}`}
              >
                <EyeIcon className="h-4 w-4 text-zinc-300" />
                <span className="sr-only">Preview</span>
              </Button>
              <Button size="icon" onClick={handleCopy} className="bg-zinc-600 hover:bg-zinc-500">
                <CopyIcon className="h-4 w-4 text-zinc-300" />
                <span className="sr-only">Copy</span>
              </Button>
            </div>
          )}
        </div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar prompt"
        description="¿Estás seguro de que deseas eliminar este prompt? Esta acción no se puede deshacer."
      />
    </div>
  )
}
