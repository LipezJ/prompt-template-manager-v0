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

interface ImportProjectDialogProps {
  isOpen: boolean
  onClose: () => void
  onImport: (project: Project) => void
}

export function ImportProjectDialog({ isOpen, onClose, onImport }: ImportProjectDialogProps) {
  const [jsonInput, setJsonInput] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleImport = () => {
    try {
      // Try to parse the JSON
      const projectData = JSON.parse(jsonInput)

      // Basic validation
      if (!projectData.id || !projectData.name || !Array.isArray(projectData.promptSets)) {
        throw new Error("El JSON no tiene el formato correcto de un proyecto")
      }

      // Generate a new ID to avoid conflicts
      const newProject: Project = {
        ...projectData,
        id: `project-${Date.now()}`,
      }

      onImport(newProject)
      onClose()
      setJsonInput("")
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el JSON")
    }
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
