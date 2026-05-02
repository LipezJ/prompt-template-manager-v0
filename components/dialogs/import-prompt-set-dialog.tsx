"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { PromptSet } from "@/types/prompt"
import { newId } from "@/lib/ids"
import { parseImportedPromptSet } from "@/lib/storage/projects-repository"

interface ImportPromptSetDialogProps {
  isOpen: boolean
  onClose: () => void
  onImport: (promptSet: PromptSet) => void
}

export function ImportPromptSetDialog({ isOpen, onClose, onImport }: ImportPromptSetDialogProps) {
  const [jsonInput, setJsonInput] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleImport = () => {
    const result = parseImportedPromptSet(jsonInput)
    if (!result.ok) {
      setError(result.error)
      return
    }
    const newPromptSet: PromptSet = { ...result.value, id: newId("set") }
    onImport(newPromptSet)
    onClose()
    setJsonInput("")
    setError(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Conjunto de Prompts</DialogTitle>
          <DialogDescription>
            Pega el JSON del conjunto de prompts para importarlo
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='{"id": "set-id", "name": "Nombre del Conjunto", "variables": [...], "prompts": [...]}'
          className="h-64 custom-scrollbar"
        />

        {error && <p className="mt-2 text-sm text-danger-red">{error}</p>}

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={!jsonInput.trim()}>
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
