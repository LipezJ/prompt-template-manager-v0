"use client"

import { Button } from "@/components/ui/button"
import { MoveIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EditModeToggleProps {
  isEditMode: boolean
  onToggle: () => void
}

export function EditModeToggle({ isEditMode, onToggle }: EditModeToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onToggle}
            className={`h-7 w-7 ${
              isEditMode
                ? "bg-zinc-600 hover:bg-zinc-500 text-white"
                : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300"
            }`}
          >
            <MoveIcon className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isEditMode ? "Finalizar reordenamiento" : "Reordenar elementos"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
