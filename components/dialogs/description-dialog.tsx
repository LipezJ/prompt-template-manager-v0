"use client"

import { useEffect, useState } from "react"
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

interface DescriptionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (description: string) => void
  title: string
  initialValue: string
}

export function DescriptionDialog({ isOpen, onClose, onSave, title, initialValue }: DescriptionDialogProps) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    if (isOpen) setValue(initialValue)
  }, [isOpen, initialValue])

  const handleSave = () => {
    onSave(value)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-800 border-zinc-700 text-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Texto opcional para describir el propósito o contexto.
          </DialogDescription>
        </DialogHeader>
        <AutoResizeTextarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="bg-zinc-700 border-zinc-600 text-white custom-scrollbar"
          minRows={3}
          maxRows={10}
          placeholder="Descripción (opcional)"
        />
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
