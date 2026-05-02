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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Texto opcional para describir el propósito o contexto.
          </DialogDescription>
        </DialogHeader>
        <AutoResizeTextarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="custom-scrollbar"
          minRows={3}
          maxRows={10}
          placeholder="Descripción (opcional)"
        />
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
