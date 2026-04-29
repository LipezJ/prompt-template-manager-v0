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
      <DialogContent className="bg-zinc-800 border-zinc-700 text-white">
        <DialogHeader>
          <DialogTitle>Importar Proyecto</DialogTitle>
          <DialogDescription className="text-zinc-400">Pega el JSON del proyecto para importarlo</DialogDescription>
        </DialogHeader>

        <Textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='{"id": "project-id", "name": "Nombre del Proyecto", "promptSets": [...]}'
          className="h-64 bg-zinc-700 border-zinc-600 text-white custom-scrollbar"
        />

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        <DialogFooter className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={onClose} className="bg-zinc-700 hover:bg-zinc-600 border-zinc-600">
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            className="bg-zinc-600 hover:bg-zinc-500 text-white"
            disabled={!jsonInput.trim()}
          >
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
