"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { newId } from "@/lib/ids"
import type { SelectOption } from "@/types/prompt"

interface SelectOptionsDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (options: SelectOption[]) => void
  variableName: string
  initialOptions: SelectOption[]
}

export function SelectOptionsDialog({
  isOpen,
  onClose,
  onSave,
  variableName,
  initialOptions,
}: SelectOptionsDialogProps) {
  const [options, setOptions] = useState<SelectOption[]>(initialOptions)

  useEffect(() => {
    if (isOpen) {
      setOptions(initialOptions.length > 0 ? initialOptions : [{ id: newId("opt"), label: "", value: "" }])
    }
  }, [isOpen, initialOptions])

  const updateOption = (id: string, patch: Partial<SelectOption>) => {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  }

  const addOption = () => {
    setOptions((prev) => [...prev, { id: newId("opt"), label: "", value: "" }])
  }

  const removeOption = (id: string) => {
    setOptions((prev) => prev.filter((o) => o.id !== id))
  }

  const handleSave = () => {
    const cleaned = options
      .map((o) => ({ ...o, value: o.value.trim(), label: o.label.trim() }))
      .filter((o) => o.value !== "")
    onSave(cleaned)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Opciones de {variableName}</DialogTitle>
          <DialogDescription>
            El valor es lo que se inserta en el prompt; la etiqueta es lo que ves en el menú.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1 text-eyebrow">
            <span className="flex-1">Etiqueta</span>
            <span className="w-32">Valor</span>
            <span className="w-7" aria-hidden="true" />
          </div>
          {options.map((option) => (
            <div key={option.id} className="flex items-center gap-2">
              <Input
                value={option.label}
                onChange={(e) => updateOption(option.id, { label: e.target.value })}
                placeholder="(usa el valor)"
                className="flex-1"
              />
              <Input
                value={option.value}
                onChange={(e) => updateOption(option.id, { value: e.target.value })}
                placeholder="value"
                className="font-mono-tight w-32"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeOption(option.id)}
                aria-label="Eliminar opción"
                className="h-7 w-7 text-silver hover:text-danger-red"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addOption} className="mt-1 h-8 self-start">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Añadir opción
          </Button>
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
