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
import type { Project } from "@/types/prompt"
import { newId } from "@/lib/ids"
import { parseImportedProject } from "@/lib/storage/projects-repository"

interface ImportProjectDialogProps {
  isOpen: boolean
  onClose: () => void
  onImport: (project: Project) => void
}

export function ImportProjectDialog({ isOpen, onClose, onImport }: ImportProjectDialogProps) {
  const [jsonInput, setJsonInput] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleImport = () => {
    const result = parseImportedProject(jsonInput)
    if (!result.ok) {
      setError(result.error)
      return
    }
    const newProject: Project = { ...result.value, id: newId("project") }
    onImport(newProject)
    onClose()
    setJsonInput("")
    setError(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Proyecto</DialogTitle>
          <DialogDescription>Pega el JSON del proyecto para importarlo</DialogDescription>
        </DialogHeader>

        <Textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='{"id": "project-id", "name": "Nombre del Proyecto", "promptSets": [...]}'
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
